# rsync -r src/ docs/
# rsync build/contracts/ChainList.json docs/
# #echo "Ethereuem Application (solidity and truffle). Basic app to sell and buy items on the blockchain" >> README.md
# git add README.md
# git remote add origin https://github.com/tkazi/ethereum_1.git
# git commit -m "Adding frontend files to Github pages"
# git push -u origin master


rsync -r src/ docs/
rsync build/contracts/ChainList.json docs/
#echo "Ethereuem Application (solidity and truffle). Basic app to sell and buy items on the blockchain" >> README.md
git add .
git commit -m "few index.html modifications"
git push
