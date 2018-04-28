define(['app', 'moment', 'service/common/common-util', 'bootstrap-datepicker', 'daterangepicker', 'select2', 'service/business/zb/editService'], function (app, moment) {
    app.controller('alertDetailController', ['$scope', 'commonUtil', '$state', '$timeout', 'zbEditService', function ($scope, commonUtil, $state, $timeout, es) {

        commonUtil.setScroll();

        //初始化事件控件.
        $scope.initDatePicker = function () {

            //设置开关
            $scope.useTime=true;
            $scope.useRecordTime=true;


            //初始化事件选择器
            $('#dataCollectTime').daterangepicker({
                "format": commonUtil.attrDefault($('#datePicker'), 'format', 'MM/DD/YYYY'),
                "timePicker": true,
                "timePicker24Hour": true,
                "timePickerIncrement": commonUtil.attrDefault($('#datePicker'), 'timePickerIncrement', false),
                "startDate": moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
                "endDate": moment().format('YYYY-MM-DD HH:mm:ss'),
                "locale": {
                    format: 'YYYY-MM-DD HH:mm:ss',
                    separator: ' - ',
                    applyLabel: '确定',
                    cancelLabel: '取消',
                    fromLabel: '从',
                    toLabel: '至',
                    daysOfWeek: ['天', '一', '二', '三', '四', '五', '六'],
                    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    firstDay: 1
                }
            }, function (start, end, label) {
                console.log("New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')");
                $scope.beginRecordTime = start.format('YYYY-MM-DD HH:mm:ss');
                $scope.endRecordTime = end.format('YYYY-MM-DD HH:mm:ss');
            });

            //初始化事件选择器
            $('#alertTime').daterangepicker({
                "format": commonUtil.attrDefault($('#datePicker'), 'format', 'MM/DD/YYYY'),
                "timePicker": true,
                "timePicker24Hour": true,
                "timePickerIncrement": commonUtil.attrDefault($('#datePicker'), 'timePickerIncrement', false),
                "startDate": moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
                "endDate": moment().format('YYYY-MM-DD HH:mm:ss'),
                "locale": {
                    format: 'YYYY-MM-DD HH:mm:ss',
                    separator: ' - ',
                    applyLabel: '确定',
                    cancelLabel: '取消',
                    fromLabel: '从',
                    toLabel: '至',
                    daysOfWeek: ['天', '一', '二', '三', '四', '五', '六'],
                    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    firstDay: 1
                }
            }, function (start, end, label) {
                console.log("New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')");
                $scope.beginTime = start.format('YYYY-MM-DD HH:mm:ss');
                $scope.endTime = end.format('YYYY-MM-DD HH:mm:ss');
            });
            //初始化事件默认值.
            var start= moment().startOf('day');
            var end=moment();
            var end=moment();
            $scope.beginRecordTime = start.format('YYYY-MM-DD HH:mm:ss');
            $scope.endRecordTime = end.format('YYYY-MM-DD HH:mm:ss');
            $scope.beginTime = start.format('YYYY-MM-DD HH:mm:ss');
            $scope.endTime = end.format('YYYY-MM-DD HH:mm:ss');
        }

        var indexName = $state.params.indexName;
        if (typeof(indexName) == 'undefined' || indexName == '') {
            alertUtil.getInstance().error("", "未获取指标名称");
            return;
        } else {
            $scope.indexName = indexName;
            $scope.tagName = '';
            $scope.tagValue = '';
            $scope.pageSize = 10;
            $scope.currentPage = 1;
            $scope.pageCount = 1;
            $scope.totalCount = 0;
            $scope.beginTime = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
            $scope.endTime = moment().format('YYYY-MM-DD HH:mm:ss');
            $scope.beginRecordTime = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
            $scope.endRecordTime = moment().format('YYYY-MM-DD HH:mm:ss');
        }
        $scope.initDatePicker();


        //获取所有报警信息.
        $scope.queryAlertDetail = function () {

            var AlertHistoryQueryVo = {};
            AlertHistoryQueryVo['indexName'] = $scope.indexName;
            if ($scope.tagName != '') {
                AlertHistoryQueryVo['tagName'] = $scope.tagName;
            }
            if ($scope.tagValue != '') {
                AlertHistoryQueryVo['tagValue'] = $scope.tagValue;
            }
            var dataCollectTimeEmpty = false;
            if (typeof($scope.beginRecordTime) == 'undefined' || $scope.beginRecordTime == '' || typeof($scope.endRecordTime) == 'undefined' || $scope.endRecordTime == '') {
                dataCollectTimeEmpty = true;
            }
            var alertTimeEmpty = false;
            if (typeof($scope.beginTime) == 'undefined' || $scope.beginTime == '' || typeof($scope.endTime) == 'undefined' || $scope.endTime == '') {
                alertTimeEmpty = true;
            }
            if (dataCollectTimeEmpty && alertTimeEmpty) {
                commonUtil.alertUtil.error("", "请至少选择一个选择时间范围");
                return;
            }
            if (!$scope.useTime && !$scope.useRecordTime) {
                commonUtil.alertUtil.error("", "请至少选择一个选择时间范围");
                return;
            }

            if($scope.useTime){
                AlertHistoryQueryVo['beginTime'] = $scope.beginTime;
                AlertHistoryQueryVo['endTime'] = $scope.endTime;
            }
            if($scope.useRecordTime){
                AlertHistoryQueryVo['beginRecordTime'] = $scope.beginRecordTime;
                AlertHistoryQueryVo['endRecordTime'] = $scope.endRecordTime;
            }

            AlertHistoryQueryVo['pageSize'] = $scope.pageSize;
            AlertHistoryQueryVo['pageNum'] = $scope.currentPage;

            console.log("请求入参:", AlertHistoryQueryVo);
            var param = {
                alertHistoryQueryVoStr: JSON.stringify(AlertHistoryQueryVo)
            };

            var promise = commonUtil.ajaxPost('./indexAlert/getIndexAlertList', param);

            promise.success(function (data) {
                if (data.retcode != 0) {
                    commonUtil.alertUtil.error("", "获取数据失败，异常信息:" + data.retdesc);
                } else {
                    console.log("接口返回:", data.body);

                    $scope.alertList = [];
                    for (i in data.body.list) {
                        var obj = {};
                        obj["collectTime"] = data.body.list[i].collectTime;
                        obj["currentTime"] = data.body.list[i].currentTime;
                        obj["showSub"] = false;

                        var tags = [];
                        //TODO:解析详情.
                        var alertDetails = [];
                        for (j in data.body.list[i].alertDetails) {
                            var sub = data.body.list[i].alertDetails[j];

                            var subObj = {};
                            //标签
                            subObj["tag"] = sub.tag;

                            //描述
                            var alertType = commonUtil.constant.AlermMode.getEnumByField(sub.alermMode);
                            var compareType = commonUtil.constant.CompareType.getEnumById(sub.compareType);
                            var threshold = sub.threshold;
                            var timeWindow=-1;
                            var unknow={
                                desc:'未知'
                            }
                            var relativeType=unknow;
                            var alertDataType=unknow;
                            if(sub.timeWindow){
                                timeWindow = sub.timeWindow;
                            }
                            if(sub.relativeType){
                                relativeType=commonUtil.constant.RelativeType.getEnumById(sub.relativeType);
                            }
                            if(sub.alertDataType){
                                alertDataType = commonUtil.constant.AlertDataType.getEnumById(sub.alertDataType);
                            }

                            subObj["desc"] = commonUtil.getAlertDesc(alertType, compareType, threshold,timeWindow,relativeType,alertDataType);

                            tags.push(subObj["tag"] + " [" + subObj["desc"] + "]");
                            //当前值
                            if (alertType == commonUtil.constant.AlermMode.ABSOLUTE) {
                                //绝对值
                                subObj["current"] = sub.currentValue;
                            } else {
                                //相对值
                                var absolute = sub.currentValue;
                                var relative = (sub.currentValue / sub.historyThreshold * 100).toFixed(2);

                                subObj["current"] = "[" + absolute + "] / [" + sub.historyThreshold + "] = [" + relative + "%]";

                            }

                            alertDetails.push(subObj);


                        }
                        obj["alertDetails"] = alertDetails;
                        obj["tags"] = tags;

                        $scope.alertList.push(obj);
                    }

                    $scope.pageCount = Math.ceil(data.body.count / $scope.pageSize);
                    $scope.totalCount = data.body.count;
                }
            });

            promise.error(function () {
                commonUtil.alertUtil.error("", "获取数据失败");
            });
        }

        $scope.queryAlertDetail();


        //真实业务逻辑代码
        function realLogicCode() {
            $timeout(function () {
                //$scope.initDatePicker();
                $("[data-toggle='popover']").popover();
            });
        }

        realLogicCode();
        //展示隐藏
        $scope.doToggle = function (index) {
            var realIndex = index;

            if ($scope.alertList[realIndex].showSub) {
                $scope.alertList[realIndex].showSub = false;
            } else {
                $scope.alertList[realIndex].showSub = true;
            }

        }

        //切换页数事件
        $scope.onPageChange = function () {
            // ajax request to load data
            //console.log($scope.currentPage);
            $scope.queryAlertDetail();
        };


        //报警valuehtml
        $scope.alertValuesHtmls = function (index) {
            var alert = $scope.alertList[index];
            var text = "<table><tbody>"
            for (i in alert.tags) {
                text += "<tr><td>" + alert.tags[i] + "</td></tr>"
            }

            text += "</tbody></table>";
            return text;

        }

        /*
         * popover适应angularjs
         * */
        $scope.popoverShow = function ($event) {
            var obj = $event.target;
            $(obj).popover('show');
        }
        $scope.popoverHide = function ($event) {
            var obj = $event.target;
            $(obj).popover('hide');
        }

    }]);
});