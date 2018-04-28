define(['app', 'service/framework/loginService', 'service/framework/indexService', 'service/framework/skinService', 'AdminLTE', 'service/common/alert-util', 'service/common/common-util'], function (app) {
    app.controller('indexController',
        ['$scope', '$state', 'loginService', 'indexService', 'skinService','commonUtil', function ($scope, $state, loginService, indexService, skinService,commonUtil) {
            //设置页面样式
        	commonUtil.setScroll();
        	$(window).on("resize",commonUtil.setScroll());
        	$scope.taskPageUrl="http://dashboard2.mis.elong.com/schedule/TaskExceptionSummary?businessline=index-monitor";
        	
        	
        	//验证是否登陆.
            var promise = indexService.checkSession("./website/checkSession");

            promise.error(function (data, status, hedaers, config) {
                $state.go("error", {'message': '请求失败'});
                //处理失败后的响应

            });

            promise.success(function (data, status, config, headers) {
                //初始化页面
                $.AdminLTE.init();
                //增加样式模板
                skinService.setup();
                skinService.changeSkin('skin-blue');
                console.log(indexService.user);
                $scope.user = indexService.user;

                //默认跳转welcome页面
                if($scope.user.userName){
                    $state.go("index.welcome");
                }

            });

            //获取定时任务的URL
            var promise2 = commonUtil.ajaxPost("./indexManage/getScheduleUrl",{})
            promise2.error(function (data, status, hedaers, config) {
                commonUtil.alertUtil.error("","获取定时任务菜单URL失败");

            });
            promise2.success(function(data){
                if(data.retcode == 0){
                    $scope.taskPageUrl=data.body;
                }else{
                    commonUtil.alertUtil.error("","获取定时任务菜单URL发生异常,异常信息"+data.retdesc);
                }

            });


            $scope.logout = function () {
                indexService.user={};
                loginService.logout();
            }


        }]);
});
