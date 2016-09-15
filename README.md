# ionic-weather
ionic-weather test application using angularjs and ionic mobile framework

## Installation

    clone this repo
    cd ionic-weather
    sudo npm install -g cordova ionic gulp-cli bower
    npm install
    bower install
  
## Running Tests

    gulp test


## Running in browser

    ionic serve  --address localhost --port 8101

## Running on mobile ios emulator

    ionic platform add ios
    cordova platform update ios
    ionic build ios
    ionic emulate ios --livereload
