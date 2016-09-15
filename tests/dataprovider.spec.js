describe('testing DataProvider', function () {
    var myDataProvider, myHttpBackend, newLocation;



    beforeEach(inject(function ($rootScope, DataProvider, $httpBackend, WEATHER_API_URL, WEATHER_API_KEY) {
        myDataProvider = DataProvider;
        myHttpBackend = $httpBackend;

        newLocation = {
            'name': 'Vancouver',
            'country': 'Canada'
        };

        myHttpBackend.when('GET', WEATHER_API_URL + "/weather?q=Vancouver,Canada&appid=" + WEATHER_API_KEY + "&units=metric")
            .respond({
                "coord": {"lon": -123.12, "lat": 49.25},
                "weather": [{"id": 801, "main": "Clouds", "description": "few clouds", "icon": "02d"}],
                "base": "stations",
                "main": {"temp": 17.95, "pressure": 1022, "humidity": 77, "temp_min": 14, "temp_max": 20.56},
                "visibility": 48279,
                "wind": {"speed": 2.6, "deg": 130},
                "clouds": {"all": 20},
                "dt": 1473963832,
                "sys": {
                    "type": 1,
                    "id": 3359,
                    "message": 0.03,
                    "country": "CA",
                    "sunrise": 1473947452,
                    "sunset": 1473992549
                },
                "id": 6173331,
                "name": newLocation.name,
                "cod": 200
            });

        myHttpBackend.when('GET', 'partials/main.html').respond('');

        $rootScope.$digest();

    }));

    it('test weather api', function () {
        myDataProvider.getWeather(newLocation).then(function (results) {
            console.log('Results: ', results.data);

            expect(results.data.name).toBe(newLocation.name)
        }, function (error) {
            expect(error).toBe(null);
        });

        myHttpBackend.flush();
    });

});