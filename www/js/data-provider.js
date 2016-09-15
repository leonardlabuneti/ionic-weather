angular.module('weatherApp')
.constant('WEATHER_API_KEY', '1793a7391dfd96588a1301e80e5f92d6')
.constant('FLICKR_API_KEY', 'a9cd0f58aae7a37c9de4ea4b4bafc642')
.constant('WEATHER_API_URL', 'http://api.openweathermap.org/data/2.5')
.factory('DataProvider', function($q, $http, FLICKR_API_KEY, WEATHER_API_KEY, WEATHER_API_URL) {
  
	/**
    * Use weather api to search for wather info for the added location
    * 	
    * @param {Object} location
    * @param {string} type  -  weather | forecast 
    *
    * @returns $q promise
    */  
	this.getWeather = function(location, type) {
    console.log(location);
		if (!type) {
			type = 'weather';
		}

        var partialQuery = '';
        if (location.coords && location.coords.latitude) {
          partialQuery = 'lat='+location.coords.latitude+
                         '&lon='+location.coords.longitude;
        } else {
          var country = location.country ? ',' + location.country : '';
          partialQuery = 'q=' + location.name + country;
        }
        
        var weatherApiUrl = WEATHER_API_URL + '/'+type+'?'+
        partialQuery+'&appid=' + WEATHER_API_KEY + '&units=metric';
        
        return $http.get(weatherApiUrl);
    };

   	/**
    * Use flickr api to search for a background image relevant to the added location
    * 	
    * @param {string} searchTags
    * @param {string} longitude
    *
    * @returns $q promise
    */
   	this.queryFlickrApi = function(searchTags){

        var deferred = $q.defer();

        //searchTags = 'chicago,sunny';
        var flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key='
        +FLICKR_API_KEY+'&tags='+searchTags+'&extras=url_n%2C+url_z%2C+url_c%2C+url_l%2C+'+
        'url_o&format=json&nojsoncallback=1&tag_mode=all';
        
        $http.get(flickrUrl).then(function(results){
            console.log('flickr search result:', results.data);

            var data = results.data ? results.data : null;

            if (data.stat!= 'ok'){
              console.log('Cannot do flickr image search, status: ', data.stat);
               return;
            }

            var photos = data && typeof data.photos.photo != 'undefined' && data.photos.photo ?  data.photos.photo : [];
            
            if(photos.length == 0) {
            	deferred.resolve('');
            	return
            }

            var randPhotoId = Math.floor((Math.random() * photos.length) + 1);
            var photoObj = photos[randPhotoId];
            var photoUrl  = ''; 
            if (typeof photoObj.url_l != 'undefined') {
            	photoUrl = photoObj.url_l;
            } else if (typeof photoObj.url_n != 'undefined') {
            	photoUrl = photoObj.url_n
            } else if (typeof photoObj.url_o != 'undefined'){
            	photoUrl = photoObj.url_o;
            } else if (typeof photoObj.url_z != 'undefined') {
            	photoUrl = photoObj.url_z;
            }
            
            deferred.resolve(photoUrl);

            console.log('Flickr selected:', photoUrl);

        },
        function(error){
          $scope.loading = false;
          var err = error.data ? error.data : 'Cannot fetch data from flickr api';
          deferred.reject(err);
        });

        return deferred.promise;
    }

    /**
    * Use google api to identify the address based on the browser coordinates
    * 	
    * @param {string} latitude
    * @param {string} longitude
    *
    * @returns $q promise
    */
    this.findAddress = function(latitude, longitude){
    	 var googleApiUrl = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+
                      latitude+','+longitude+'&sensor=true';

         return $http.get(googleApiUrl);
    }

   return {
   		getWeather: this.getWeather,
   		queryFlickrApi: this.queryFlickrApi,
   		findAddress: this.findAddress
   } 	

});