pragma solidity ^0.4.11;

import "./Owned.sol";

contract ChainList is Owned {

  // custom types

  struct Article{
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }

  // State variables
  mapping(uint => Article) public articles;
  uint articleCounter;

  // Events
  event sellArticleEvent (
    uint indexed id,
    address indexed _seller,
    string _name,
    uint256 _price
    );
  event buyArticleEvent(
    uint indexed id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
    );


  // sell an article
  function sellArticle(string _name, string _description, uint256 _price)
  public {
    // a new article
    articleCounter++;

    // store this article
    articles[articleCounter] = Article(
      articleCounter,
      msg.sender,
      0x0,
      _name,
      _description,
      _price
      );

    // trigger the event
    sellArticleEvent(articleCounter, msg.sender, _name, _price);
  }


    // fetch number of articles in the contract
    function getNumberOfArticles() public constant returns (uint) {
      return articleCounter;
    }


    // fetch and return all article ids available for sale
    // limitation in solidity at the moment to only return id as array not structured array
    function getArticlesForSale() public constant returns (uint[]){
      //check at least one article
      if(articleCounter == 0){
        return new uint[](0);
      }

      // prepare output arrays
      uint[] memory articleIds = new uint[](articleCounter);

      uint getNumberOfArticlesForSale = 0;

      //iterate over articles to find which ones do not have a buyer yet -- not sold yet
      for (uint i=1; i<=articleCounter; i++){
        // keep only the id for article not already sold
        if (articles[i].buyer == 0x0){
        articleIds[getNumberOfArticlesForSale] = articles[i].id;
        getNumberOfArticlesForSale++;
        }
      }

      // copy the articleIds array from above into the smaller forSale array for only articles for sale
      uint[] memory forSale = new uint[](getNumberOfArticlesForSale);
      for (uint j=0; j<getNumberOfArticlesForSale; j++){
        forSale[j] = articleIds[j];
      }

      return (forSale);
  }


    //buy an article
    function buyArticle(uint _id) payable public {

      // check at least one article
      require(articleCounter > 0);

      //check article exists
      require(_id > 0 && _id <= articleCounter);

      //retrieve the article
      Article storage article = articles[_id];

      // check that the article was not already sold
      require(article.buyer == 0x0);

      // seller cannot buy its own article
      require(article.seller != msg.sender);

      //check the value sent is equal to the value of the article
      require(article.price == msg.value);

      //keep buyers information
      article.buyer = msg.sender;

      //buyer can buy the article
      article.seller.transfer(msg.value);

      // trigger the event
      buyArticleEvent(_id, article.seller, article.buyer, article.name, article.price);

    }

    // kill the contract
    function kill() onlyOwner {
      selfdestruct(owner);
    }

}
