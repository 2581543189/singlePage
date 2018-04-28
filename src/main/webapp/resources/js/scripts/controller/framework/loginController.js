define([ 'app', "service/framework/loginService","slimScroll" ], function(app) {
    app.controller('loginController',['$scope','$state','loginService',
        function($scope, $state, loginService) {
            $scope.errorMessage="";

            $scope.formData = {};


            //点击按钮触发登录事件
            $scope.login = function() {
                loginService.login("./login", $scope.formData,
                    function(data) {
                        if(data.retcode=="0"){
                        	$state.go("index");
                        }else{
                            $scope.errorMessage=data.retdesc;
                        }
                    });
            }

        }
    ]);
});
