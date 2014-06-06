fusic-meteor
============

Fusic: Realtime Social Music Collaboration

The developement version runs on http://fusic.meteor.com/

If you have any modifications or additions, please send a pull request.

Installation on Linux
---------------------
1. Install meteor (https://www.meteor.com/)
   `curl https://install.meteor.com/ | sh`
2. Install meteorite (`mrt`) for meteor package management
   `sudo -H npm install -g meteorite`
3. Install the local meteorite packages
   `mrt update`
4. Run fusic locally
   `meteor`

Installation on Windows
-----------------------
- Initialize all git submodules
  `git submodule update --init --recursive`
- Update all git submodules
  `git submodule update --recursive`

More recent nodejs installation
-------------------
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs

