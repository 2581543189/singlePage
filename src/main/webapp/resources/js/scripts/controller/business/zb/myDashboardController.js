define(['app', 'moment', 'jquery-ui', 'service/common/common-util', 'service/test/lineTestService'], function (app, moment) {
    app.controller('myDashboardController', ['$scope', 'commonUtil', '$timeout', 'lineTestService', '$interval', function ($scope, commonUtil, $timeout, lineTestService, $interval) {


        //以下代码只执行一次-------------------------------------------------------------------------------------------------
        var COUNTDOWN_TOTAL=120;
    	$scope.refresh = true;
        $scope.countdown = COUNTDOWN_TOTAL;
        //设置定时任务.
        $scope.timer = $interval(function () {
            if (!$scope.refresh) {
                return;
            }
            $scope.countdown--;
            if ($scope.countdown < 0) {
                $scope.countdown = COUNTDOWN_TOTAL;
                $scope.refreshData();
            }
        }, 1000);
        //跳转页面清除计时器
        $scope.$on('$destroy',function(){
        	  $interval.cancel($scope.timer);
        	}) //在控制器里，添加$on函数
        $scope.array1 = [];
        $scope.array2 = [];
        $scope.array3 = [];
        $scope.array1Length = 0;
        $scope.array2Length = 0;
        $scope.array3Length = 0;

        //设置拖动监听
        $scope.$watch('array1', function () {

            if ($scope.array1Length != $scope.array1.length) {
                if ($scope.array1Length > $scope.array1.length) {
                    $scope.refreshDataNoRequest();
                } else {

                }
                $scope.array1Length = $scope.array1.length
            } else {
                $scope.refreshDataNoRequest();
            }

        }, true);
        $scope.$watch('array2', function () {
            if ($scope.array2Length != $scope.array2.length) {
                if ($scope.array2Length > $scope.array2.length) {
                    $scope.refreshDataNoRequest();
                } else {

                }
                $scope.array2Length = $scope.array2.length
            } else {
                $scope.refreshDataNoRequest();
            }
        }, true);
        $scope.$watch('array3', function () {
            if ($scope.array3Length != $scope.array3.length) {
                if ($scope.array3Length > $scope.array3.length) {
                    $scope.refreshDataNoRequest();
                } else {

                }
                $scope.array3Length = $scope.array3.length
            } else {
                $scope.refreshDataNoRequest();
            }
        }, true);
        //以上代码只执行一次------------------------------------------------------------------------------------------------------
        //设置初始值

        $scope.init = function () {
            $scope.groups = [];
            $scope.currentGroup = {};

            $scope.array1 = [];
            $scope.array2 = [];
            $scope.array3 = [];
            $scope.array1Length = 0;
            $scope.array2Length = 0;
            $scope.array3Length = 0;
            $scope.dataMap = {};
            $scope.temp = {
                title:'',
                desc:'',
                value: '',
                callback: function () {
                }
            }
            $scope.refresh = true;
            $scope.countdown = COUNTDOWN_TOTAL;
            $scope.isEnLarge = false;
            $scope.enLargeObj = {
                elentmentId:'enLarge',
                desc:'未命名',
                indexBaseInfoVo:{
                    indexNameCn:'未命名'
                }

            };

        }


        //获取订阅信息.
        $scope.getSubsctibed = function (groupName) {
            if (typeof(groupName) == 'undefined' || groupName == '') {
                groupName = '默认分组'
            }
            $scope.init();
            //获取所有分组和查询信息，并设置默认分组为当前分组
            var promise = commonUtil.ajaxPost('./mySubscribedTable/searchSubsctibed', {});

            promise.success(function (response) {
                if (response.retcode == '0') {
                    //设置分组信息
                    console.log("面板信息", response.body);
                    var groups = [];
                    //确认上次访问的group.
                    var count = -1;
                    var target = 0;

                    for (i in response.body) {
                        count++;
                        var group = {};
                        group['name'] = i;
                        if (i == groupName) {
                            target = count;
                        }
                        group['paramData'] = commonUtil.deepCopy(response.body[i]);
                        groups.push(group);
                    }
                    $scope.groups = groups;
                    $scope.currentGroup = groups[target];


                } else {
                    commonUtil.alertUtil.error("", "异常信息：" + response.retdesc);
                    $scope.refresh = false;
                }

                realLogicCode();

            });

            promise.error(function () {
                commonUtil.alertUtil.error("", "请求失败");
                realLogicCode();
                $scope.refresh = false;
            });
        };

        $scope.getSubsctibed();

        //变更当前分组
        $scope.changeCurrentGroup = function (index) {
            $scope.currentGroup = $scope.groups[index];
            //console.log("点击按钮",moment().format("HH:mm:ss"));
            realLogicCode();
        }
        //页面样式
        $scope.isActive = function (index) {
            if ($scope.groups[index] == $scope.currentGroup) {
                return 'active';
            } else {
                return '';
            }
        }

        //数据分类
        $scope.arrangementCurrentData = function () {
            var paramData = [];
            if (typeof($scope.currentGroup.paramData) != 'undefined') {
                paramData = $scope.currentGroup.paramData;
            }

            var array1 = [];
            var array2 = [];
            var array3 = [];

            var noPotion = [];

            //区分数据.
            for (i in paramData) {
                //不存在名称的设置为未命名
                if (typeof(paramData[i].desc) == 'undefined' || paramData[i].desc == '') {
                    paramData[i].desc = '未命名';
                }

                if (typeof(paramData[i].x) != 'undefined' && typeof(paramData[i].y) != 'undefined') {
                    if (paramData[i].x == 1) {
                        array1.push(paramData[i]);
                    } else if (paramData[i].x == 2) {
                        array2.push(paramData[i]);
                    } else if (paramData[i].x == 3) {
                        array3.push(paramData[i]);
                    } else {
                        noPotion.push(paramData[i]);
                    }
                } else {
                    noPotion.push(paramData[i]);
                }
            }

            //排序
            array1.sort(function (a, b) {
                return a.y - b.y;
            });
            array2.sort(function (a, b) {
                return a.y - b.y;
            });
            array3.sort(function (a, b) {
                return a.y - b.y;
            });
            //补充无坐标数据
            for (i in noPotion) {
                //获取长度最小的array
                var smallest = array1;
                if (array2.length < smallest.length) {
                    smallest = array2;
                }
                if (array3.length < smallest.length) {
                    smallest = array3;
                }
                smallest.push(noPotion[i]);
            }
            //补充id信息
            for (i in array1) {
                array1[i].elentmentId = "id_1_" + i;
            }
            for (i in array2) {
                array2[i].elentmentId = "id_2_" + i;
            }
            for (i in array3) {
                array3[i].elentmentId = "id_3_" + i;
            }

            $scope.array1 = array1;
            $scope.array2 = array2;
            $scope.array3 = array3;

            $scope.array1Length = array1.length;
            $scope.array2Length = array2.length;
            $scope.array3Length = array3.length;
        }

        //重置临时变量
        $scope.resetTemp = function () {
            $scope.temp = {
                title:'',
                desc:'',
                value: '', callback: function () {
                }
            }
        }
        //执行回调函数
        $scope.doCallBack = function () {
            if (typeof($scope.temp.callback) != 'undefined') {
                $scope.temp.callback($scope.temp.value);
            }
            $scope.resetTemp();
            $("#tempModal").modal('hide');
        }

        //tootgle刷新开关
        $scope.changeRefresh = function () {
            $scope.refresh = !$scope.refresh;

        }


        //刷新曲线图数据.
        $scope.refreshData = function () {
            if(!$scope.isEnLarge){
                //$timeout(function () {
                for (i in $scope.array1) {
                    dealOneParam($scope.array1[i]);
                }
                for (i in $scope.array2) {
                    dealOneParam($scope.array2[i]);
                }
                for (i in $scope.array3) {
                    dealOneParam($scope.array3[i]);
                }
            }else{
                dealOneParam($scope.enLargeObj);
            }


            //});


        }

        //刷新曲线图数据(不请求后台).
        $scope.refreshDataNoRequest = function () {
            $timeout(function () {
                for (i in $scope.array1) {
                    dealOneParamWithData($scope.array1[i]);
                }
                for (i in $scope.array2) {
                    dealOneParamWithData($scope.array2[i]);
                }
                for (i in $scope.array3) {
                    dealOneParamWithData($scope.array3[i]);
                }
            });


        }


        //处理一个查询条件
        function dealOneParam(obj) {
            var id = obj.elentmentId;
            //封装查询条件
            var param = {};
            var start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
            var end = moment().format('YYYY-MM-DD HH:mm:ss');
            param["beginTime"] = start;
            param["endTime"] = end;
            //indexName
            param["indexName"] = obj.indexName;
            var tableMap = {
                dashboard0: obj.tableQueryCriterias
            }
            param["tableMap"] = tableMap;
            if(obj.relativeType!= null){
                param["relativeType"] = obj.relativeType;
            }
            //调用接口
            var realParam = {
                indexMonitorVoStr: JSON.stringify(param)
            }


            //console.log("发送请求",moment().format("HH:mm:ss"));
            var promise = commonUtil.ajaxPost('./indexMonitor/getIndexData', realParam);

            promise.success(function (data) {
                if (data.retcode != '0') {
                    commonUtil.alertUtil.error("", id + "获取数据失败,异常信息" + data.retdesc);
                } else {


                    if (data.body == null) {
                        commonUtil.alertUtil.error("", id + "获取数据为空");
                        return;
                    }
                    console.log(id + "返回数据:{}", data.body);
                    $scope.dataMap[id] = data;
                    dealOneParamWithData(obj);
                }

            });
            promise.error(function (data) {
                commonUtil.alertUtil.error("", id + "获取数据失败");
            });
        }

        //数据与曲线图绑定
        function dealOneParamWithData(obj) {
            if (typeof($scope.dataMap[obj.elentmentId]) == 'undefined') {
                return;
            }
            var id = obj.elentmentId;
            var dbs = commonUtil.deepCopy($scope.dataMap[obj.elentmentId].body);

            //判断是否百分比指标
            var isPercentage = false;
            //设置小数点保留位数
            if (obj.indexBaseInfoVo.dataClassify != 'NumType') {
                isPercentage=true;
            }


            if(obj.relativeType != null){//组合图

                //TODO:构造假的原始数据
                for (name in dbs) {
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
                        histogramData2[n+"("+obj.relativeType+")"] = histogramData[n];
                    }
                    histogramData = histogramData2;

                    //获取标准时间列表
                    var dates = lineTestService.getAllTimes(lineData);

                    //补充数据
                    for (lineName in lineData) {
                        lineData[lineName] = lineTestService.fillOneLine(dates, lineData[lineName],isPercentage);
                    }

                    for (lineName in histogramData) {
                        histogramData[lineName] = lineTestService.fillOneLine(dates, histogramData[lineName],isPercentage);
                    }
                    var customParam = {

                        //x轴隐藏代码如下:
                        xAxis: {
                            labels: {
                                enabled: false
                            }
                        },
                        tooltip: {
                            formatter: function () {
                                if(isPercentage){
                                    return '<span style="color:"' + this.series.color + '">' + this.point.time + '</span>:[' + this.point.y + '%]';
                                }else{
                                    return '<span style="color:"' + this.series.color + '">' + this.point.time + '</span>:[' + this.point.y + ']';
                                }

                            }
                        },
                        title: {
                            text: null
                        }
                    }

                    //设置小数点保留位数
                    if (obj.indexBaseInfoVo.dataClassify == 'NumType') {
                        customParam['afterZero'] = 0;
                    } else {
                        customParam['afterZero'] = 2;
                    }

                    //设置y轴起始值
                    if(obj.indexBaseInfoVo.ordinate){
                        customParam['ordinate'] = parseInt(obj.indexBaseInfoVo.ordinate);
                    }else{
                        customParam['ordinate'] =0;
                    }

                    if (typeof(obj.yPlot) != 'undefined') {
                        var plotLines = [];
                        for (i in obj.yPlot) {
                            plotLines.push({   //一条延伸到整个绘图区的线，标志着轴中一个特定值。
                                color: '#f00',
                                dashStyle: 'Dash', //Dash,Dot,Solid,默认Solid
                                width: 1.5,
                                value: obj.yPlot[i],  //y轴显示位置
                                zIndex: 5
                            });
                        }

                        customParam["yAxis"] = {
                            plotLines: plotLines,
                            min:customParam['ordinate'],
                            title: {
                                text: null
                            },
                            labels: {
                                formatter: function () {
                                    return this.value.toFixed(customParam['afterZero']);// 这里是两位小数，你要几位小数就改成几
                                }
                            }
                        }
                    }

                    //展示折线图
                    lineTestService.initLineAndHistogram($("#" + obj.elentmentId), dates,histogramData, lineData, customParam);

                }


            }else{//折线图
                for (name in dbs) {
                    var lineData = dbs[name].charts;
                    if (typeof(lineData) == 'undefined' || lineData.length == 0) {
                        commonUtil.alertUtil.error("", "图表" + id + "获取数据为空");
                        continue;
                    }
                    //获取标准时间列表
                    var dates = lineTestService.getAllTimes(lineData);


                    for (lineName in lineData) {
                        lineData[lineName] = lineTestService.fillOneLine(dates, lineData[lineName],isPercentage);
                    }

                    //曲线名称翻译成中文
                    lineData = lineTestService.translateLineName(lineData,obj.tagValueMap);

                    var customParam = {

                        //x轴隐藏代码如下:
                        xAxis: {
                            labels: {
                                enabled: false
                            }
                        },
                        tooltip: {
                            formatter: function () {
                                if(isPercentage){
                                    return '<span style="color:"' + this.series.color + '">' + this.point.time + '</span>:[' + this.point.y + '%]';
                                }else{
                                    return '<span style="color:"' + this.series.color + '">' + this.point.time + '</span>:[' + this.point.y + ']';
                                }

                            }
                        },
                        title: {
                            text: null
                        }
                    }

                    //设置小数点保留位数
                    if (obj.indexBaseInfoVo.dataClassify == 'NumType') {
                        customParam['afterZero'] = 0;
                    } else {
                        customParam['afterZero'] = 2;
                    }

                    //设置y轴起始值
                    if(obj.indexBaseInfoVo.ordinate){
                        customParam['ordinate'] = parseInt(obj.indexBaseInfoVo.ordinate);
                    }else{
                        customParam['ordinate'] =0;
                    }

                    if (typeof(obj.yPlot) != 'undefined') {
                        var plotLines = [];
                        for (i in obj.yPlot) {
                            plotLines.push({   //一条延伸到整个绘图区的线，标志着轴中一个特定值。
                                color: '#f00',
                                dashStyle: 'Dash', //Dash,Dot,Solid,默认Solid
                                width: 1.5,
                                value: obj.yPlot[i],  //y轴显示位置
                                zIndex: 5
                            });
                        }

                        customParam["yAxis"] = {
                            plotLines: plotLines,
                            min:customParam['ordinate'],
                            title: {
                                text: null
                            },
                            labels: {
                                formatter: function () {
                                    return this.value.toFixed(customParam['afterZero']);// 这里是两位小数，你要几位小数就改成几
                                }
                            }
                        }
                    }



                    lineTestService.initLine($("#" + id), dates, lineData,customParam);
                }
            }




        }


        //真实业务逻辑代码
        function realLogicCode() {

            //初始化当前数据.
            $scope.arrangementCurrentData();


            //设置排序
            $(".connectedSortable").sortable({
                placeholder: "sort-highlight",
                connectWith: ".connectedSortable",
                handle: ".box-header, .nav-tabs",
                forcePlaceholderSize: true,
                zIndex: 999999

            });


            //查询数据
            $timeout(function () {

                $(".connectedSortable h3").css("cursor", "move");
                //设置BODYSCROLL
                commonUtil.setScroll();
                //console.log("页面事件处理完毕",moment().format("HH:mm:ss"));
                $scope.refreshData();
                $("#tempModal").modal({
                    backdrop: false,
                    keyboard: false,
                    show: false
                });
            });

        }

        //增加标识线
        $scope.addYPlot = function (id, index) {
            $("#tempModal").modal('show');
            $scope.temp.title='增加标识线';
            $scope.temp.desc='标识线Y值';
            $scope.temp.callback = function (value) {
                if (!commonUtil.isNum(value)) {
                    commonUtil.alertUtil.error("", "不是数字");
                    return;
                }
                var obj = getArrayById(id)[index];
                if (typeof(obj.yPlot) == 'undefined') {
                    obj.yPlot = [];
                }
                var intvAL = parseInt(value);

                if ($.inArray(intvAL, obj.yPlot) < 0) {
                    obj.yPlot.push(intvAL);
                }

                $scope.refreshDataNoRequest();
            }


        }
        //删除所有标识线
        $scope.removeYPlot = function (id, index) {

            getArrayById(id)[index].yPlot = [];
            $scope.refreshDataNoRequest();
        }
        //删除修改名称
        $scope.updateDesc = function (id, index) {
            var obj = getArrayById(id)[index];
            $scope.temp.value = obj.desc;
            $("#tempModal").modal('show');
            $scope.temp.title='修改订阅名称';
            $scope.temp.desc='订阅名称';
            $scope.temp.callback = function (value) {
                if (value == '') {
                    commonUtil.alertUtil.error("", "不能为空");
                    return;
                }
                obj.desc = value;
            }
        }
        //修改分组
        $scope.editGroup = function (id, index) {
            //获取当前分组名称
            var currentName = $scope.currentGroup.name;

            var obj = getArrayById(id)[index];
            var id = obj.id;
            $("#tempModal").modal('show');
            $scope.temp.title='修改分组名称';
            $scope.temp.desc='分组名称';
            $scope.temp.callback = function (value) {
                value = commonUtil.trim(value);
                if (value == '') {
                    commonUtil.alertUtil.error("", "不能为空");
                    return;
                }
                //封装对象(x设置为0为了重新定位)
                var obj = {
                    id: id,
                    groupName: value,
                    x:0
                }
                var array = [obj];

                var param = {
                    data: JSON.stringify(array)
                }


                var promise = commonUtil.ajaxPost('./mySubscribedTable/updateBatch', param);

                promise.success(function (response) {
                    if (response.retcode == '0') {
                        commonUtil.alertUtil.info("", response.retdesc);
                        $scope.getSubsctibed(currentName);
                    } else {
                        commonUtil.alertUtil.error("", "异常信息：" + response.retdesc);
                    }

                });

                promise.error(function () {
                    commonUtil.alertUtil.error("", "请求失败");

                });


            }
        }

        //获取某个数组
        function getArrayById(id) {
            if (id == '1') {
                return $scope.array1;
            }
            if (id == '2') {
                return $scope.array2;
            }
            if (id == '3') {
                return $scope.array3;
            }

        }

        //删除某个订阅信息
        $scope.deleteOneById = function (id) {
            var currentName = $scope.currentGroup.name;
            commonUtil.ConfirmUtil.showConfirm("确定从面板上删除该图表吗?", function () {
                //调用删除接口
                var promise = commonUtil.ajaxPost('./mySubscribedTable/deleteSubsctibed', {'id': id});

                promise.success(function (response) {
                    if (response.retcode == '0') {
                        $scope.getSubsctibed(currentName);
                    } else {
                        commonUtil.alertUtil.error("", "异常信息：" + response.retdesc);
                    }

                });

                promise.error(function () {
                    commonUtil.alertUtil.error("", "请求失败");

                });
            });

        }

        //保存当前分组修改
        $scope.saveCurrentGroup = function () {

            commonUtil.ConfirmUtil.showConfirm("是否保存当前页面所做的修改?", function () {
                var currentName = $scope.currentGroup.name;
                var array = [];
                //array1
                for (i in $scope.array1) {
                    var obj = $scope.array1[i];
                    var newObj = {};
                    newObj['desc'] = obj['desc'];
                    newObj['yPlot'] = obj['yPlot'];
                    //计算 x y
                    newObj['x'] = 1;
                    newObj['y'] = i;
                    newObj['id'] = obj['id'];
                    array.push(newObj);
                }
                //array2
                for (i in $scope.array2) {
                    var obj = $scope.array2[i];
                    var newObj = {};
                    newObj['desc'] = obj['desc'];
                    newObj['yPlot'] = obj['yPlot'];
                    //计算 x y
                    newObj['x'] = 2;
                    newObj['y'] = i;
                    newObj['id'] = obj['id'];
                    array.push(newObj);
                }
                //array3
                for (i in $scope.array3) {
                    var obj = $scope.array3[i];
                    var newObj = {};
                    newObj['desc'] = obj['desc'];
                    newObj['yPlot'] = obj['yPlot'];
                    //计算 x y
                    newObj['x'] = 3;
                    newObj['y'] = i;
                    newObj['id'] = obj['id'];
                    array.push(newObj);
                }

                var param = {
                    data: JSON.stringify(array)
                }

                //
                console.log("请求入参", array);
                var promise = commonUtil.ajaxPost('./mySubscribedTable/updateBatch', param);

                promise.success(function (response) {
                    if (response.retcode == '0') {
                        commonUtil.alertUtil.info("", response.retdesc);
                        $scope.getSubsctibed(currentName);
                    } else {
                        commonUtil.alertUtil.error("", "异常信息：" + response.retdesc);
                    }

                });

                promise.error(function () {
                    commonUtil.alertUtil.error("", "请求失败");

                });

            });


        }

        /*
        * 方大某个方法
        * */
        $scope.enLarge = function (arrayIndex,dataIndex){
            $scope.isEnLarge= true;
            var enLargeObj =commonUtil.deepCopy(getArrayById(arrayIndex)[dataIndex]);
            enLargeObj.elentmentId= "enLarge";
            $scope.enLargeObj = enLargeObj;
            $scope.refreshData();

        }

        /**
         * 缩小某个方法
         *
         */
        $scope.narrow=function(){
            $scope.isEnLarge=false;
            $scope.refreshData();
        }


    }]);
});
