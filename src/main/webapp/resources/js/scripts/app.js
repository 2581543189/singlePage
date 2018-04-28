define([ 'routes', 'loader', 'angularAMD','bootstrap',
    'ui.route','toastr','autocomplete' ,'jquery','jquery-ui','angularjs-pagination','angular-ui-sortable','bootstrap-datepicker','jquery-datepicker','angular-datepicker','moment'], function(config, loader,angularAMD) {


    var app = angular.module("webapp", [ 'ui.router','ui.event', 'ui.autocomplete','ng-pagination','ui.sortable','ng-datepicker']);

    app.config(function($stateProvider, $urlRouterProvider) {
        // 配置路由
        if (config.routes != undefined) {
            angular.forEach(config.routes, function(route, path) {
                $stateProvider.state(path, {
                    templateUrl : route.templateUrl,
                    url : route.url,
                    resolve : loader(route.dependencies),
                    // allowAnonymous: route.allowAnonymous
                });
            });
        }
        // 默认路由
        if (config.defaultRoute != undefined) {
            $urlRouterProvider.when("", config.defaultRoute);
            $urlRouterProvider.otherwise(config.defaultRoute);
        }
    });


    //用户权限控制
    app.directive('allowRoles', ['indexService', 'removeElement','hideElement', function (indexService, removeElement,hideElement) {
        return{
            restrict: 'A',
            link: function (scope, element, attributes) {

                if(typeof(indexService.user.userName)=='undefined'){
                    var promise = indexService.checkSession("./website/checkSession");
                    promise.error(function (data, status, hedaers, config) {
                        realLogicCode();
                    });

                    promise.success(function (data, status, config, headers) {
                        realLogicCode();
                    });
                }else{
                    realLogicCode();
                }

                function realLogicCode(){
                    var hasAccess = false;
                    var allowedAccess = attributes.allowRoles.split(" ");
                    for (i = 0; i < allowedAccess.length; i++) {
                        if (indexService.userHasRole(allowedAccess[i])) {
                            hasAccess = true;
                            break;
                        }
                    }

                    if (!hasAccess) {
                        angular.forEach(element.children(), function (child) {
                            removeElement(child);
                        });
                        removeElement(element);
                    }
                }

            }
        }
    }]).constant('removeElement', function(element){
        element && element.remove && element.remove();
    }).constant('hideElement', function(element){
        element && element.hide && element.hide();
    });

    //
    ////定义on-finish-render监控，当view刷新完毕后会触发
    //app.directive('onFinishRender',[function(){
    //        return {
    //            restrict:'A',
    //            link:function ($scope, element, attrs, controller) {
    //                var fun = $scope.$eval(attrs.onFinishRender);//计算表达式的值
    //                if(fun && typeof(fun)=='function'){
    //                    fun();
    //                }
    //            }
    //        };
    //    }]);




    return angularAMD.bootstrap(app);
});
