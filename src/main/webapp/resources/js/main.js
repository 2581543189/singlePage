

require.config({
    //配置总路径
    baseUrl : "./resources/js/scripts",

    paths : {
        // 其他模块会依赖他
        'ui.route':'../lib/angular-plugins/angular-ui-router/angular-ui-router',
        'angular' : '../lib/angular/angular',
        'angular-route' : '../lib/angular-route/angular-route',
        'angularAMD' : '../lib/angular-plugins/angularAMD',
        'css' : '../lib/requirejs/css.min',
        'jquery' : '../lib/jQuery/jquery-2.2.3.min',
        'bootstrap':'../lib/bootstrap/js/bootstrap',
        'AdminLTE':'../lib/AdminLTE-2.3.11/js/app',
        'slimScroll':'../lib/slimScroll/jquery.slimscroll',
        'fastClick':'../lib/fastclick/fastClick',
        'toastr':'../lib/toastr/toastr',
         'select2':'../lib/select2/select2',
        'ConfirmUtil':'../lib/custom/confirm/ConfirmUtil',
        'LoadingUtil':'../lib/custom/loading/LoadingUtil',
        'autocomplete':'../lib/autocomplete/autocomplete',
        'bootstrap-datepicker':'../lib/datepicker/bootstrap-datepicker',
        'moment':'../lib/moment/moment',
        'daterangepicker':'../lib/datepicker/daterangepicker',
        'jquery-ui':'../lib/jquery-ui/jquery-ui',
        'autocomplete':'../lib/autocomplete/autocomplete',
        'highcharts':'../lib/highcharts/highcharts.src',
        'bootstrap-table':'../lib/bootstrap-table/bootstrap-table',
        'angularjs-pagination':'../lib/angular-plugins/angularjs-pagination/ng-pagination',
        'angular-ui-sortable':'../lib/angular-plugins/angular-ui-sortable/angular-ui-sortable',
        'iCheck':'../lib/iCheck/icheck',
        'jquery-datepicker':'../lib/datepicker/jquery-datepicker/jquery.datetimepicker',
        'angular-datepicker':'../lib/angular-plugins/angularjs-bootstrap-datepicker/ng-datepicker',
        'xlsx-full':'../lib/angular-plugins/xlsx.full.min',
        'vue-min':'../lib/vue/vue.min'
    },

    shim : {
        // 表明该模块依赖angular
        'angularAMD' : [ 'angular'],
        'angular-route' : [ 'angular'],
        'ui.route':['angular'],
        'bootstrap':['jquery'],
        'slimScroll':['jquery'],
        'AdminLTE':{
            deps:['jquery','bootstrap','slimScroll','fastClick'],
            exports: 'AdminLTE'
        },
        'toastr':{
            deps:['jquery'],
            exports: 'toastr'
        },
        'ConfirmUtil':['../lib/custom/confirm/jquery-confirm.min'],
        'LoadingUtil':['jquery'],
        'bootstrap-datepicker':['jquery'],
        'autocomplete':['angular','jquery'],
        'jquery-ui':['jquery'],
        'bootstrap-table':['jquery'],
        'angularjs-pagination':['angular'],
        'angular-ui-sortable':['jquery','jquery-ui','angular'],
        'iCheck':['jquery'],
        'jquery-datepicker':['jquery'],
        'moment':{
            deps:[],
            exports: 'moment'
        },
        'angular-datepicker':['angular', 'jquery', 'moment', 'jquery-datepicker']
    },
    // 启动程序 js/scripts/app.js
    deps : [ 'app' ]
});


