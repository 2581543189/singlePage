define(['app', 'moment', 'highcharts', 'daterangepicker', 'service/common/common-util', 'select2', 'service/business/zb/editService', 'service/test/lineTestService','iCheck'], function (app, moment) {
    app.controller('zbDetailLowController', ['$scope', 'commonUtil', '$state', '$timeout', 'zbEditService', 'lineTestService', function ($scope, commonUtil, $state, $timeoute, es, lineTestService) {
        console.log("zbDetailController");
        //设置BODYSCROLL
        commonUtil.setScroll();
        var indexName = $state.params.indexName;
        if (typeof(indexName) == 'undefined' || indexName == '') {
            commonUtil.alertUtil.error("", "未获取指标名称");
            return;
        } else {
            //获取指标信息
            var promise = commonUtil.ajaxPost('./indexManage/getIndexDetail', {
                'indexName': indexName
            });
            promise.success(function (data) {
                if (data.retcode == "0") {
                    $scope.indexName = data.body.indexName;
                    $scope.indexNameCn = data.body.indexNameCn;

                    $scope.customParam={};

                    //设置小数点保留位数
                    if (data.body.dataClassify == 'NumType') {
                        $scope.customParam['afterZero'] = 0;
                        $scope.isPercentage=false;
                    } else {
                        $scope.customParam['afterZero'] = 2;
                        $scope.isPercentage=true;
                    }
                    //是否百分比指标

                    //设置y轴起始值
                    if(data.body.ordinate){
                        $scope.customParam['ordinate'] = parseInt(data.body.ordinate);
                    }else{
                        $scope.customParam['ordinate'] =0;
                    }

                    //设置所有标签
                    var tags = [];
                    if (data.body.indexTagDetails.length == 1) {//只有一个标签特殊处理
                        tags.push(data.body.indexTagDetails[0]);

                    } else {//不只有一个标签
                        var str = data.body.tagGroupInfos[0];
                        var array = str.split('::');
                        for (k in array) {
                            for (l in data.body.indexTagDetails) {
                                if (array[k] == data.body.indexTagDetails[l].tagName) {
                                    tags.push(commonUtil.deepCopy(data.body.indexTagDetails[l]));
                                    break;
                                }
                            }
                        }
                    }


                    $scope.tags = tags;

                    var tagMap={};
                    for(i in tags){
                        var tagName = tags[i].tagName;
                        var tagValues = tags[i].tagValues;
                        var subMap = {};
                        for(j in tagValues){
                            subMap[tagValues[j].name] = tagValues[j].nameCn;
                        }
                        tagMap[tagName] = subMap;
                    }
                    $scope.tagMap = tagMap;


                    //添加All选项
                    var all = {
                        name: "total",
                        nameCn: "汇总"
                    }
                    for (i in $scope.tags) {
                        $scope.tags[i].tagValues.unshift(all);
                    }

                    $scope.tagParam = [];
                    //设置默认值
                    for (i in $scope.tags) {
                        var array = [];
                        //if (i == '0') {
                        //    for (j in tags[i].tagValues) {
                        //        if (j > 0) {
                        //            array.push(tags[i].tagValues[j]);
                        //        }
                        //    }
                        //} else {
                        array.push(all);
                        //}
                        $scope.tagParam.push(array);
                    }

                    //设置table
                    $scope.totalList=[];
                    
                    $scope.relativeTypeOptions = [commonUtil.constant.RelativeType.DOD,commonUtil.constant.RelativeType.WOW,commonUtil.constant.RelativeType.SPECIFIC_DAY];
                    
                    //queryType
                    $scope.queryType=1;
                    //dataType
                    $scope.dataType=$scope.relativeTypeOptions[0].id;

                    $scope.compareDate=moment().add(-1, 'days').format('YYYY-MM-DD');

                    realLogicCode();
                } else {
                    commonUtil.alertUtil.error("", "获取数据失败,异常信息" + data.retdesc);
                    $state.go('index.zbList');
                    return;
                }


            });
            promise.error(function () {
                commonUtil.alertUtil.error("", "获取数据失败");
                //获取数据失败，展示更新页面.
                $state.go('index.zbList');
                return;

            });
        }

        //真实业务逻辑代码.
        function realLogicCode() {
            $timeoute(function () {
                $scope.initDatePicker();
                $(".select2").select2({allowClear: true});
                $("[name=queryType]").iCheck({
                    labelHover : false,
                    cursor : true,
                    checkboxClass : 'icheckbox_square-blue',
                    radioClass : 'iradio_square-blue',
                    increaseArea : '20%'
                }).on('ifChecked', function(event){ //ifCreated 事件应该在插件初始化之前绑定
                    $scope.$apply(function(){
                        $scope.queryType=$(event.currentTarget).val();
                    });
                });
                $("[name=dataType]").iCheck({
                    labelHover : false,
                    cursor : true,
                    checkboxClass : 'icheckbox_square-blue',
                    radioClass : 'iradio_square-blue',
                    increaseArea : '20%'
                }).on('ifChecked', function(event){ //ifCreated 事件应该在插件初始化之前绑定
                	 $scope.$apply(function(){
                		 $scope.dataType = $(event.currentTarget).val();
                	 });
                });
            });
            $('#saveSubsctibedPop').modal({
                backdrop: false,
                keyboard: false,
                show: false
            });

        }

        //select选中时候，如果内容包含ALL，并且不只有All 删除all
        $scope.selectChange = function (index) {
            if (index > $scope.tagParam.length - 1) {
                commonUtil.alertUtil.error("", "index" + index + "异常");
                return;
            }
            var array = $scope.tagParam[index];
            if (array.length > 1) {
                for (i in array) {
                    if (array[i].name == 'total') {
                        array.splice(i, 1);
                    }
                }
            }
        }

        //select全选
        $scope.selectAll = function (index) {
            if (index > $scope.tagParam.length - 1) {
                commonUtil.alertUtil.error("", "index" + index + "异常");
                return;
            }
            $scope.tagParam[index] = [];
            var target = $scope.tags[index];
            for (i in target.tagValues) {
                if (i > 0) {
                    $scope.tagParam[index].push(target.tagValues[i]);
                }
            }
            $timeoute(function () {
                $(".select2").select2({allowClear: true});
            });
        }

        //查询曲线图
        $scope.queryLine = function () {

        	console.log($scope.queryType);
            var param = {};

            try {
                param = $scope.validateForm();
            } catch (e) {
                commonUtil.alertUtil.error("", e.message);
                return;
            }

            var lines = param.tableMap.dashboard0;
            if (lines.length > 20) {
                commonUtil.ConfirmUtil.showConfirm("曲线数量超过20条，会影响最终展示效果，确认要继续查询吗?", function () {
                    getData(param);
                });

            } else {
                getData(param);
            }


            function getData(param) {

                var realParam = {
                    indexMonitorVoStr: JSON.stringify(param)
                }

                var promise = commonUtil.ajaxPost('./indexMonitor/getIndexData', realParam);

                promise.success(function (data) {
                    if (data.retcode != '0') {
                        commonUtil.alertUtil.error("", "获取数据失败,异常信息" + data.retdesc);
                    } else {

                        if (data.body == null) {
                            commonUtil.alertUtil.error("", "获取数据为空");
                            return;
                        }
                        //var chars = lineTestService.getFakeData(param);
                        console.log("返回数据:{}", data.body);
                        if($scope.queryType=='1'){
                            //折线图
                            var dbs = data.body;
                            for (name in dbs) {
                                var id = parseInt(name.substr(name.length - 1, name.length));

                                var lineData = dbs[name].charts;
                                if (typeof(lineData) == 'undefined' || lineData.length == 0) {
                                    commonUtil.alertUtil.error("", "图表" + id + "获取数据为空");
                                    continue;
                                }
                                //获取标准时间列表
                                var dates = lineTestService.getAllTimes(lineData);


                                for (lineName in lineData) {
                                    lineData[lineName] = lineTestService.fillOneLine(dates, lineData[lineName],$scope.isPercentage);
                                }
                                lineData = lineTestService.translateLineName(lineData,$scope.tagMap);

                                lineTestService.initLine($("#highchars" + id), dates, lineData, $scope.customParam);
                                //计算每条曲线total
                                $scope.totalList=lineTestService.calculateTotal(lineData,$scope.isPercentage);
                                //console.log(totalMap);
                                //添加时间
                                for(i in $scope.totalList){
                                    $scope.totalList[i].timeRange = $scope.timeRangeStr;
                                }


                            }
                        }else{
                            //折线饼图
                            var dbs = data.body;

                            //TODO:构造假的原始数据
                            for (name in dbs) {
                                var id = parseInt(name.substr(name.length - 1, name.length));
                                //曲线只有一根
                                var lineData = dbs[name].charts;
                                if (typeof(lineData) == 'undefined' || lineData.length == 0) {
                                    commonUtil.alertUtil.error("", "图表" + id + "获取数据为空");
                                    continue;
                                }
                                var histogramData = commonUtil.deepCopy(lineData);
                                for(i in histogramData){
                                    histogramData[i].value = histogramData[i].historyValue;
                                }
                                //替换名字
                                var lineData2 = {};
                                for(n in lineData){
                                    lineData2[n+"(今日)"] = lineData[n];
                                }
                                lineData = lineData2;
                                var histogramData2={};
                                for(n in histogramData){
                                    histogramData2[n+"("+$scope.dataType+")"] = histogramData[n];
                                }
                                histogramData = histogramData2;


                                //获取标准时间列表
                                var dates = lineTestService.getAllTimes(lineData);

                                //补充数据
                                for (lineName in lineData) {
                                    lineData[lineName] = lineTestService.fillOneLine(dates, lineData[lineName],$scope.isPercentage);
                                }

                                for (lineName in histogramData) {
                                    histogramData[lineName] = lineTestService.fillOneLine(dates, histogramData[lineName],$scope.isPercentage);
                                }

                                //展示折线图
                                lineTestService.initLineAndHistogram($("#highchars" + id), dates, histogramData,lineData, $scope.customParam);
                                //计算每条曲线total
                                var list1 = lineTestService.calculateTotal(lineData,$scope.isPercentage);
                                var list2 = lineTestService.calculateTotal(histogramData,$scope.isPercentage);
                                for(i in list2){
                                    list1.push(list2[i]);
                                }

                                var theDataType = commonUtil.constant.RelativeType.getEnumById($scope.dataType);


                                //添加时间
                                for(i in list1){
                                    if(i == 0){
                                        list1[i].timeRange = $scope.timeRangeStr;
                                    }else{
                                        list1[i].timeRange = lineTestService.calculateTimeRangeByDateType($scope.timeRangeStr,theDataType,$scope.compareDate);
                                    }

                                }

                                $scope.totalList=list1;
                                //console.log(totalMap);
                            }


                        }




                    }

                });
                promise.error(function (data) {
                    commonUtil.alertUtil.error("", "获取数据失败");
                });


            }

        }
        //验证表单
        $scope.validateForm = function () {
            var param = {};
            //验证入参时间
            if (typeof $scope.timeRangeStr == "undefined" || $scope.timeRangeStr == "") {
                throw new Error("请选择时间段");
            }
            var timeRangeArr = $scope.timeRangeStr.split(" - ");
            var startTime = timeRangeArr[0];
            var endTime = timeRangeArr[1];
            param["beginTime"] = startTime;//moment(startTime, "YYYY-MM-DD HH").format("YYYYMMDDHH");
            param["endTime"] = endTime;//moment(endTime, "YYYY-MM-DD HH").format("YYYYMMDDHH");
            //indexName
            param["indexName"] = $scope.indexName;

            //不能全是空或者全是TOTAL
            var notTotal = false;
            for (i in $scope.tagParam) {
                if ($scope.tagParam[i].length == 0) {
                    throw new Error("标签值不能为空，请至少选择汇总");
                }
                if ($scope.tagParam[i].length > 1 || ($scope.tagParam[i].length == 1 && $scope.tagParam[i][0].name != "total")) {
                    notTotal = true;
                }
            }

            //设置查询条件List
            var lines = [];
            if (!notTotal) {
                lines = ['ALL=ALL'];

            } else {
                var tempArray = [];
                for (i in $scope.tagParam) {
                    //首次循环
                    if (lines.length == 0) {
                        if ($scope.tagParam[i].length == 1 && $scope.tagParam[i][0].name == "total") {
                            continue;
                        } else {
                            for (j in $scope.tagParam[i]) {
                                var lineName = $scope.tags[i].tagName + "=" + $scope.tagParam[i][j].name;
                                tempArray.push(lineName);
                            }
                        }

                    } else {
                        if ($scope.tagParam[i].length == 1 && $scope.tagParam[i][0].name == "total") {
                            continue;
                        } else {
                            for (j in $scope.tagParam[i]) {
                                var lineName = $scope.tags[i].tagName + "=" + $scope.tagParam[i][j].name;
                                for (k in lines) {
                                    var tempLineName = lines[k] + "_" + lineName;
                                    tempArray.push(tempLineName);
                                }
                            }
                        }

                    }
                    lines = tempArray;
                    tempArray = [];
                }
            }

            //若组合图，只允许一条曲线
            if($scope.queryType=='2'){
                if(lines.length > 1){
                    throw new Error("组合图只允许查询一条曲线图");
                }
            }

            console.log("查询条件:" + lines);
            var tableMap = {
                dashboard0: lines
            }
            param["tableMap"] = tableMap;

            //添加relativeType
            if($scope.queryType=='2'){
                param["relativeType"] = $scope.dataType;
            }

            //如果queryType=5添加compareDate
            if($scope.dataType==commonUtil.constant.RelativeType.SPECIFIC_DAY.id){
                if($scope.compareDate==""){
                    throw new Error("比较日期不能为空");
                }else{
                    param["compareDate"] = $scope.compareDate;
                }

            }

            return param;

        }


        //初始化事件控件.
        $scope.initDatePicker = function () {


            //初始化事件选择器
            $('#datePicker').daterangepicker({
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
                //console.log("New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')");
                //$scope.startTime = start.format('YYYY-MM-DD HH:mm:ss');
                //$scope.endTime = end.format('YYYY-MM-DD HH:mm:ss');
                $timeoute(function () {
                    $scope.timeRangeStr = start.format('YYYY-MM-DD HH:mm:ss') + " - " + end.format('YYYY-MM-DD HH:mm:ss');
                });
            });
            var start = moment().startOf('day');
            var end = moment();
            $scope.timeRangeStr = start.format('YYYY-MM-DD HH:mm:ss') + " - " + end.format('YYYY-MM-DD HH:mm:ss');
        }
        //添加到收藏面板弹窗
        $scope.showSubsctibedPop=function(){
        	$('#saveSubsctibedPop').modal('toggle');
        }
        //保存当前查询条件.
        $scope.saveParams = function () {
            var param = {};
            try {
                param = $scope.validateForm();
            } catch (e) {
                commonUtil.alertUtil.error("", e.message);
                return;
            }

            //封装参数
            var subscribedTablePo = {};
            var desc=$("#desc").val();
            var groupName=$("#groupName").val();
            subscribedTablePo['indexName'] = $scope.indexName;
            subscribedTablePo['desc'] = desc;
            subscribedTablePo['yPlot'] = [];
            subscribedTablePo['groupName']=groupName;
            subscribedTablePo['tableQueryCriterias'] = param.tableMap.dashboard0;
            //relativeType
            if($scope.queryType=='2'){
                if($scope.dataType==commonUtil.constant.RelativeType.SPECIFIC_DAY.id){
                    commonUtil.alertUtil.error("", "折线图数据为'指定日期'时不允许收藏");
                    return;
                }
                subscribedTablePo['relativeType'] = $scope.dataType;

            }

            //confirm
            commonUtil.ConfirmUtil.showConfirm("确定要收藏该查询条件到我的面板吗?", function () {
                //请求
                var requestParam = {};
                requestParam = {
                    monitorVoStr: JSON.stringify(subscribedTablePo)
                };

                var promise = commonUtil.ajaxPost('./mySubscribedTable/saveSubsctibed', requestParam);

                promise.success(function (response) {
                    if (response.retcode == '0') {
                    	$("#saveSubsctibedPop").modal('hide');
                        commonUtil.alertUtil.info("", "收藏成功!");
                        if($('#checkbox-id').is(':checked')) {
                        	var pathName = window.document.location.href;
                        	var rc_contextPath=pathName=pathName.substring(0, pathName.indexOf("#")+1);
                        	window.location=rc_contextPath+"/myDashboard";
                        }
                    } else {
                        commonUtil.alertUtil.error("", "请求失败,异常信息：" + response.retdesc);
                    }
                });

                promise.error(function () {
                    commonUtil.alertUtil.error("", "请求失败");
                });

            });


        }


    }]);
});