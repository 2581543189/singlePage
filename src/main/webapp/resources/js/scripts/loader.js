define([], function() {
    return function(dependencies) {
        var definition = {
            resolver1: ['$q', '$rootScope', function($q, $rootScope) {
                var defered = $q.defer();
                require(dependencies, function() {
                    $rootScope.$apply(function() {
                        defered.resolve();
                    });
                });
                return defered.promise;
            }]
        };
        return definition;
    }
});