rsync -r src/ docs/
rsync build/contracts/Chainlist.json docs/
git add .
git commit -m "Adding frontend files to Github pages"
git push -tkazi blockchain master
