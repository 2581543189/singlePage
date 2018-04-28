define(['app','service/common/common-util'], function (app) {
    app.controller('monitorDataAnalysisController',['$scope','commonUtil','$state',function ($scope,commonUtil,$state) {

    	//默认跳转单个时间查询
        $scope.tab=1;
        $state.go('index.monitorDataAnalysis.singletime');

    }]);
});
