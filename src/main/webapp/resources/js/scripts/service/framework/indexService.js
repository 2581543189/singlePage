define(['app', 'routes', 'service/common/common-util'], function (app, routeConfig) {
    app.service('indexService', ['commonUtil', '$rootScope', '$state', function (commonUtil, $rootScope, $state) {


        var userRoleRouteMap = {
            BUSINESS_MANAGER: ['/index/error', '/index/welcome', '/index/zb/list', '/index/zb/detail', '/index/zb/edit', '/index/alert/list','/index/zb/overview', '/index/alert/detail'],
            NORMAL_USER: [ '/index/error', '/index/welcome', '/index/zb/list', '/index/zb/detail','/index/zb/overview', '/index/alert/list', '/index/alert/detail']
        };
        var NO_CHECK_URLS=['/login','/index'];

        var me = this;
        me.user = {};

        me.checkSession = function (url) {
            return commonUtil.ajaxPost(url, {}, function (data) {
                //获取用户信息，加入angular常量
                me.user = data.body;
            });
        }

        //验证用户是否有访问URL的权限.
        me.isUrlAccessibleForUser = function (route) {

            //login页面不需要权限控制
            if($.inArray(route,NO_CHECK_URLS)>=0){
                return true;
            }

            var role = commonUtil.constant.RoleEnum.getEnumById(me.user.roleId);
            if (role == commonUtil.constant.RoleEnum.SUPER_MANAGER) {
                return true;
            }
            var roleId = role.field;
            var validUrlsForRole = userRoleRouteMap[roleId];
            if (validUrlsForRole) {
                for (var j = 0; j < validUrlsForRole.length; j++) {
                    if (route.indexOf(validUrlsForRole[j]) == 0)
                        return true;
                }
                return false;
            }
        }

        //判断用户是否有某个权限
        me.userHasRole = function (role) {
            var role = commonUtil.constant.RoleEnum.getEnumByField(role);
            if (typeof(role) == 'undefined') {
                return false;
            }
            var roleId = role.roleId;
            if (me.user.roleId == roleId) {
                return true;
            }
            return false;
        }

        //绑定路由权限控制

        $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {

            var indexOfWall = newUrl.indexOf('#');
            var newSubUrl = newUrl.substring(indexOfWall + 1, newUrl.length);
            if (!me.isUrlAccessibleForUser(newSubUrl)) {
                //跳转回老的URL
                commonUtil.alertUtil.error("", "没有权限!!");
                //拒绝跳转
//                    event.preventDefault();
                $state.go("index.welcome")
            }


        });


    }]);
});