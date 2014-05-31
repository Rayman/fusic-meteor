#!/bin/sh

rm -rf bootstrap-3/fonts
rm -rf bootstrap-3/css/bootstrap-glyphicons.css
cd "git-repo/bootstrap"
git checkout -- .
git pull
grunt dist
cp dist/* ../../bootstrap-3/ -r