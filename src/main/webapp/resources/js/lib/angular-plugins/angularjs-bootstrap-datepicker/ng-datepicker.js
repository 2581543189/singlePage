define([ 'jquery', 'moment', 'jquery-datepicker'], function ( $, moment,datetimepicker) {
//定义angular时间选择器
//    var moment = require("moment");
//    var datetimepicker = require("jquery-datepicker");
    angular.module("ng-datepicker", []).directive("angularDatepicker", function () {
        return {
            restrict: "EA",
            require: "ngModel",
            link: function (scope, element, attrs, ctrl) {

                var unregister = scope.$watch(function () {

                    $(element).append("<input id='date-" + attrs.dateid + "' style='text-align: center;border:none;width:100%;height:100%' " +
                    "value='" + ctrl.$modelValue + "' readonly='readonly'>");
                    $(element).css("padding", "0");

                    element.on('change', function () {
                        scope.$apply(function () {
                            ctrl.$setViewValue($("#date-" + attrs.dateid).val());
                        });
                    });

                    //element.on('click',function(){
                    $("#date-" + attrs.dateid).datetimepicker({
                        value : moment().add(-1, 'days').format('YYYY-MM-DD'),
                        maxDate: moment().add(-1, 'days').format('YYYY-MM-DD'),
                        closeOnInputClick: true,
                        closeOnWithoutClick: true,
                        timepicker: false,
                        weeks: false,
                        format: attrs.format || 'Y-m-d',
                        onClose: function () {
                            element.change();
                        }
                    });
                    //});

                    element.click();

                    return ctrl.$modelValue;
                }, initialize);

                function initialize(value) {
                    ctrl.$setViewValue(value);
                    unregister();
                }
            }
        }
    });
});

