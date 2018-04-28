define(['app', 'moment', 'ConfirmUtil', 'highcharts', 'angular', 'angular-route', 'daterangepicker', 'service/common/common-util', 'service/common/alert-util', 'select2', 'service/test/lineTestService'], function (app, moment, ConfirmUtil) {
    app.controller('zbDetailController',
        ['$scope', 'commonUtil', 'alertUtil', '$state', '$timeout', 'lineTestService', function ($scope, commonUtil, alertUtil, $state, $timeoute, lineTestService) {
            console.log("zbDetailController");
            //设置BODYSCROLL
            commonUtil.setScroll();

//            $scope.timeRangeStr="";
            //检查有没有入参
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
                        //使用标签数据构造查询条件生成器
                        console.log(data.body);
                        $scope.indexName = data.body.indexName;
                        $scope.indexNameCn = data.body.indexNameCn;
                        //设置小数点保留位数
                        if (data.body.dataClassify == 'NumType') {
                            $scope.afterZero = 0;
                        } else {
                            $scope.afterZero = 2;
                        }


                        //获取组合标签
                        $scope.mergedTags = [];
                        //组合标签的名字
                        var mergedNamsArray = []
                        if (typeof(data.body.tagGroupInfos) != 'undefined' && data.body.tagGroupInfos.length > 0) {
                            for (i in data.body.tagGroupInfos) {
                                var str = data.body.tagGroupInfos[i];
                                var array = str.split('::');
                                for (j in array) {
                                    mergedNamsArray.push(array[j]);
                                }
                                //初始化组合标签
                                var obj = {
                                    name: str
                                }
                                var tags = [];
                                for (k in array) {
                                    for (l in data.body.indexTagDetails) {
                                        if (array[k] == data.body.indexTagDetails[l].tagName) {
                                            tags.push(commonUtil.deepCopy(data.body.indexTagDetails[l]));
                                            break;
                                        }
                                    }
                                }
                                obj["tags"] = tags;
                                $scope.mergedTags.push(obj);

                            }
                        }

                        //获取非组合标签
                        $scope.unMergedTags = [];
                        for (i in data.body.indexTagDetails) {
                            if ($.inArray(data.body.indexTagDetails[i].tagName, mergedNamsArray) >= 0) {
                                //$scope.mergedTags.push(data.body.indexTagDetails[i]);
                            } else {
                                $scope.unMergedTags.push(data.body.indexTagDetails[i]);
                            }
                        }
                        ////如果不存在非组合标签，跳转到新页面
                        //if($scope.unMergedTags.length ==0&&$scope.mergedTags.length==1){
                        //    $state.go("index.zbDetailLow", {indexName: $scope.indexName});
                        //    return;
                        //}
                        ////如果只有一个标签，跳转到新页面
                        //if($scope.unMergedTags.length ==1&&$scope.mergedTags.length==0){
                        //    $state.go("index.zbDetailLow", {indexName: $scope.indexName});
                        //    return;
                        //}


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


            //数据准备完成以后真实的业务代码
            function realLogicCode() {


                $scope.dashboards = [];

                //为非组合标签临时初始化
                if ($scope.unMergedTags.length > 0) {
                    var list = commonUtil.deepCopy($scope.unMergedTags[0].tagValues);
                    $scope.tempUnMergeTag = {
                        tag: $scope.unMergedTags[0],
                        selected: list,
                        id: 0
                    }
                }

                //为组合标签临时初始化
                if ($scope.mergedTags.length > 0) {

                    $scope.tempMergeTag = {
                        tags: $scope.mergedTags[0],
                        list: [],
                        id: 0,
                        lineNos: []
                    }

                    var list = [];
                    var lineNos = [];
                    for (i in $scope.mergedTags[0].tags) {
                        var obj = {
                            tagName: $scope.mergedTags[0].tags[i].tagName,
                            selected: $scope.mergedTags[0].tags[i].tagValues
                        }
                        list.push(obj);
                        lineNos.push(i);

                    }
                    $scope.tempMergeTag.list = list;
                    $scope.tempMergeTag.lineNos = lineNos;

                }


                $scope.resetSelect2();

                $("[data-toggle='popover']").popover();

                $('#tagAddModal').modal({
                    backdrop: false,
                    keyboard: false,
                    show: false
                });

                $('#mergedTagAddModal').modal({
                    backdrop: false,
                    keyboard: false,
                    show: false
                });

                $timeoute(function () {
                    $scope.initDatePicker();
                });
            }


            //增加一个图表
            $scope.addOneDashBoard = function () {
                $scope.dashboards.push({
                    list: [],
                    lineCount: 0
                });
            }

            //删除一个图表
            $scope.removeOneDashBoard = function (index) {
                if (index >= $scope.dashboards.length || index < 0) {
                    return;
                }
                $scope.dashboards.splice(index, 1)
            }

            $scope.resetSelect2 = function () {
                $timeoute(function () {
                    $(".select2").select2({allowClear: true});
                });
            }

            $scope.showAddTagPop = function (id) {
                var list = commonUtil.deepCopy($scope.unMergedTags[0].tagValues);
                $scope.tempUnMergeTag = {
                    tag: $scope.unMergedTags[0],
                    selected: list,
                    id: 0
                }
                $('#tagAddModal').modal('toggle');
                $scope.resetSelect2();
            }

            //删除一项条件.
            $scope.deleteOneParam = function (out, inner) {
                $scope.dashboards[out].list.splice(inner, 1);
                $scope.calculateLineCount(out);
            }
            //增加一项条件
            $scope.addOneUnMergedParam = function () {

                var id = $scope.tempUnMergeTag.id;
                var tagName = $scope.tempUnMergeTag.tag.tagName;
                //TODO:防止重复
                //if($scope.dashboards[id].list.length !=0){
                //    for(i in $scope.dashboards[id].list){
                //        if($scope.dashboards[id].list[i].tagName == tagName){
                //            alertUtil.getInstance().error("",tagName+"已经添加,不允许重复添加");
                //            return;
                //        }
                //    }
                //}


                if ($scope.tempUnMergeTag.selected.length == 0) {
                    commonUtil.alertUtil.error("", "未选择可用取值");
                    return;
                }

                var detail = [];
                for (i in $scope.tempUnMergeTag.selected) {
                    detail.push(tagName + "=" + $scope.tempUnMergeTag.selected[i].name)
                }
                var objs = commonUtil.deepCopy($scope.tempUnMergeTag.selected);
                var desc = tagName + "下的" + detail[0] + "等" + detail.length + "个取值";
                var obj = {
                    detail: detail,
                    desc: desc,
                    objs: objs
                }
                $scope.dashboards[id].list.push(obj);


                //TODO:重置临时对象
                var list = commonUtil.deepCopy($scope.unMergedTags[0].tagValues);
                $scope.tempUnMergeTag = {
                    tag: $scope.unMergedTags[0],
                    selected: list,
                    id: id
                }
                $('#tagAddModal').modal('toggle');
                $scope.calculateLineCount(id);
            }

            $scope.popoverShow = function ($event) {
                var obj = $event.target;
                $(obj).popover('toggle');
                $(".scroll-table").slimScroll({
                    height: '200px' //可滚动区域高度
                });

            }
//            $scope.popoverHide=function($event){
//                var obj=$event.target;
//                $(obj).popover('hide');
//            }


            //根据标签详情数据生成table
            $scope.initTable = function (outer, inner) {

                var tagValues = $scope.dashboards[outer].list[inner].objs;
                var html = '<div class="scroll-table"><table class="table table-hover table-bordered "><tbody><tr><th>中文</th><th>英文</th></tr>';
                for (i in tagValues) {
                    html += '<tr><td>' + tagValues[i].nameCn + '</td><td>' + tagValues[i].name + '</td></tr>';
                }
                html += '</tbody></table><div>';
                return html;
            }

            $scope.showAddMergedTagPop = function (id) {

                $scope.tempMergeTag = {
                    tags: $scope.mergedTags[0],
                    list: [],
                    id: id
                }

                var list = [];
                var lineNos = [];
                for (i in $scope.mergedTags[0].tags) {
                    var obj = {
                        tagName: $scope.mergedTags[0].tags[i].tagName,
                        selected: $scope.mergedTags[0].tags[i].tagValues
                    }
                    list.push(obj);
                    lineNos.push(i);

                }
                $scope.tempMergeTag.list = list;
                $scope.tempMergeTag.lineNos = lineNos;
                $('#mergedTagAddModal').modal('toggle');
                $scope.resetSelect2();
            }

            //删除一个临时标签组合中的标签
            $scope.minusOneMergdeTagParam = function (index) {
                $scope.tempMergeTag.list.splice(index, 1);
                $scope.tempMergeTag.lineNos.splice(index, 1);
                $scope.resetSelect2();

                //$scope.tempMergeTag.tags.tags.splice(index,1);

            }

            //新增一个标签组合查询条件
            $scope.addOneMergedParam = function () {

                var id = $scope.tempMergeTag.id;

                //list不能为空
                if ($scope.tempMergeTag.list.length == 0) {
                    commonUtil.alertUtil.error("", "无可用标签取值");
                    $scope.changeTempMergedTag();
                    return;
                }
                //任意一个标签不能不选择
                for (i in $scope.tempMergeTag.list) {
                    if ($scope.tempMergeTag.list[i].selected.length == 0) {
                        var name = $scope.tempMergeTag.list[i].tagName;
                        commonUtil.alertUtil.error("", name + "无可用标签取值");
                        return;
                    }
                }


                //封装数据
                var detail = [];
                var objs = [];
                var desc = "";
                for (i in $scope.tempMergeTag.list) {
                    var tagSelect = $scope.tempMergeTag.list[i];
                    var name = tagSelect.tagName;
                    var array = tagSelect.selected;
                    //处理desc
                    if (i == '0') {
                        desc += name + "下的" + array[0].name + "等" + array.length + "个取值";
                    } else {
                        desc += "+" + name + "下的" + array[0].name + "等" + array.length + "个取值";
                    }
                    //处理objs和detail
                    var tempObjs = []
                    var tempDetail = [];
                    for (j in array) {
                        if (objs.length == 0) {//第一遍循环
                            //处理objs
                            tempObjs.push({
                                name: array[j].name,
                                nameCn: array[j].nameCn
                            });

                            //处理detail
                            tempDetail.push(name + "=" + array[j].name);

                        } else {

                            //处理objs
                            for (k in objs) {
                                var oneObj = {
                                    name: objs[k].name + "+" + array[j].name,
                                    nameCn: objs[k].nameCn + "+" + array[j].nameCn
                                }
                                tempObjs.push(oneObj);
                            }

                            //处理detail
                            for (k in detail) {
                                var oneDetail = detail[k] + "_" + name + "=" + array[j].name;
                                tempDetail.push(oneDetail);
                            }

                        }

                    }
                    detail = tempDetail;
                    objs = tempObjs;


                }


                var obj = {
                    detail: detail,
                    desc: desc,
                    objs: objs
                }
                console.log(obj);
                $scope.dashboards[id].list.push(obj);


                //TODO:重置临时对象
                $scope.tempMergeTag = {
                    tags: $scope.mergedTags[0],
                    list: [],
                    id: id
                }

                var list = [];
                var lineNos = [];
                for (i in $scope.mergedTags[0].tags) {
                    var obj = {
                        tagName: $scope.mergedTags[0].tags[i].tagName,
                        selected: $scope.mergedTags[0].tags[i].tagValues
                    }
                    list.push(obj);
                    lineNos.push(i);

                }
                $scope.tempMergeTag.list = list;
                $scope.tempMergeTag.lineNos = lineNos;
                $('#mergedTagAddModal').modal('toggle');
                $scope.calculateLineCount(id);

            }

            //当选中一个标签组合时处理
            $scope.changeTempMergedTag = function () {
                var list = [];
                var lineNos = [];
                for (i in $scope.tempMergeTag.tags.tags) {
                    var obj = {
                        tagName: $scope.tempMergeTag.tags.tags[i].tagName,
                        selected: $scope.tempMergeTag.tags.tags[i].tagValues
                    }
                    list.push(obj);
                    lineNos.push(i);

                }
                $scope.tempMergeTag.list = list;
                $scope.tempMergeTag.lineNos = lineNos;
                $scope.resetSelect2();
            }

            //计算查询出的曲线条数.
            $scope.calculateLineCount = function (index) {
                var tempArray = [];
                if ($scope.dashboards[index].list.length == 0) {
                    $scope.dashboards[index].lineCount = 0;
                } else {

                    for (i in $scope.dashboards[index].list) {
                        var list = $scope.dashboards[index].list[i].detail;
                        for (j in list) {
                            if ($.inArray(list[j], tempArray) >= 0) {
                                continue;
                            } else {
                                tempArray.push(list[j]);
                            }
                        }

                    }
                    $scope.dashboards[index].lineCount = tempArray.length;
                }
                return tempArray;

            }


            //查询数据
            $scope.doQuery = function () {

                var param = {};
                //验证入参时间
                if (typeof $scope.timeRangeStr == "undefined" || $scope.timeRangeStr == "") {
                    commonUtil.alertUtil.error("", "请选择时间段");
                    return;
                }
                var timeRangeArr = $scope.timeRangeStr.split(" - ");
                var startTime = timeRangeArr[0];
                var endTime = timeRangeArr[1];
                param["beginTime"] = startTime;//moment(startTime, "YYYY-MM-DD HH").format("YYYYMMDDHH");
                param["endTime"] = endTime;//moment(endTime, "YYYY-MM-DD HH").format("YYYYMMDDHH");
                //indexName
                param["indexName"] = $scope.indexName;

                //校验是否有面板
                if ($scope.dashboards.length == 0) {
                    commonUtil.alertUtil.error("", "没有可用面板");
                    return;
                }

                var dashboards = {};


                //校验是否所有面板都有条件
                var isOver20 = "";
                for (i in $scope.dashboards) {
                    var lines = [];
                    var name = "dashboard" + i;

                    if ($scope.dashboards[i].list.length == 0) {
                        commonUtil.alertUtil.error("", "图表" + i + "没有可用条件");
                        return;
                    }
                    var lines = $scope.calculateLineCount(i);
                    if (lines.length > 20) {
                        isOver20 = i;
                    }

                    dashboards[name] = lines;
                }
                param["tableMap"] = dashboards;

                console.log("请求数据:{}", param);
                if (isOver20 != "") {
                    ConfirmUtil.showConfirm("图表" + isOver20 + "的曲线数量超过20条，会影响最终展示效果，确认要继续查询吗？", function () {
                        getData(param);
                    });

                } else {
                    getData(param);
                }

                //提示是否有超过20条曲线


                //获取数据，展示

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
                                $scope.dashboards[id].dates = dates;
                                //console.log(dates)

                                for (lineName in lineData) {
                                    lineData[lineName] = lineTestService.fillOneLine(dates, lineData[lineName]);
                                }
                                $scope.dashboards[id].lineData = lineData;
                            }
                            //展示曲线图
                            for (i in $scope.dashboards) {
                                var dates = $scope.dashboards[i].dates;
                                var lineData = $scope.dashboards[i].lineData;
                                lineTestService.initLine($("#highchars" + i), dates, lineData, $scope.afterZero);
                            }

                        }

                    });
                    promise.error(function (data) {
                        commonUtil.alertUtil.error("", "获取数据失败");
                    });


                }
            }

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

            }




        }
        ])
    ;


});
