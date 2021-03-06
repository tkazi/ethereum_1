App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // initiatlize web3 and set the provider to the testRPC
    if (typeof web3 !== 'undefined'){
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
    } else{
        // set the provider you want from web3.providers
        App.web3Provider = new
        Web3.providers.HttpProvider('http://localhost:8545');
        web3 = new Web3(App.web3Provider);
    }
    App.displayAccountInfo();
    return App.initContract();
  },

  displayAccountInfo: function() {
      // t = web3.eth.accounts;
      // console.log(t);
      web3.eth.getCoinbase(function(err, account){
        if (err === null) {
          //console.log(account);
          App.account = account;
          $("#account").text(account);
          web3.eth.getBalance(account, function(err, balance){
            if (err === null){
              $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
            }
          });
        }
      });
  },

  initContract: function() {
      $.getJSON('ChainList.json', function(chainListArtifact){
          // get the necessary contract artifact file and use it to instantiate a truffle contract abstraction
          App.contracts.ChainList = TruffleContract(chainListArtifact);

          // set the provider for our contract
          App.contracts.ChainList.setProvider(App.web3Provider);

          // listen to events
          App.listentoEvents();

          // retrieve the article from smart contract
          return App.reloadArticles();
      });
  },

  reloadArticles: function(){
      // avoid re-entry
      if(App.loading){
        return;
      }
      App.loading = true;

      //refresh account info because balance may have changed
      App.displayAccountInfo();

      var chainListInstance;

      App.contracts.ChainList.deployed().then(function(instance){
        chainListInstance = instance;
        return chainListInstance.getArticlesForSale();
      }).then(function(articleIds){
        // retrieve and clear the article placeholder
        var articlesRow = $('#articlesRow');
        articlesRow.empty();

        for (var i = 0; i < articleIds.length; i++){
          var articleId = articleIds[i];
          chainListInstance.articles(articleId).then(function(article){
            App.displayArticle(
              article[0],
              article[1],
              article[3],
              article[4],
              article[5]
            );
          });
        }
      App.loading = false;
    }).catch(function(err){
      console.log(err.message);
      App.loading = false;
    });
  },

  displayArticle: function(id, seller, name, description, price){
      var articlesRow = $('#articlesRow');

      var etherPrice = web3.fromWei(price, "ether");

      //retrieve and fill the article tempalte
      var articleTemplate = $('#articleTemplate');
      articleTemplate.find('.panel-title').text(name);
      articleTemplate.find('.article-description').text(description);
      articleTemplate.find('.article-price').text(etherPrice + " ETH");

      articleTemplate.find('.btn-buy').attr('data-id', id);
      articleTemplate.find('.btn-buy').attr('data-value', etherPrice);

      // seller
      if(seller == App.account){
        articleTemplate.find('.article-seller').text("You");
        articleTemplate.find('.btn-buy').hide();
      } else{
        articleTemplate.find('.article-seller').text(seller);
        articleTemplate.find('.btn-buy').show();
      }

      // add this new article
      articlesRow.append(articleTemplate.html());
  },

  sellArticle: function(){
      // retrieve details of the article
      var _article_name = $("#article_name").val();
      var _description = $("#article_description").val();
      var _price = web3.toWei(parseFloat($("#article_price").val() || 0 ), "ether");

      if ((_article_name.trim() == '') || (_price == 0) ){
        // nothing to sell
        return false;
      }

      App.contracts.ChainList.deployed().then(function(instance){
        return instance.sellArticle(_article_name, _description,  _price, {
          from: App.account,
          gas: 500000
        });
      }).then(function(result){
      }).catch(function(err){
          console.log(err.message);
      });
  },

  listentoEvents: function(){
      App.contracts.ChainList.deployed().then(function(instance){
          instance.sellArticleEvent( {}, {
            fromBlock: 0,
            toBlock: 'latest'
          }).watch(function(error, event){
              if(!error){
                  $("#events").append('<li class="list-group-item">' + event.args._name + ' is for sale' + '</li>');
              } else {
                console.error(error);
              }
              App.reloadArticles();
          });

          instance.buyArticleEvent( {}, {
            fromBlock: 0,
            toBlock: 'latest'
          }).watch(function(error, event){
              if(!error){
                  $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name +'</li>');
              } else {
                console.error(error);
              }
              App.reloadArticles();
          });

      });
  },

  buyArticle: function(){
      event.preventDefault();

      //retrieve the article price
      var _articleId = parseInt($(event.target).data('id'));
      var _price = parseFloat($(event.target).data('value'));

      App.contracts.ChainList.deployed().then(function(instance){
        return instance.buyArticle(_articleId, {
          from: App.account,
          value: web3.toWei(_price, "ether"),
          gas: 500000
        });
      }).then(function(result){

      }).catch(function(err){
        console.log(err);
      });
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
