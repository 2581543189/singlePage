define([], function () {
    return {
        defaultRoute: '/index/welcome',
        routes: {
            'login': {
                templateUrl: './views/framework/login.html',
                url: '/login',
                dependencies: ['controller/framework/loginController']
            },
            'index': {
                templateUrl: './views/framework/index.html',
                url: '/index',
                dependencies: ['controller/framework/indexController']
            },
            'index.error': {
                templateUrl: './views/framework/error.html',
                url: '/error',
                dependencies: ['controller/framework/errorController'],
                params:{"message":null}
            },
            'index.welcome': {
                templateUrl: './views/business/welcome.html',
                url: '/welcome',
                dependencies: ['controller/business/welcomeController']
            },
            'index.zbList': {
                templateUrl: './views/business/zb/list.html',
                url: '/zb/list',
                dependencies: ['controller/business/zb/listController']
            },
            'index.zbDetail': {
                templateUrl: './views/business/zb/detail.html',
                url: '/zb/detail:indexName',
                dependencies: ['controller/business/zb/detailController']
            },
            'index.zbDetailLow': {
                templateUrl: './views/business/zb/detailLow.html',
                url: '/zb/detailLow:indexName',
                dependencies: ['controller/business/zb/detailLowController']
            },
            'index.zbEdit': {
                templateUrl: './views/business/zb/edit.html',
                url: '/zb/edit:indexName',
                dependencies: ['controller/business/zb/editController']
            },
            'index.zbOverview': {
                templateUrl: './views/business/zb/overview.html',
                url: '/zb/overview:indexName',
                dependencies: ['controller/business/zb/overviewController']
            },
            'index.alertList': {
                templateUrl: './views/business/alert/list.html',
                url: '/alert/list',
                dependencies: ['controller/business/alert/listController']
            },
            'index.alertDetail': {
                templateUrl: './views/business/alert/detail.html',
                url: '/alert/detail:indexName',
                dependencies: ['controller/business/alert/detailController']
            },
            'index.userList': {
                templateUrl: './views/business/user/list.html',
                url: '/user/list',
                dependencies: ['controller/business/user/listController']
            },
            'index.hbase': {
                templateUrl: './views/business/tool/hbase.html',
                url: '/hbase',
                dependencies: ['controller/business/tool/hbaseController']
            },
            'myDashboard': {
                templateUrl: './views/business/zb/myDashboard.html',
                url: '/myDashboard',
                dependencies: ['controller/business/zb/myDashboardController']
            },
            'index.monitorDataAnalysis': {
                templateUrl: './views/business/tool/monitorDataAnalysis.html',
                url: '/index/monitorDataAnalysis',
                dependencies: ['controller/business/tool/monitorDataAnalysisController']
            },
            'index.monitorDataAnalysis.singletime': {
                templateUrl: './views/business/tool/singletime.html',
                url: '/index/monitorDataAnalysis/singletime',
                dependencies: ['controller/business/tool/singletimeController']
            },
            'index.monitorDataAnalysis.times': {
                templateUrl: './views/business/tool/times.html',
                url: '/index/monitorDataAnalysis/times',
                dependencies: ['controller/business/tool/timesController']
            }

            
            
        }
    };
});