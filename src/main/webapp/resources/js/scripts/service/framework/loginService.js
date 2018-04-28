define(['app', 'service/common/common-util'], function (app) {
    app.service('loginService', ['commonUtil', '$state',
        function (commonUtil, $state) {

            var me = this;

            //调用登录接口.
            me.login = function (url, data, success, $scope) {
                //验证表单
                if (data.userName == "") {
                    $scope.errorMessage = "用户名不能为空!";
                    return;
                }
                if (data.password == "") {
                    $scope.errorMessage = "密码不能为空!";
                    return;
                }
                //提交表单

                commonUtil.ajaxPost(url, data, function (response) {
                    //user = response.body;
                    //console.log(user);
                    success(response);
                });
            }

            //调用退出接口.
            me.logout = function () {
                commonUtil.ajaxPost( './logout', {}, function () {
                    $state.go("login");
                });

            }

        }]);
});
