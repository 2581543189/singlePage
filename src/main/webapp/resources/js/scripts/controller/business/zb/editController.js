define(['app', 'angular','angular-route', 'select2', 'service/business/zb/editService', 'service/common/alert-util', 'service/common/common-util', 'routes','xlsx-full'], function (app, $stateParams) {
    app.controller('zbEditController',
        ['$scope', 'alertUtil', 'zbEditService', '$timeout', 'commonUtil', '$state', function ($scope, alertUtil, es, $timeout, commonUtil, $state) {
            // 设置BODYSCROLL
            commonUtil.setScroll();
            // 初始化默认标签组
            $scope.defaultTags = commonUtil.deepCopy(es.DEFAULTT_TAGS);
            // 空的临时标签组合
            $scope.tempMergeTags = [];
            // 空的临时选中要组合的标签
            $scope.tempMergeTag = {};
            // 初始化新增空Model
            $scope.nameModel = {
                name: "",
                nameCn: "",
                nameModel: "新增标签值"
            }

            // 标签组合默认不可见
            $scope.mtShow = false;
            $scope.mtShowToggle = function () {
                $scope.mtShow = !$scope.mtShow;
            }


            // 初始化select取值列表
            $scope.baseTypeOptions = [es.IndexBaseType.TechType, es.IndexBaseType.BizType];
            $scope.dataTypeOptions = [es.DataType.Integer, es.DataType.Float, es.DataType.Double];
            $scope.dataClassifyOptions = [es.DataClassify.NumType, es.DataClassify.PercentType, es.DataClassify.TimeType];
            $scope.dataUnitOptions = [es.DataUnit.Times, es.DataUnit.Nums, es.DataUnit.Percent, es.DataUnit.Thousandths
                , es.DataUnit.Millisecond, es.DataUnit.Second, es.DataUnit.Hour, es.DataUnit.Day];
            $scope.simplingTypeOptions = [es.IndexSimplingType.ActiveType, es.IndexSimplingType.PassiveType];
            $scope.compareTypeOptions = [es.CompareType.GT, es.CompareType.LT, es.CompareType.GTE, es.CompareType.LTE, es.CompareType.BTW]
            $scope.alertTypeOptions = [commonUtil.constant.AlermMode.ABSOLUTE, commonUtil.constant.AlermMode.RELATIVE];
            $scope.relativeTypeOptions = [commonUtil.constant.RelativeType.AVG,commonUtil.constant.RelativeType.DOD,commonUtil.constant.RelativeType.WOW,commonUtil.constant.RelativeType.MOM,commonUtil.constant.RelativeType.YOY];
            $scope.alertDataTypeOptions =[commonUtil.constant.AlertDataType.TOTAL,commonUtil.constant.AlertDataType.AVG]
            $scope.productServiceOptions = [commonUtil.constant.ProductService.EMPTY, commonUtil.constant.ProductService.HOTEL, commonUtil.constant.ProductService.MOBILE, commonUtil.constant.ProductService.PLATFORM, commonUtil.constant.ProductService.PROMOTION, commonUtil.constant.ProductService.TEST, commonUtil.constant.ProductService.TRAFFIC];


            // 新增
            $scope.isNew = 0;
            // 初始化指标
            $scope.obj = $.extend({}, es.EMPTY);
            // 数组类型需要深度拷贝
            $scope.obj["indexTagDetails"] = [];
            $scope.obj["mergedTags"] = [];
            $scope.obj["indexAlertDetails"] = [];
            $scope.obj["soa"] = {
                product: "",
                service: "",
                method: ""
            };

            // 添加报警取值弹窗绑定对象
            var tempAlertParams = {
                tags: [],
                params: [],
                isAll: true
            }
            $scope.tempAlertParams = tempAlertParams;

            // 重置报警取值弹窗绑定对象
            $scope.resetTempAlertParams = function () {

                var tempAlertParams = {
                    tags: [],
                    params: [],
                    isAll: true
                }

                // 默认全选中.
                var tags = commonUtil.deepCopy($scope.obj.indexTagDetails);
                // 添加all
                // 添加All选项
                var all = {
                    name: "total",
                    nameCn: "汇总"
                }

                for (i in tags) {
                    tags[i].tagValues.unshift(all);
                    tags[i].choose = [all];
                }

                tempAlertParams.tags = tags;

                $scope.tempAlertParams = tempAlertParams;

            }

            // 重置报警信息
            $scope.resetAlertTemp = function (operation) {
                $scope.alertTemp = {
                    type: $scope.alertTypeOptions[0],
                    startTime: "0",
                    endTime: "0",
                    compareType: $scope.compareTypeOptions[0],
                    threshold: ['', ''],
                    alertName: "",
                    operation: operation,
                    params: [],
                    timeWindow:0,
                    relativeType:commonUtil.constant.RelativeType.AVG,
                    alertDataType:commonUtil.constant.AlertDataType.TOTAL
                }

                // 有标签的话，设置第一个标签，并设置标签值
                if (typeof($scope.obj.indexTagDetails) != 'undefined' && $scope.obj.indexTagDetails.length > 0) {
                    $scope.alertTemp['tag'] = $scope.obj.indexTagDetails[0];
                    $scope.alertTemp['tagValues'] = $scope.obj.indexTagDetails[0].tagValues;
                }
            }

            $scope.resetAlertTemp("新增");

            $scope.isAbsolute = function () {
                return ($scope.alertTemp.type == $scope.compareTypeOptions[0]);
            }


            $scope.refreshPage = function () {
                // 检查有没有入参
                var paramIndexName = $state.params.indexName;
                if (typeof(paramIndexName) == 'undefined' || paramIndexName == "") {
                    // 新建指标
                    realLogicCode();
                } else {
                    $scope.isNew = -1;
                    // 更新
                    // 初始化指标从后台查询
                    var promise = commonUtil.ajaxPost('./indexManage/getIndexDetail', {
                        'indexName': paramIndexName
                    });
                    promise.success(function (data) {
                        console.log("单个指标信息，接口返回:", data)
                        if (data.retcode == "0") {
                            var newObj = es.responsetoObj(data.body, $scope.defaultTags)

                            $scope.obj = newObj;
                        } else {
                            alertUtil.getInstance().error("", "获取数据失败,异常信息" + data.retdesc);
                            $state.go('index.zbList');
                            return;
                        }
                        realLogicCode();

                    });
                    promise.error(function () {
                        alertUtil.getInstance().error("", "获取数据失败");
                        // 获取数据失败，展示更新页面.
                        realLogicCode();

                    });

                }
            }
            $scope.refreshPage();


            // 准备数据完成以后真正的业务逻辑
            function realLogicCode() {

                // 初始化默认要新增的标签
                $scope.toAddTag = $scope.defaultTags[0];
                // 初始化页面插件.
                $timeout(
                    function () {
                        $(".select2Normal").select2();
                        $(".select2Multiple").select2({allowClear: true});
                        $('#tagSelectModal').modal({
                            backdrop: false,
                            keyboard: false,
                            show: false
                        });
                        $('#tagAddModal').modal({
                            backdrop: false,
                            keyboard: false,
                            show: false
                        });
                        $('#tagValuesAddModal').modal({
                            backdrop: false,
                            keyboard: false,
                            show: false
                        });
                        $('#tagMergeModal').modal({
                            backdrop: false,
                            keyboard: false,
                            show: false
                        });
                        $('#intfExampleModal').modal({
                            backdrop: false,
                            keyboard: false,
                            show: false
                        });
                        $('#AlertInfoModal').modal({
                            backdrop: false,
                            keyboard: false,
                            show: false
                        });
                        $('#tempAlertParamsModal').modal({
                            backdrop: false,
                            keyboard: false,
                            show: false
                        });


                        $("[data-toggle='popover']").popover();

                        // 设置子页面滚动
                        $("#tag_val_div").slimScroll();
                        $("#alert_val_div").slimScroll();
                        $("#intf_example_val_div").slimScroll();

                        // resizable 测试
                        $('.modal > > .modal-content').draggable();
                    }
                );


            }


            // 每次选中数据，重置select2的状态
            $scope.resetSelect2 = function () {
                $timeout(function () {
                    $(".select2Normal").select2();
                    $(".select2Multiple").select2({allowClear: true});
                })

            }
            // 重置soa 和 url
            $scope.resetSoaAndUrl = function () {
                $scope.obj.soa = {
                    product: "",
                    service: "",
                    method: ""
                };
                $scope.obj.url = "";

            }


            // 选择标签
            $scope.showTagSelectModal = function () {
                // 数据初始化
                $('#tagSelectModal').modal('toggle');
                $timeout(function () {
                    $(".select2Normal").select2();
                    $(".select2Multiple").select2({allowClear: true});
                });
            }

            // 新增一个选中的标签.
            $scope.doAddOneTag = function () {
                // 将toAdd 引用加入到obj.indexTagDetails中

                // 校验是否进行初始化
                if ($scope.toAddTag.tagValues.length == 0) {
                    alertUtil.getInstance().warning("", "标签" + $scope.toAddTag.tagNameCn + "(" + $scope.toAddTag.tagName + ")无可用值");
                    return;
                }

                // 校验是否曾经加入过
                if (tagInArray($scope.toAddTag, $scope.obj.indexTagDetails) >= 0) {
                    alertUtil.getInstance().warning("", "标签" + $scope.toAddTag.tagNameCn + "(" + $scope.toAddTag.tagName + ")已经在该指标中");
                    return;
                }
                // 执行新增
                $scope.obj.indexTagDetails.push($scope.toAddTag);

                // 判断是否有标签组合，有的话添加到组合中
                if ($scope.obj.mergedTags.length == 0) {
                    // 无标签组合
                    if ($scope.obj.indexTagDetails.length == 1) {
                        // 标签只有一个不操作
                    } else {
                        // 标签大于一个，进行组合
                        for (i in $scope.obj.indexTagDetails) {
                            var tag = $scope.obj.indexTagDetails[i];
                            $scope.tempMergeTag = tag;
                            $scope.mergeTag();
                        }
                        $scope.addMergeTag();

                        if ($scope.obj.indexTagDetails.length > 2) {
                            commonUtil.alertUtil.warning("", "标签组合已经重置！！");
                            if (!$scope.mtShow) {
                                $scope.mtShow = true;
                            }
                        }
                    }


                } else if ($scope.obj.mergedTags.length == 1) {

                    // 有且只有一个标签组合
                    if ($scope.obj.mergedTags[0].length == $scope.obj.indexTagDetails.length - 1) {
                        // 验证标签组合是否包含所有标签
                    } else {
                        commonUtil.alertUtil.warning("", "标签组合已经重置！！");
                        if (!$scope.mtShow) {
                            $scope.mtShow = true;
                        }
                    }

                    $scope.obj.mergedTags = [];
                    for (i in $scope.obj.indexTagDetails) {
                        var tag = $scope.obj.indexTagDetails[i];
                        $scope.tempMergeTag = tag;
                        $scope.mergeTag();
                    }
                    $scope.addMergeTag();


                } else {
                    // 存在多个标签组合
                    $scope.obj.mergedTags = [];
                    for (i in $scope.obj.indexTagDetails) {
                        var tag = $scope.obj.indexTagDetails[i];
                        $scope.tempMergeTag = tag;
                        $scope.mergeTag();
                    }
                    $scope.addMergeTag();

                    commonUtil.alertUtil.warning("", "标签组合已经重置！！");
                    if (!$scope.mtShow) {
                        $scope.mtShow = true;
                    }
                }


                // 关闭弹窗
                $('#tagSelectModal').modal('toggle');
                $timeout(function () {
                    // 重置页面眼睛特效
                    $("[data-toggle='popover']").popover();
                    // 重置标签select2
                    $(".select2Normal").select2();
                    $(".select2Multiple").select2({allowClear: true});

                });

            }

            // 选择标签
            $scope.showTagAddModal = function () {
                $('#tagAddModal').modal('toggle');
                $scope.nameModel = {
                    name: "",
                    nameCn: "",
                    type: "新增标签"
                }
            }
            // 上传标签文件
            $scope.showTagValuesAddModal=function(){
            	$("#tagValuesAddModal").modal('toggle');
            	 $scope.nameModel = {
                         name: "",
                         nameCn: "",
                         type: "上传标签文件"
                     }
            	 $scope.fileInfo={
                 		name:"",
                 		size:0
                 };
                  
                 $scope.tableDemo={
                 		thead:[],
                 		tbody:[]
                 };
                 $scope.fileName="";
                 $(".modal-footer").hide();
            }
            // 选择标签
            $scope.showTagValueAddModal = function () {
                $('#tagAddModal').modal('toggle');
                $scope.nameModel = {
                    name: "",
                    nameCn: "",
                    type: "新增标签值"
                }
            }

            // 新增标签
            $scope.doAddOneTagValOrTag = function () {
                // 去空格和特殊字符
                $scope.nameModel.name = commonUtil.trim($scope.nameModel.name);
                $scope.nameModel.nameCn = commonUtil.trim($scope.nameModel.nameCn);
                if (!commonUtil.validate($scope.nameModel.name)) {
                    alertUtil.getInstance().warning("", $scope.nameModel.name + "包含特殊字符");
                    return;
                }
                // if(!commonUtil.validate($scope.nameModel.nameCn)){
                // alertUtil.getInstance().warning("",
				// $scope.nameModel.nameCn+"包含特殊字符");
                // return;
                // }

                // 验证参数
                if ($scope.nameModel.name == "") {
                    alertUtil.getInstance().warning("", "英文名不能为空");
                    return;
                }
                if ($scope.nameModel.nameCn == "") {
                    alertUtil.getInstance().warning("", "中文名不能为空");
                    return;
                }
                if ($scope.nameModel.type == "新增标签值") {
                    // 不允许重复
                    for (i in $scope.toAddTag.tagValues) {
                        if ($scope.nameModel.name == $scope.toAddTag.tagValues[i].name) {
                            alertUtil.getInstance().warning("", "标签值" + $scope.nameModel.name + "已经存在");
                            return;
                        }
                        if ($scope.nameModel.nameCn == $scope.toAddTag.tagValues[i].nameCn) {
                            alertUtil.getInstance().warning("", "标签值" + $scope.nameModel.nameCn + "已经存在");
                            return;
                        }
                    }

                    // 增加数据
                    $scope.toAddTag.tagValues.unshift(commonUtil.deepCopy($scope.nameModel));
                }else if ($scope.nameModel.type == "新增标签") {
                    // 不允许重复
                    for (i in $scope.defaultTags) {
                        if ($scope.nameModel.name == $scope.defaultTags[i].tagName) {
                            alertUtil.getInstance().warning("", "标签值" + $scope.nameModel.name + "已经存在");
                            return;
                        }
                        if ($scope.nameModel.nameCn == $scope.defaultTags[i].tagNameCn) {
                            alertUtil.getInstance().warning("", "标签值" + $scope.nameModel.nameCn + "已经存在");
                            return;
                        }
                    }

                    var newTag = {
                        tagName: $scope.nameModel.name,
                        tagNameCn: $scope.nameModel.nameCn,
                        tagValues: []

                    }

                    // 增加数据
                    $scope.defaultTags.push(newTag);
                    // 重置状态
                    $scope.nameModel = {
                        name: "",
                        nameCn: "",
                        nameModel: "新增标签值"
                    }

                } else {
                    alertUtil.getInstance().error("", "类型" + $scope.nameModel.type + "错误");
                }


                // 关闭弹窗
                $('#tagAddModal').modal('toggle');
            }
            
            // 上传标签值文件
            $scope.doAddTagValues=function(){
            	var tagValues=[];
            	var obj={
            			nameCn:"",
            			name:""
            	}
            	for(i in $scope.tableDemo.tbody){
            		// 验证参数:去除空格，特殊字符，空字符串
            		obj.nameCn=commonUtil.trim($scope.tableDemo.tbody[i].nameCn);
            		obj.name=commonUtil.trim($scope.tableDemo.tbody[i].name);
            		 if(!commonUtil.validate(obj.name)){
            			 alertUtil.getInstance().warning("", obj.name + "包含特殊字符");
                         return;
            		 }
            		 if (obj.nameCn == "" || typeof(obj.nameCn)=="undefined") {
                         alertUtil.getInstance().warning("", "中文名不能为空");
                         return;
                     }
                     if (obj.name == "" || typeof(obj.name)=="undefined") {
                         alertUtil.getInstance().warning("", "英文名不能为空");
                         return;
                     }
                  // 中文是否重复
             		if (tagValueInArray(false,$scope.tableDemo.tbody[i], tagValues) >= 0){
             			alertUtil.getInstance().warning("", "标签值" + obj.nameCn + "已经存在");
                         return;
             		}
            		// 英文是否重复
            		if (tagValueInArray(true,$scope.tableDemo.tbody[i], tagValues) >= 0){
            			alertUtil.getInstance().warning("", "标签值" + obj.name + "已经存在");
                        return;
            		}
            		// 增加数据
            		tagValues.unshift(commonUtil.deepCopy(obj));
            	}
            	$scope.toAddTag.tagValues=tagValues;
            	 // 关闭弹窗
                $('#tagValuesAddModal').modal('toggle');
            }
            // 根据标签详情数据生成table
            $scope.initTable = function (index) {
                var length = $scope.obj.indexTagDetails.length;
                if (index < 0 || index > length) {
                    alertUtil.getInstance().error("", "index:" + index + "异常");
                    return;
                }

                var tagValues = $scope.obj.indexTagDetails[index].tagValues;
                var html = '<table class="table table-hover table-bordered"><tbody><tr><th>中文</th><th>英文</th></tr>';
                for (i in tagValues) {
                    html += '<tr><td>' + tagValues[i].nameCn + '</td><td>' + tagValues[i].name + '</td></tr>';
                }
                html += '</tbody></table>';
                return html;
            }


            // 删除一个标签
            $scope.deleteOneTag = function (index) {
                var length = $scope.obj.indexTagDetails.length;
                if (index < 0 || index > length) {
                    alertUtil.getInstance().error("", "index:" + index + "异常");
                    return;
                }

                var temp = $scope.obj.indexTagDetails[index];

                if (!$scope.mtShow) {
                    // 用户不可见情况下直接重置标签组合。

                } else {

                    // 用户可见情况判断该标签是否存在组合
                    if ($scope.obj.mergedTags.length > 0) {
                        for (i in $scope.obj.mergedTags) {
                            if (tagInArray(temp, $scope.obj.mergedTags[i]) >= 0) {
                                var mergeeName = "";
                                for (j in $scope.obj.mergedTags[i]) {
                                    mergeeName += $scope.obj.mergedTags[i][j].tagNameCn;
                                    if (j != $scope.obj.mergedTags[i].length - 1) {
                                        mergeeName += "+";
                                    }
                                }
                                alertUtil.getInstance().error("", "请先删除标签" + temp.tagNameCn + "的组合:" + mergeeName);
                                return;
                            }
                        }

                    }
                }


                // 判断该标签是否存在报警
                // if ($scope.obj.indexAlertDetails.length > 0) {
                // for (i in $scope.obj.indexAlertDetails) {
                // var alert = $scope.obj.indexAlertDetails[i];
                // if (temp.tagName == alert.tagName.tagName) {
                //
                // alertUtil.getInstance().error("", "请先删除标签" + temp.tagNameCn +
				// "的报警");
                // return;
                // }
                //
                // }
                // }

                $scope.obj.indexTagDetails.splice(index, 1);

                if (!$scope.mtShow) {
                    // 用户不可见情况下直接重置标签组合。
                    $scope.obj.mergedTags = [];
                    if ($scope.obj.indexTagDetails.length >= 2) {

                        for (i in $scope.obj.indexTagDetails) {
                            var tag = $scope.obj.indexTagDetails[i];
                            $scope.tempMergeTag = tag;
                            $scope.mergeTag();
                        }
                        $scope.addMergeTag();
                    }
                }
            }

            // 删除标签的一个值
            $scope.deleteOneTagVal = function (index) {
                var length = $scope.toAddTag.tagValues.length;
                if (index < 0 || index > length) {
                    alertUtil.getInstance().error("", "index:" + index + "异常");
                    return;
                }
                $scope.toAddTag.tagValues.splice(index, 1);
            }

            // 标签组合
            $scope.showTagMergeModal = function () {

                // 只有数字型指标允许标签组合
                if ($scope.obj.dataClassify != es.DataClassify.NumType && $scope.obj.dataClassify != es.DataClassify.PercentType) {
                    alertUtil.getInstance().error("", "只有数字型和百分比型指标允许标签组合");
                    return;
                }

                if ($scope.obj.indexTagDetails.length < 2) {
                    alertUtil.getInstance().error("", "没有足够的标签用来组合");
                    return;
                }
                // 默认设置第一个选中
                $scope.tempMergeTag = $scope.obj.indexTagDetails[0];
                // 重置
                $scope.tempMergeTags = [];
                $('#tagMergeModal').modal('toggle');
                $timeout(function () {
                    $(".select2Normal").select2();
                    $(".select2Multiple").select2({allowClear: true});
                });

            }
            // 合并两个标签
            $scope.mergeTag = function () {
                // 校验tempMergeTag是不是为空
                if ($scope.tempMergeTag == {}) {
                    alertUtil.getInstance().error("", "未选择标签");
                    return;
                }
                // 验证是否曾经组合过
                if (tagInArray($scope.tempMergeTag, $scope.tempMergeTags) >= 0) {
                    alertUtil.getInstance().error("", "不允许重复组合");
                    return;

                }
                // 合并
                $scope.tempMergeTags.push($scope.tempMergeTag);


            }

            // 添加标签组合
            $scope.addMergeTag = function () {

                if ($scope.tempMergeTags.length <= 1) {
                    alertUtil.getInstance().error("", "未组合标签");
                    return;
                }

                // 检查 $scope.obj.mergedTags是否包含要加入的组合
                if ($scope.obj.mergedTags.length > 0) {
                    for (i in $scope.obj.mergedTags) {
                        for (j in $scope.tempMergeTags) {
                            if (tagInArray($scope.tempMergeTags[j], $scope.obj.mergedTags[i]) >= 0) {
                                alertUtil.getInstance().error("", "不允许重复组合");
                                return;
                            }
                        }
                    }
                }

                // 将$scope.tempMergeTags 加入$scope.mergedTags
                $scope.obj.mergedTags.push($scope.tempMergeTags);

                // 重置
                $scope.tempMergeTags = [];
                $scope.tempMergeTag = {};

                // 关闭弹窗
                $('#tagMergeModal').modal('hide');
            }

            // 删除一条组合
            $scope.removeOneMerge = function (index) {
                var length = $scope.obj.mergedTags.length;
                if (index < 0 || index > length) {
                    alertUtil.getInstance().error("", "index:" + index + "异常");
                    return;
                }

                $scope.obj.mergedTags.splice(index, 1);
            }
            
            // 弹出增加报警信息的弹窗
            $scope.addOneAlert = function () {
                // 检查有无标签
                if ($scope.obj.indexTagDetails.length == 0) {
                    alertUtil.getInstance().error("", "无可用标签");
                    return;
                }
                $scope.resetAlertTemp("新增");
                //
                //
                // var tempAlert = {
                // tagName: $scope.obj.indexTagDetails[0],
                // tagNameVals: $scope.obj.indexTagDetails[0].tagValues,
                // compareType: es.CompareType.GT,
                // threshold: ["", ""],
                // alertName: "",
                // startTime:"0",
                // endTime:"0"
                // }
                // $scope.obj.indexAlertDetails.push(tempAlert);
                //
                // 初始化select2
                $timeout(function () {
                    $(".select2Normal").select2();
                    $(".select2Multiple").select2({allowClear: true});
                    // $('#AlertInfoModal_body').draggable();
                    // $('#AlertInfoModal_body').resizable();
                });

                $('#AlertInfoModal').modal('show');




            }

            // 更新数据库中报警信息
            $scope.updateAlertDb = function () {

                var alertParam = es.indexAlertDetailsToParam($scope.obj.indexAlertDetails);
                var param = {
                    indexName: $scope.obj.indexName,
                    dataStr: JSON.stringify(alertParam)
                }

                console.log("更新报警信息，入参", alertParam);
                var promise = commonUtil.ajaxPost("./indexManage/updateAlertInfos", param);

                promise.success(function (data) {
                    if (data.retcode != '0') {
                        commonUtil.alertUtil.error("", "异常信息:" + data.retdesc);
                    } else {
                        commonUtil.alertUtil.info("", "操作成功");
                    }
                    // 刷新页面
                    // $state.go('index.zbEdit', {indexName:
					// $scope.obj.indexName},{reload:true})
                    $scope.refreshPage();

                }).catch(function (err) {
                    commonUtil.alertUtil.error("", "请求失败!");
                    // 刷新页面
                    // $state.go('index.zbEdit', {indexName:
					// $scope.obj.indexName},{reload:true})
                    $scope.refreshPage();
                });

            }


            // 表单校验.
            $scope.validateAlertTemp = function () {
                var temp = $scope.alertTemp;
                // 校验表单
                // 是否设置报警名称
                temp.alertName = commonUtil.trim(temp.alertName);
                if (temp.alertName == "") {
                    alertUtil.getInstance().error("", "未设置报警组名称");
                    return false;
                }

                temp.threshold[0] = commonUtil.trim(temp.threshold[0]);
                if (temp.threshold[0] === "") {
                    alertUtil.getInstance().error("", "报警策略未设置阀值");
                    return false;
                }
                if (!commonUtil.isNum(temp.threshold[0])) {
                    alertUtil.getInstance().error("", "报警策略阀值必须是数字");
                    return false;
                }

                // between
                if (temp.compareType == es.CompareType.BTW) {
                    temp.threshold[1] = commonUtil.trim(temp.threshold[1]);
                    if (temp.threshold[1] === "") {
                        alertUtil.getInstance().error("", "报警策略未设置阀值");
                        return false;
                    }
                    if (!commonUtil.isNum(temp.threshold[1])) {
                        alertUtil.getInstance().error("", "报警策略阀值必须是数字");
                        return false;
                    }
                    if (parseFloat(temp.threshold[0]) >= parseFloat(temp.threshold[1])) {
                        alertUtil.getInstance().error("", "报警策略阀值范围设置不合法");
                        return false;
                    }
                } else {
                    temp.threshold[1] = "";
                }
                // startTime endTime校验
                if (temp.startTime == "" || typeof(temp.startTime) == 'undefined' || !commonUtil.isNum(temp.startTime)) {
                    alertUtil.getInstance().error("", "startTime设置不合法");
                    return false;
                }
                if (temp.endTime == "" || typeof(temp.endTime) == 'undefined' || !commonUtil.isNum(temp.endTime)) {
                    alertUtil.getInstance().error("", "endTime设置不合法");
                    return false;
                }
                if (parseInt(temp.endTime) < parseInt(temp.startTime)) {
                    alertUtil.getInstance().error("", "endTime < startTime");
                    return false;
                }
                // 必须选择标签
                // if (temp.tagValues.length <= 0) {
                // alertUtil.getInstance().error("", "标签:" + temp.tag.tagNameCn
				// + "未选择标签值或标签值的组合");
                // return false;
                // }
                if(temp.params.length == 0){
                    alertUtil.getInstance().error("", "未选择报警的取值");
                    return false;
                }

                // timeWindow
                var timeWindow = commonUtil.trim(temp.timeWindow);
                if(!commonUtil.isNum(timeWindow)){
                    alertUtil.getInstance().error("", "最近N分钟必须是数字!");
                    return false;
                }
                if(parseInt(timeWindow) < 0){
                    alertUtil.getInstance().error("", "最近N分钟不能小于0");
                    return false;
                }

                // relativeType

                // timewindow为0的情况下 alertDataType 百分比指标只支持平均值不支持total
                if(parseInt(timeWindow) !=0){
                    var alertDataType = temp.alertDataType;
                    if(es.translateEnum($scope.obj.dataClassify.id) == es.DataClassify.PercentType){
                        if(commonUtil.constant.AlertDataType.getEnumById(alertDataType.id) == commonUtil.constant.AlertDataType.TOTAL){
                            alertUtil.getInstance().error("", "百分比型指标不支持TOTAL");
                            return false;
                        }
                    }
                }



                return true;

            }


            // 增加一条报警信息
            $scope.doAddOneAlert = function () {

                if ($scope.validateAlertTemp()) {

                    if ($scope.isNew < 0) {
                        commonUtil.ConfirmUtil.showConfirm("确认新增当前报警信息?", function () {
                            // 将数据加入数组，重置temp
                            $scope.obj.indexAlertDetails.push(commonUtil.deepCopy($scope.alertTemp));
                            $scope.resetAlertTemp("新增");
                            $('#AlertInfoModal').modal('hide');
                            $scope.updateAlertDb();
                        })
                    } else {
                        // 将数据加入数组，重置temp
                        $scope.obj.indexAlertDetails.push(commonUtil.deepCopy($scope.alertTemp));
                        $scope.resetAlertTemp("新增");
                        $('#AlertInfoModal').modal('hide');
                    }


                }


            }


            // 更新弹窗
            $scope.updateOneAlert = function (index) {

                $scope.alertTemp = commonUtil.deepCopy($scope.obj.indexAlertDetails[index]);
                $scope.alertTemp.operation = "更新";
                $scope.alertTemp.index = index;
                // select需要重置
                $scope.alertTemp.type = commonUtil.constant.AlermMode.getEnumByField($scope.alertTemp.type.field);


                // try {
                // for (i in $scope.obj.indexTagDetails) {
                // if ($scope.obj.indexTagDetails[i].tagNameCn ==
				// $scope.alertTemp.tag.tagNameCn) {
                // $scope.alertTemp.tag = $scope.obj.indexTagDetails[i];
                // }
                // }
                // } catch (err) {
                // commonUtil.alertUtil.error("", err);
                // $scope.alertTemp.tag = $scope.obj.indexTagDetails[0];
                // }
                // //标签值
                // var tagValues = [];
                // for (i in $scope.alertTemp.tag.tagValues) {
                // for (j in $scope.alertTemp.tagValues) {
                // if ($scope.alertTemp.tagValues[j].name ==
				// $scope.alertTemp.tag.tagValues[i].name) {
                // tagValues.push($scope.alertTemp.tag.tagValues[i]);
                // }
                // }
                // }
                // $scope.alertTemp.tagValues = tagValues;

                $scope.alertTemp.compareType = es.translateEnum($scope.alertTemp.compareType.id);
                $scope.alertTemp.relativeType=commonUtil.constant.RelativeType.getEnumById($scope.alertTemp.relativeType.id);
                $scope.alertTemp.alertDataType = commonUtil.constant.AlertDataType.getEnumById($scope.alertTemp.alertDataType.id);

                $('#AlertInfoModal').modal('show');
                $timeout(function () {
                    $(".select2Normal").select2();
                    $(".select2Multiple").select2({allowClear: true});
                });
            }

            // 更新一条数据
            $scope.doUpdateOneAlert = function () {
                if ($scope.validateAlertTemp()) {

                    if ($scope.isNew < 0) {
                        commonUtil.ConfirmUtil.showConfirm("确认更新当前报警信息?", function () {
                            $scope.obj.indexAlertDetails[$scope.alertTemp.index] = commonUtil.deepCopy($scope.alertTemp);
                            $('#AlertInfoModal').modal('hide');
                            $scope.resetAlertTemp("新增");
                            // 如果是更新，关闭窗口同事更新后台
                            $scope.updateAlertDb();
                        });
                    } else {
                        $scope.obj.indexAlertDetails[$scope.alertTemp.index] = commonUtil.deepCopy($scope.alertTemp);
                        $('#AlertInfoModal').modal('hide');
                        $scope.resetAlertTemp("新增");
                        // 如果是更新，关闭窗口同事更新后台
                    }
                }

            }


            // 删除一条报警信息
            $scope.doDeleteOneAlert = function (index) {

                if ($scope.isNew < 0) {
                    commonUtil.ConfirmUtil.showConfirm("确认删除第" + (index + 1) + "项报警信息?", function () {
                        $scope.obj.indexAlertDetails.splice(index, 1);
                        $scope.updateAlertDb();
                    });

                } else {
                    $scope.obj.indexAlertDetails.splice(index, 1);
                }

            }


            // 保存标签
            $scope.saveIndex = function () {
                // 表单校验
                if (es.validateForm($scope.obj)) {
                    // 校验通过
                    var param = es.objToParam($scope.obj);
                    // 发送请求
                    var realParam = $.extend({}, {
                        indexBaseInfoVoStr: JSON.stringify(param),
                        isNew: $scope.isNew
                    });
                    //
                    console.log("新增指标，入参:", param);
                    commonUtil.ajaxPost("./indexManage/saveIndex", realParam, function (data) {
                        // 请求成功
                        if (data.retcode == '0') {
                            alertUtil.getInstance().info("", "新增成功");

                            // 跳转到列表页
                            $state.go('index.zbList');
                        } else {
                            alertUtil.getInstance().error("", data.retdesc);
                        }

                    }, function (data) {
                        // 请求失败
                        alertUtil.getInstance().error("", "调用新增接口失败");
                    })

                } else {
                    // 校验未通过
                }
            }
            // 保存更新
            $scope.updateIndex = function () {
                // 表单校验
                if (es.validateForm($scope.obj)) {
                    // 校验通过
                    var param = es.objToParam($scope.obj);
                    // 发送请求
                    var realParam = $.extend({}, {
                        indexBaseInfoVoStr: JSON.stringify(param),
                        isNew: $scope.isNew
                    });
                    console.log("更新指标，入参:", param);
                    commonUtil.ajaxPost("./indexManage/saveIndex", realParam, function (data) {
                        // 请求成功
                        if (data.retcode == '0') {
                            alertUtil.getInstance().info("", "操作成功");
                            // 跳转到列表页
                            $state.go('index.zbList');
                        } else {
                            alertUtil.getInstance().error("", data.retdesc);
                        }

                    }, function (data) {
                        // 请求失败
                        alertUtil.getInstance().error("", "调用新增接口失败");
                    })

                } else {
                    // 校验未通过
                }

            }


            // jquery的引用类型在判断inArray的时候会失败，所以重写这个方法
            function tagInArray(tag, array) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i].tagName == tag.tagName) {
                        return i;
                    }

                }
                return -1;

            }
            // tagValue是否重复
            function tagValueInArray(isEn,tag,array){
            	for(var i=0;i<array.length;i++){
            		if(isEn){
            			if(array[i].name==tag.name){
                			return i;
                		}
            		}else{
            			if(array[i].nameCn==tag.nameCn){
                			return i;
                		}
            		}
            	}
            	return -1;
            }
            /*
			 * popover适应angularjs
			 */
            $scope.popoverShow = function ($event) {
                var obj = $event.target;
                $(obj).popover('show');
            }
            $scope.popoverHide = function ($event) {
                var obj = $event.target;
                $(obj).popover('hide');
            }

            // 重置报警设置的select2.
            $scope.resetAlertSelect2 = function () {
                $timeout(function () {
                    $(".select2Normal").select2();
                    $(".select2Multiple").select2({allowClear: true});
                });

            }

            // 展示接口示例.
            $scope.showIntfExample = function () {

                $scope.intfExample = {
                    desc: "",
                    data: {}
                }

                // 检查有无标签
                if ($scope.obj.indexTagDetails.length == 0) {
                    alertUtil.getInstance().error("", "无可用标签");
                    return;
                }
                if ($scope.obj.indexName == "") {
                    alertUtil.getInstance().error("", "请先定义指标名称");
                    return;
                }

                $('#intfExampleModal').modal('show');
                // 获取标签和标签组
                var tagsAll = $scope.obj.indexTagDetails;
                var tagGroups = $scope.obj.mergedTags;

                var notMergeTag = [];
                var mergeTag = [];
                if (tagGroups.length != 0) {
                    for (i in tagsAll) {
                        if (es.isTagMerged(tagsAll[i], tagGroups)) {
                            mergeTag.push(tagsAll[i]);
                        } else {
                            notMergeTag.push(tagsAll[i]);
                        }
                    }
                } else {
                    notMergeTag = tagsAll;
                }

                // 判断是主动还是被动
                if ($scope.obj.simplingType.desc == "主动") {
                    // 拉取数据.response
                    $scope.intfExample.desc = "业务系统接口返回值示例如下:";
                    $scope.intfExample.data["retcode"] = "0";
                    $scope.intfExample.data["retdesc"] = "";
                    $scope.intfExample.data["serverIp"] = "xxx.xxx.xxx.xxx";
                    // 生成body;
                    var body = {
                        collectTime: "2017-01-01 00:00:00"
                    }
                    var tagValues = es.getIntfTagValues(notMergeTag, tagGroups, $scope.obj.dataClassify);
                    body["tagValues"] = tagValues;
                    $scope.intfExample.data["body"] = body;

                    $scope.intfExample.jsonStr = JSON.stringify($scope.intfExample.data, null, "\t");

                } else {
                    // 推送数据.request
                    $scope.intfExample.desc = "业务系统调用接口入参示例如下:";
                    $scope.intfExample.data["sourceCode"] = "hotel-index-monitor";
                    $scope.intfExample.data["body"] = {};
                    $scope.intfExample.data.body["indexName"] = $scope.obj.indexName;
                    $scope.intfExample.data.body["collectTime"] = "2017-01-01 00:00:00";
                    var tagValues = es.getIntfTagValues(notMergeTag, tagGroups, $scope.obj.dataClassify);
                    $scope.intfExample.data.body["tagValues"] = tagValues;
                    $scope.intfExample.jsonStr = JSON.stringify($scope.intfExample.data, null, "\t");
                }
            }


            // //报警信息展示.
            // $scope.updateOneAlert = function (index) {
            // var alert = $scope.obj.indexAlertDetails[index];
            // return commonUtil.getAlertDesc(alert.type, alert.compareType,
			// alert.threshold);
            // }

            // 报警valuehtml
            $scope.alertValuesHtmls = function (index) {
                var alert = $scope.obj.indexAlertDetails[index];
                var text = "<table><tbody>"
                for (i in alert.params) {
                    text += "<tr><td>" + alert.params[i] + "</td></tr>"
                }
                text += "</tbody></table>";
                return text;
            }

            // 添加一个报警条件
            $scope.showTempAlertParamsModal = function () {
                $scope.resetTempAlertParams();
                $timeout(function () {
                    $(".select2Multiple").select2({allowClear: true});
                    $('#tempAlertParamsModal').modal("show");

                });
            }

            // 添加报警条件.
            $scope.doAddAlertParams = function () {
                // 如果无标签，提示选择标签并重置
                var tags = $scope.tempAlertParams.tags;
                if (tags.length == 0) {
                    commonUtil.alertUtil.error("", "请至少选择一个标签");
                    $scope.resetTempAlertParamsBtn();
                    return;
                }

                // 未选择的标签提示并删除
                for (i in tags) {
                    if (tags[i].choose.length == 0) {
                        commonUtil.alertUtil.error("", "标签" + tags[i].tagName + "无可用取值");
                        //tags.splice(i, 1);
                        $timeout(function () {
                            $(".select2Multiple").select2({allowClear: true});
                        });
                        return;
                    }
                }


                // 笛卡尔积
                var detail = [];
                for (i in tags) {
                    var tag = tags[i];
                    var name = tag.tagName;
                    var array = tag.choose;

                    if(array.length==1&&array[0].name=='total'){
                        continue;
                    }

                    // 处理detail
                    var tempDetail = [];
                    for (j in array) {
                        if (detail.length == 0) {// 第一遍循环
                            tempDetail.push(name + "=" + array[j].name);
                        } else {
                            for (k in detail) {
                                var oneDetail = detail[k] + "_" + name + "=" + array[j].name;
                                tempDetail.push(oneDetail);
                            }
                        }
                    }
                    detail = tempDetail;
                }

                if(detail.length==0){
                    detail=["ALL=ALL"];
                }

                // 数据加入alertTemp.params
                var array = $scope.alertTemp.params;
                var count = 0;
                for (i in detail) {
                    if ($.inArray(detail[i], array) < 0) {
                        array.push(detail[i]);
                        count++;
                    }
                }

                commonUtil.alertUtil.info("", "新增" + count + "个取值");

                $('#tempAlertParamsModal').modal("hide");
            }

            // //删除一个条件.
            // $scope.minusOneTagInTempAlertParams = function (index) {
            //
            // $scope.tempAlertParams.tags.splice(index, 1);
            // $timeout(function () {
            // $(".select2Multiple").select2({allowClear: true});
            // });
            //
            // }

            // select全选
            $scope.selectAll = function (index) {
                var tag = $scope.tempAlertParams.tags[index];

                var choose = [];

                for (i in tag.tagValues) {
                    if (i > 0) {
                        choose.push(tag.tagValues[i]);
                    }
                }
                tag.choose=choose;
                $timeout(function () {
                    $(".select2Multiple").select2({allowClear: true});
                });
            }

            // select选中时候，如果内容包含ALL，并且不只有All 删除all
            $scope.selectChange = function (index) {
                var tag = $scope.tempAlertParams.tags[index];

                var array = tag.choose;
                if (array.length > 1) {
                    for (i in array) {
                        if (array[i].name == 'total') {
                            array.splice(i, 1);
                        }
                    }
                }
            }

            // resetTempAlertParams按钮事件
            $scope.resetTempAlertParamsBtn = function () {
                $scope.resetTempAlertParams();
                $timeout(function () {
                    $(".select2Multiple").select2({allowClear: true});
                });
            }

            // 清空所有temp报警取值
            $scope.clearAlertTempParams= function (){
                $scope.alertTemp.params=[];
            }

            // 重置采样相关设置
            $scope.resetSimplingOptions = function(){
                if($scope.obj.simplingType==es.IndexSimplingType.PassiveType){
                    // 被动方式，清空soa ,url, 超时时间 类型 soa
                    $scope.obj.isSoa = true;
                    $scope.obj.url="";
                    $scope.obj.soa= {
                        product: "",
                        service: "",
                        method: ""
                    }
                    $scope.obj.timeOut="";
                }else{
                    $scope.obj.isSoa = true;
                    $scope.obj.url="http://";
                    $scope.obj.soa= {
                        product: "",
                        service: "",
                        method: ""
                    }
                    $scope.obj.timeOut="10000";
                }
            }
            // 报警信息展示.
            $scope.alertDesc = function (index) {
                var alert = $scope.obj.indexAlertDetails[index];
                return commonUtil.getAlertDesc(alert.type, alert.compareType, alert.threshold,alert.timeWindow,alert.relativeType,alert.alertDataType);
            }
            // 上传标签文件
            var rABS=false;
            // 读取Excel文件
            $scope.readfls=function(){
            	$scope.fileName="";
            	var ImportFile=null;
            	var fls=$("#FileInput").prop('files');
            	if(fls&&fls.length>0){
            		ImportFile=fls[0];
            		var fileX=ImportFile.name.split(".").reverse()[0];
            		var fileXyes=false;
            		if(fileX=="xlsx"){
            			fileXyes = true;
            		}
				// ["xlsx", "xlc", "xlm", "xls", "xlt", "xlw",
				// "csv"].forEach(function (value,
				// index, array) {
				// if (fileX === value) {
				// fileXyes = true;
				// }
				// });
            		if(fileXyes){
            			$scope.fileInfo.name=ImportFile.name;
            			$scope.fileInfo.size=ImportFile.size;
            			$scope.file2Xce(ImportFile).then(function(t){
            				$scope.fixTable(t)
            			});
            			$(".modal-footer").show();
            		}else{
            			 commonUtil.alertUtil.warning("仅支持.xlsx为后缀的文件,请重新选择", "");
            		}
            		
            	}
            }
            $scope.fixTable=function(t){
            	console.log("执行完毕");
				if(t && t.length>0){
					 var tmpHead = [];
                     var pmodel = {};
                     for (var itm in t[0]) {
                         tmpHead.push(itm);
                         pmodel[itm] = itm;
                     }
                 if(tmpHead.length>2){
                	 commonUtil.alertUtil.warning("Excel只允许有两列", "");
                     return;
     				}    
			        if(tmpHead[0]!="nameCn"){
			        	commonUtil.alertUtil.warning("Excel第一列名称必须为nameCn", "");
			            return;
			        }
			       if(tmpHead[1]!="name"){
			    	  commonUtil.alertUtil.warning("Excel第二列名称必须为name", "");
		            return;
		        }
			       $scope.$apply(function(){
			    	  $scope.tableDemo.thead = tmpHead;
 			      $scope.tableDemo.tbody = t;  
			       });
				}
            }
            // 读取完成的数据,渲染表格
            var wb;
            $scope.file2Xce=function(f){
            	return new Promise(function(resolve,reject){
            		var reader=new FileReader();
            		reader.onload=function(e){
	            		var data=e.target.result;
	            		if(rABS){
		            		wb=XLSX.read(btoa(fixdata(data)),{
		            		type:'base64'
	            		});
	            		}else{
	            			wb = XLSX.read(data, {
	                        type: 'binary'
	                        });
	            		}
	            			resolve(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
            		}
            		if(rABS){
            			reader.readAsArrayBuffer(f);
            		}else{
            			reader.readAsBinaryString(f);
            		}
            	});
            }
          // 文件流转BinaryString
            function fixdata(data){
            	 var o = "",
                 l = 0,
                 w = 10240;
		         for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
		         o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
		         return o;
            }
        }]);
});
