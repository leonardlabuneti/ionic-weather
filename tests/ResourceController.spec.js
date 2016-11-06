// load the necessary modules
beforeEach(module('weatherApp'));

describe('testing ResourceController', function () {
    var scope, ResourceController, myDataProvider;

    beforeEach(inject(function ($rootScope, $controller, _$q_, DataProvider) {
        scope = $rootScope.$new();
        $controller('ResourceController', { $q: _$q_, $scope: scope });
        myDataProvider = DataProvider;
    }));

    // tests start here
    it('should have metric units by default (celsius)', function () {
        expect(scope.units).toEqual('metric');
    });

    it('should switch to imperial units', function () {
        var newUnit = 'imperial';
        scope.switchUnits(newUnit);
        expect(scope.units).toBe(newUnit);
    });

    it('should be able to add new city and get forecast for the added city', function () {

        var newLocation = {
            'city': 'Vancouver',
            'country': 'Canada'
        };
        if (typeof scope.addCity == 'function') {
            scope.addCity(newLocation).then(function (results) {
                //expect new location to be present into locations arr
                expect(scope.locations.length).toBe(1);

            }, function (error) {
                expect(error).toBe(null);
            });
        }
    });

});