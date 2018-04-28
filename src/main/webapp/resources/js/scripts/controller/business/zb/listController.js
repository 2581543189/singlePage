define(['app', 'ConfirmUtil', 'angular', 'angular-route', 'service/common/alert-util', 'service/common/common-util', 'select2'], function (app, ConfirmUtil) {
    app.controller('zbListController',
        ['$scope', 'alertUtil', '$timeout', 'commonUtil', '$state', '$q', '$compile', '$http', function ($scope, alertUtil, $timeout, commonUtil, $state, $q, $compile, $http) {
            //设置BODYSCROLL
            commonUtil.setScroll();
            //类型常量
            $scope.IndexBaseType =commonUtil.constant.IndexBaseType;

            function getBaseTypeByName(name) {
                switch (name) {
                    case'TechType' :
                        return $scope.IndexBaseType.TechType;
                    case'BizType' :
                        return $scope.IndexBaseType.BizType;
                }
            }

            $scope.IndexBaseTypeOptions = [$scope.IndexBaseType.NoType, $scope.IndexBaseType.BizType, $scope.IndexBaseType.TechType];
            $scope.productServiceOptions = [];
            $scope.productServiceOptions.push({
                name: "",
                list: []
            });


            //定义默认的查询条件
            $scope.queryParam = {
                cnName: "",
                enName: "",
                productLine: $scope.productServiceOptions[0],
                serviceLine: "",
                baseType: $scope.IndexBaseType.NoType,
                detailType: ""
            }

            if(commonUtil.queryContext.ZbList.productLine===''){
                //首次查询，赋值
                commonUtil.queryContext.ZbList.productLine=$scope.productServiceOptions[0];
            }else{
                //非首次查询，还原
                $scope.queryParam = commonUtil.queryContext.ZbList;
            }



            $scope.resetSelect2 = function () {
                $timeout(function () {
                    $("#serviceLineSelect").select2();
                    $("#detailSelect").select2();
                });

            }

            //获取数据
            $scope.refresh = function () {

                //保存查询条件
                commonUtil.queryContext.ZbList.save($scope.queryParam);

                $scope.productServiceOptions = [];
                $scope.productServiceOptions.push({
                    name: "",
                    list: []
                });

                //获取服务产品信息

                //获取指标信息
                //解析入参
                var param = {};
                if (commonUtil.trim($scope.queryParam.cnName).length > 0) {
                    param["cnName"] = $scope.queryParam.cnName;
                }
                if (commonUtil.trim($scope.queryParam.enName).length > 0) {
                    param["enName"] = $scope.queryParam.enName;
                }
                if (commonUtil.trim($scope.queryParam.productLine.name).length > 0) {
                    param["productLine"] = $scope.queryParam.productLine.name;
                }
                if (commonUtil.trim($scope.queryParam.serviceLine).length > 0) {
                    param["serviceLine"] = $scope.queryParam.serviceLine;
                }
                if ($scope.queryParam.baseType != $scope.IndexBaseType.NoType) {
                    param["baseType"] = $scope.queryParam.baseType.id;

                    if (commonUtil.trim($scope.queryParam.detailType).length > 0) {
                        param["detailType"] = $scope.queryParam.detailType;
                    }
                }


                var promise1 = commonUtil.ajaxPost('./indexManage/getIndexList', param);

                promise1.success(function (data) {//获取指标列表
                    //var data = response.data;
                    console.log(data);
                    if (data.retcode == "0") {
                        $scope.list = data.body;
                        //处理分类、抓取方式
                        for (i in $scope.list) {
                            $scope.list[i].baseTypeStr = getBaseTypeByName($scope.list[i].baseType).desc;
                            if ($scope.list[i].simplingType == 'ActiveType') {
                                $scope.list[i].simplingTypeStr = '主动';
                            } else if ($scope.list[i].simplingType == 'PassiveType') {
                                $scope.list[i].simplingTypeStr = '被动';
                            } else {
                                $scope.list[i].simplingTypeStr = 'error';
                            }
                        }

                        //计算组合标签，非组合标签
                        for (i in $scope.list) {
                            var monitor = $scope.list[i]
                            //获取组合标签
                            var mergedTags = [];
                            //组合标签的名字
                            var mergedNamsArray = []
                            if (typeof(monitor.tagGroupInfos) != 'undefined' && monitor.tagGroupInfos.length > 0) {
                                for (i in monitor.tagGroupInfos) {
                                    var str = monitor.tagGroupInfos[i];
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
                                        for (l in monitor.indexTagDetails) {
                                            if (array[k] == monitor.indexTagDetails[l].tagName) {
                                                tags.push(commonUtil.deepCopy(monitor.indexTagDetails[l]));
                                                break;
                                            }
                                        }
                                    }
                                    obj["tags"] = tags;
                                    mergedTags.push(obj);

                                }
                            }

                            //获取非组合标签
                            var unMergedTags = [];
                            for (i in monitor.indexTagDetails) {
                                if ($.inArray(monitor.indexTagDetails[i].tagName, mergedNamsArray) >= 0) {
                                    //$scope.mergedTags.push(data.body.indexTagDetails[i]);
                                } else {
                                    unMergedTags.push(monitor.indexTagDetails[i]);
                                }
                            }
                            monitor.mergedTags = mergedTags;

                            monitor.unMergedTags = unMergedTags;
                        }
                    } else {
                        alertUtil.getInstance().error("", "获取指标数据失败,异常信息:" + data.retdesc);
                    }

                }).catch(function (err) {
                    console.log(err);
                    alertUtil.getInstance().error("", "请求失败");
                });

                var promise3 = commonUtil.ajaxPost('./mySubscribed/getIndex2AlertMap', {});

                promise3.success(function (data) {//获取当前用户订阅信息
                    //var data = response.data;
                    console.log("订阅信息", data);
                    if (data.retcode == "0") {
                        var subscribe = [];
                        for (i in data.body) {
                            subscribe.push(i);
                        }
                        $scope.subscribe = subscribe;

                    } else {
                        alertUtil.getInstance().error("", "获取用户订阅数据失败,异常信息:" + data.retdesc);
                    }


                })


                //获取产品服务列表
                var promise2 = commonUtil.ajaxPost('./indexManage/getProductServices', {});
                promise2.success(function (data, status, config, headers) {
                    console.log(data);
                    if (data.retcode == "0") {
                        var response = data.body;

                        for (key in response) {
                            response[key].unshift("");
                            $scope.productServiceOptions.push({
                                name: key,
                                list: response[key]
                            });
                        }
                        //重置下拉框
                        for (i in $scope.productServiceOptions) {
                            if ($scope.queryParam.productLine.name == $scope.productServiceOptions[i].name) {
                                $scope.queryParam.productLine = $scope.productServiceOptions[i];
                                break;
                            }
                        }


                    } else {
                        alertUtil.getInstance().error("", "获取服务产品数据失败,异常信息:" + data.retdesc);
                    }


                });
                promise2.error(function (data, status, config, headers) {
                    alertUtil.getInstance().error("", "获取服务产品数据失败");
                });


                var all = $q.all([promise1, promise2, promise3]);
                all.then(function () {
                    realLogicCode();
                });

            }

            $scope.refresh();


            //数据准备逻辑完成以后的真正的业务逻辑代码
            function realLogicCode() {
                //设置订阅信息
                for (i in $scope.list) {
                    if ($.inArray($scope.list[i].indexName, $scope.subscribe) >= 0) {
                        $scope.list[i].subscribe = true;
                    } else {
                        $scope.list[i].subscribe = false;
                    }
                }


                //设置单选特效
                $timeout(function () {
                    $(".select2").select2();
                })

            }

            //更新某条指标
            $scope.update = function (name) {
                if (name.length == "") {
                    alertUtil.getInstance().error("", "indexName不能为空");
                    return;
                }
                $state.go('index.zbEdit', {indexName: name})

            }

            $scope.deleteOne = function (name) {
                if (name.length == "") {
                    alertUtil.getInstance().error("", "indexName不能为空");
                    return;
                }
                ConfirmUtil.showConfirm("是否删除指标:" + name + "", function () {
                    //开始删除
                    var promise = commonUtil.ajaxPost('./indexManage/deleteIndex', {
                        indexName: name
                    });
                    promise.success(function (data, status, config, headers) {
                        console.log(data);
                        if (data.retcode == "0") {
                            alertUtil.getInstance().success("", "删除成功");
                            $scope.refresh();
                        } else {
                            alertUtil.getInstance().error("", "删除数据失败,异常信息:" + data.retdesc);
                        }


                    });
                    promise.error(function (data, status, config, headers) {
                        alertUtil.getInstance().error("", "删除数据失败");
                    });


                });
                //$state.go('index.zbEdit',{indexName:name})
            }

            //按钮新增的事件
            $scope.create = function () {
                $state.go("index.zbEdit", {indexName: null});
            }

            //查询事件
            $scope.query = function () {
                $scope.refresh();
            }

            //查询曲线图

            $scope.detail = function (index) {
                var monitor = $scope.list[index];
                //根据标签情况决定跳转页面


                //如果不存在非组合标签，跳转到新页面
                if (monitor.unMergedTags.length == 0 && monitor.mergedTags.length == 1) {
                    $state.go("index.zbDetailLow", {indexName: monitor.indexName});
                    return;
                }
                //如果只有一个标签，跳转到新页面
                if (monitor.unMergedTags.length == 1 && monitor.mergedTags.length == 0) {
                    $state.go("index.zbDetailLow", {indexName: monitor.indexName});
                    return;
                }
                $state.go('index.zbDetail', {indexName: monitor.indexName});
            }

            $scope.overview = function (name) {
                $state.go('index.zbOverview', {indexName: name});
            }


            //#########################################autocomplete测试后续会优化代码################################################

            $scope.changeClass = function (options) {
                var widget = options.methods.widget();
                // remove default class, use bootstrap style
                widget.removeClass('ui-menu ui-corner-all ui-widget-content').addClass('dropdown-menu');
            };

            $scope.myOption = {
                options: {
                    html: true,
                    minLength: 1,
                    onlySelectValid: true,
                    outHeight: 50,
                    source: function (request, response) {

                        var input = request.term;
                        var param = {
                            name: input,
                            type: 'CN'
                        }
                        $http({
                            method: "post",
                            url: './indexManage/nameSug',
                            data: commonUtil.transform(param),//对提交的数据格式化
                            headers: {
                                'Accept': '*/*',
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                            }
                        }).success(function (data) {

                            var array = [];
                            if (data.retcode == '0') {
                                array = data.body;
                            }

//                            array = $scope.myOption.methods.filter(array, request.term);

                            if (!array.length) {
                                array.push({
                                    label: 'not found',
                                    value: null
                                });
                            }
//                            // add "Add Language" button to autocomplete menu bottom
//                            data.push({
//                                label: $compile('<a class="ui-menu-add" ng-click="add()">Add Language</a>')($scope),
//                                value: null
//                            });
                            response(array);

                        }).error(function () {
                            //
                            var array = [];

                            array.push({
                                label: '请求数据异常',
                                value: null
                            });

                            response(array);
                        });

                    }
                },
                events: {
                    change: function (event, ui) {
                        console.log('change', event, ui);
                    },
                    select: function (event, ui) {
                        console.log('select', event, ui);
                    }
                }
            };

            $scope.myOption2 = {
                options: {
                    html: true,
                    minLength: 1,
                    onlySelectValid: true,
                    outHeight: 50,
                    source: function (request, response) {

                        var input = request.term;
                        var param = {
                            name: input,
                            type: 'EN'
                        }
                        $http({
                            method: "post",
                            url: './indexManage/nameSug',
                            data: commonUtil.transform(param),//对提交的数据格式化
                            headers: {
                                'Accept': '*/*',
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                            }
                        }).success(function (data) {

                            var array = [];
                            if (data.retcode == '0') {
                                array = data.body;
                            }

//                            array = $scope.myOption.methods.filter(array, request.term);

                            if (!array.length) {
                                array.push({
                                    label: 'not found',
                                    value: null
                                });
                            }
//                            // add "Add Language" button to autocomplete menu bottom
//                            data.push({
//                                label: $compile('<a class="ui-menu-add" ng-click="add()">Add Language</a>')($scope),
//                                value: null
//                            });
                            response(array);

                        }).error(function () {
                            //
                            var array = [];

                            array.push({
                                label: '请求数据异常',
                                value: null
                            });

                            response(array);
                        });

                    }
                },
                events: {
                    change: function (event, ui) {
                        console.log('change', event, ui);
                    },
                    select: function (event, ui) {
                        console.log('select', event, ui);
                    }
                }
            };


            //########################################结束#############################################################


            //切换订阅状态
            $scope.changeSubscribe = function (index) {

                if (index >= $scope.list.length) {
                    commonUtil.alertUtil.error("index:" + index + "不合法!");
                    return;
                }

                var indexName = $scope.list[index].indexName;

                var subscribe = $scope.list[index].subscribe;

                if (subscribe) {

                    commonUtil.ConfirmUtil.showConfirm("是否取消对指标:" + indexName + "的订阅", function () {
                        doChange('./mySubscribed/deleteSubscribedIndex', indexName);
                    });

                } else {
                    commonUtil.ConfirmUtil.showConfirm("是否添加对指标:" + indexName + "的订阅", function () {
                        doChange('./mySubscribed/saveSubscribedIndex', indexName);
                    });
                }


                function doChange(url, indexName) {
                    var promise = commonUtil.ajaxPost(url, {indexName: indexName});

                    promise.success(function (data) {
                        if (data.retcode != '0') {
                            commonUtil.alertUtil.error("发生异常!异常信息:" + data.retdesc);
                        } else {
                            commonUtil.alertUtil.success("", "操作成功!");
                            $scope.refresh();
                        }
                    });
                    promise.error(function () {
                        commonUtil.alertUtil.error("发生异常!");
                    });
                }

            }


        }]);
});
