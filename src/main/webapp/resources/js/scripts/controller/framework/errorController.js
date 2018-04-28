define(['app','angular','angular-route'], function (app) {
    app.controller('errorController',
        ['$scope','$state',function ($scope, $stateParams) {
            $scope.errorMessage=$stateParams.message;

        }]);
});
