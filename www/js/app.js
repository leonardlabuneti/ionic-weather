// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var weatherApp = angular.module('weatherApp', ['ionic', 'ui.router'])
.config(function($stateProvider, $urlRouterProvider) {

  // For any unmatched url, redirect to /
  $urlRouterProvider.otherwise("/");

  // Now set up the states
  $stateProvider
    .state('main', {
      url: "/",
      templateUrl: "partials/main.html",
      controller: 'ResourceController'
    });
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

angular.module('weatherApp').controller('ResourceController',['$q','$scope', 
     '$ionicModal', '$ionicPopup', 'DataProvider', ResourceController]);

function ResourceController($q, $scope,
       $ionicModal, $ionicPopup, DataProvider) {
    
    //initialize variables
    $scope.units = 'metric';
    $scope.loading = true;
    $scope.locations = [];
    $scope.backgroundImg = '';

    /**
    * @param {string} newUnit 
    *
    */
    $scope.switchUnits = function(newUnit){
      $scope.units = newUnit;
    }

    /**
    * try to get the browser location if allowed
    *
    * @returns $q promise
    */
    $scope.getLocation = function(){

      var deferred = $q.defer();

      if (!navigator || !navigator.geolocation){
         deferred.reject('Cannot get access to user location');
         return;
      }

      navigator.geolocation.getCurrentPosition(function(position){

          if (!position) {
              deferred.reject('Cannot get access to user location');
              return
          }

          console.log('Detected position:',position);
          
          DataProvider.findAddress(position.coords.latitude, 
            position.coords.longitude).then(function(result){
              
              var result = result.data && result.data.results && 
              typeof result.data.results[0] != 'undefined' ? result.data.results[0] : null;

              addressComponents = result.formatted_address.split(',');

              position.city = typeof addressComponents[1] != 'undefined' ? addressComponents[1] : '';
              position.formatted_address = result.formatted_address;
              position.country = typeof addressComponents[2] != 'undefined' ? addressComponents[2] : '';          
              deferred.resolve(position);

           }, function (error) {
              deferred.reject (error);
           });
      }, function(error){
          console.log('get location error:', error);
          if (error && error.message) {
              deferred.reject(error.message);
          } else {
              deferred.reject('Application needs access to browser location.');
          }
        });

      return deferred.promise;
    };

    /**
    * Handle location row click
    *
    * @param {integer} index
    *
    */
    $scope.selectedLocation = function(index){

        //reset all previous selections
        for (var i in $scope.locations){
          $scope.locations[i].selected = false;
        }

        //select the current location
        $scope.locations[index].selected = true;

        //change the background image for the selected location
        $scope.backgroundImg = $scope.locations[index].backgroundImg;
    };

    /**
    * Get the 5 days forecast for the selected location
    *
    * @param {integer} index
    *
    */
    $scope.getForecast = function(index){

        var deferred = $q.defer();

        var selectedLocation = $scope.locations[index];

        if (!selectedLocation){
            deferred.reject('Invalid location index');
            return;
        }

        //if we have the forecast downloaded already we make it visible
        if (selectedLocation.forecast) {
           selectedLocation.forecastVisible = !selectedLocation.forecastVisible;
           deferred.resolve(selectedLocation);
           return;
        }


        DataProvider.getWeather(selectedLocation, 'forecast').then(function(results){
           var res = typeof results.data.list != 'undefined' ? results.data.list : null;

           if (res){
              console.log('Attached forecast data:', res);

              selectedLocation.forecast = []
              var prevDay = null;
              for (var i in res) {
                if (typeof res[i] == 'undefined' || selectedLocation.forecast.length == 5) {
                  break;
                }

                var dateSplit = (new Date(res[i].dt_txt)+'').split(' ');
                var formattedDate = dateSplit[2] + ' ' + dateSplit[1];

                //the api returned data contains multiple records for the same day
                if (prevDay == dateSplit[2]) {
                   continue;
                }

                prevDay = dateSplit[2];

                selectedLocation.forecast.push({
                  date : formattedDate,
                  temp : res[i].main.temp,
                  temp_min: res[i].main.temp_min,
                  temp_max: res[i].main.temp_max,
                });
              }
              
              deferred.resolve(selectedLocation);
           }

           console.log('Forecast results:', selectedLocation.forecast);
        }, function(error){
             $scope.loading = false;
             var err = error.data ? error.data : 'Cannot fetch data from weather api';
             $scope.notify('Error',err);
             deferred.reject(err);
        });  

        return deferred.promise;
    };

    /*
    * Handle the api results callback
    *
    * @param {Object} results
    *
    */
    $scope.handleResults = function(results){

      if (!results) {
        $scope.loading = false;
        return;    
      }

      console.log('Weather results:', results.data);
      var location = results.data;
      
      //show the gps location icon for the detected location
      if ($scope.geolocation == location.name) {
          location.currentLocation = true;
      }

      //TODO: - refine search 
      // var description = Array.isArray(location.weather) 
      //   && location.weather.length >0  ? ','+location.weather[0].description : ''
      
      var tags  = location.name;

      DataProvider.queryFlickrApi(tags).then(function(result) {
          location.backgroundImg = result;
          $scope.locations.push(location);

          $scope.backgroundImg = $scope.locations[0].backgroundImg;

      },function(error){
        $scope.locations.push(location);
        $scope.notify('Error',error); 
      });
      $scope.loading = false;
    };

    /**
    * Notification popup
    *
    * @param {string} title 
    * @param {string} message 
    */
    $scope.notify = function(title, message){
        var alertPopup = $ionicPopup.alert({
           title: title,
           template: message
         });

         alertPopup.then(function(res) {
           console.log('Notified');
         });
    }
      
    //try to get the browser location      
    var promise = $scope.getLocation($q, $scope);
    if (typeof promise == 'undefined'){
      console.log('googleapi - Cannot access location');
      return;
    }
    
    promise.then(function(location){
        
        console.log('Adding default location :',location);
        if (location.city) {
          $scope.geolocation = location.city.replace(' ','');
        }
        
        DataProvider.getWeather(location).then($scope.handleResults, function(error){
             $scope.loading = false;
             var err = error.data ? error.data : 'Cannot fetch data from weather api';
             $scope.notify('Error',err);
        });  
        
      }, function(error){
          $scope.loading = false;
          $scope.notify('Cannot access user location',error);
      });

    //create add location modal
    $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    /*
    * Triggers add location modal
    *
    * @param {Object} newLocation 
    * newLocation = {'city': 'Vancouver',
    *                        'country': 'Canada'
    *                        };
    */
    $scope.addCity = function(newLocation) {
        
        var deferred = $q.defer();

        if (!newLocation){
          $scope.notify('Error', 'Please add city');
          return;
        }
        $scope.loading = true;
        console.log('Adding city :', newLocation);
        
        if($scope.modal){
          $scope.modal.hide();
        }
          
        var location  = {
           name: newLocation.city,
           country: newLocation.country
        }

        DataProvider.getWeather(location).then(function(results){
          $scope.handleResults(results);
          deferred.resolve(results);
          }, function(error){
             $scope.loading = false;
             var err = error.data ? error.data : 'Cannot fetch data from weather api';
             $scope.notify('Error',err);
             deferred.reject(err);
        });  

        return deferred.promise;
    }
}





