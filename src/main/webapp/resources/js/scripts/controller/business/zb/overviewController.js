define(['app', 'service/common/common-util', 'service/business/zb/editService','select2'], function (app) {
    app.controller('zbOverviewController', ['$scope', 'commonUtil', '$state','zbEditService','$timeout' ,function ($scope, commonUtil, $state,es,$timeout) {
        //设置BODYSCROLL
        commonUtil.setScroll();



        //初始化默认标签组
        $scope.defaultTags = commonUtil.deepCopy(es.DEFAULTT_TAGS);
        $scope.alertTypeOptions=[commonUtil.constant.AlermMode.ABSOLUTE,commonUtil.constant.AlermMode.RELATIVE];
        $scope.compareTypeOptions = [es.CompareType.GT, es.CompareType.LT, es.CompareType.GTE, es.CompareType.LTE, es.CompareType.BTW]
        $scope.relativeTypeOptions = [commonUtil.constant.RelativeType.AVG,commonUtil.constant.RelativeType.DOD,commonUtil.constant.RelativeType.WOW,commonUtil.constant.RelativeType.MOM,commonUtil.constant.RelativeType.YOY];
        $scope.alertDataTypeOptions =[commonUtil.constant.AlertDataType.TOTAL,commonUtil.constant.AlertDataType.AVG]
        $scope.simplingTypeOptions = [es.IndexSimplingType.ActiveType, es.IndexSimplingType.PassiveType];

        //初始化指标
        $scope.obj = $.extend({},es.EMPTY);

        //重置报警信息
        $scope.resetAlertTemp=function(operation){
            $scope.alertTemp={
                type:$scope.alertTypeOptions[0],
                startTime:"0",
                endTime:"0",
                compareType:$scope.compareTypeOptions[0],
                threshold:['',''],
                alertName:"",
                operation:operation
            }

            //有标签的话，设置第一个标签，并设置标签值
            if(typeof($scope.obj.indexTagDetails)!='undefined' && $scope.obj.indexTagDetails.length > 0){
                $scope.alertTemp['tag']=$scope.obj.indexTagDetails[0];
                $scope.alertTemp['tagValues']=$scope.obj.indexTagDetails[0].tagValues;
            }
        }

        $scope.resetAlertTemp("更新");


        //检查有没有入参
        var paramIndexName = $state.params.indexName;
        if (typeof(paramIndexName) == 'undefined' || paramIndexName == "") {
            //新建指标
            realLogicCode();
        } else {
            //初始化指标从后台查询
            var promise = commonUtil.ajaxPost('./indexManage/getIndexDetail', {
                'indexName': paramIndexName
            });
            promise.success(function (data) {
                if (data.retcode == "0") {
                    var newObj = es.responsetoObj(data.body,$scope.defaultTags);

                    $scope.obj = newObj;
                    console.log("指标信息:",$scope.obj );
                } else {
                    commonUtil.alertUtil.error("", "获取数据失败,异常信息" + data.retdesc);
                    $state.go('index.zbList');
                    return;
                }
                realLogicCode();

            });
            promise.error(function () {
                commonUtil.alertUtil.error("", "获取数据失败");
                //获取数据失败，展示更新页面.
                realLogicCode();

            });

        }


        //真实业务逻辑代码
        function realLogicCode(){

            $timeout(
                function () {
                    $("[data-toggle='popover']").popover();
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
                    $(".select2").select2();
                    $('.modal > > .modal-content').draggable();
                }
            );

        }


        //展示接口示例.
        $scope.showIntfExample=function(){

            $scope.intfExample={
                desc:"",
                data:{}
            }

            //检查有无标签
            if ($scope.obj.indexTagDetails.length == 0) {
                alertUtil.getInstance().error("", "无可用标签");
                return;
            }
            if ($scope.obj.indexName == "") {
                alertUtil.getInstance().error("", "请先定义指标名称");
                return;
            }

            $('#intfExampleModal').modal('show');
            //获取标签和标签组
            var tagsAll = $scope.obj.indexTagDetails;
            var tagGroups = $scope.obj.mergedTags;

            var notMergeTag = [];
            var mergeTag = [];
            if(tagGroups.length != 0){
                for(i in tagsAll){
                    if(es.isTagMerged(tagsAll[i],tagGroups)){
                        mergeTag.push(tagsAll[i]);
                    }else{
                        notMergeTag.push(tagsAll[i]);
                    }
                }
            }else{
                notMergeTag = tagsAll;
            }

            //判断是主动还是被动
            if($scope.obj.simplingType.desc=="主动"){
                //拉取数据.response
                $scope.intfExample.desc="业务系统接口返回值示例如下:";
                $scope.intfExample.data["retcode"]="0";
                $scope.intfExample.data["retdesc"]="";
                $scope.intfExample.data["serverIp"]="xxx.xxx.xxx.xxx";
                //生成body;
                var body={
                    collectTime:"2017-01-01 00:00:00"
                }
                var tagValues=es.getIntfTagValues(notMergeTag,tagGroups,$scope.obj.dataClassify);
                body["tagValues"]=tagValues;
                $scope.intfExample.data["body"]=body;

                $scope.intfExample.jsonStr = JSON.stringify($scope.intfExample.data, null, "\t");

            }else{
                //推送数据.request
                $scope.intfExample.desc="业务系统调用接口入参示例如下:";
                $scope.intfExample.data["sourceCode"]="hotel-index-monitor";
                $scope.intfExample.data["body"]={};
                $scope.intfExample.data.body["indexName"]=$scope.obj.indexName;
                $scope.intfExample.data.body["collectTime"]="2017-01-01 00:00:00";
                var tagValues=es.getIntfTagValues(notMergeTag,tagGroups,$scope.obj.dataClassify);
                $scope.intfExample.data.body["tagValues"]=tagValues;
                $scope.intfExample.jsonStr = JSON.stringify($scope.intfExample.data, null, "\t");
            }
        }


        //根据标签详情数据生成table
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

        /*
         * popover适应angularjs
         * */
        $scope.popoverShow=function($event){
            var obj=$event.target;
            $(obj).popover('show');
        }
        $scope.popoverHide=function($event){
            var obj=$event.target;
            $(obj).popover('hide');
        }

        //更新弹窗
        $scope.updateOneAlert = function(index){
            $scope.alertTemp = commonUtil.deepCopy($scope.obj.indexAlertDetails[index]);
            $scope.alertTemp.operation = "更新";
            $scope.alertTemp.index = index;
            //select需要重置
            $scope.alertTemp.type = commonUtil.constant.AlermMode.getEnumByField($scope.alertTemp.type.field);

            //try {
            //    for (i in $scope.obj.indexTagDetails) {
            //        if ($scope.obj.indexTagDetails[i].tagNameCn == $scope.alertTemp.tag.tagNameCn) {
            //            $scope.alertTemp.tag = $scope.obj.indexTagDetails[i];
            //        }
            //    }
            //} catch (err) {
            //    commonUtil.alertUtil.error("", err);
            //    $scope.alertTemp.tag = $scope.obj.indexTagDetails[0];
            //}
            ////标签值
            //var tagValues = [];
            //for (i in $scope.alertTemp.tag.tagValues) {
            //    for (j in $scope.alertTemp.tagValues) {
            //        if ($scope.alertTemp.tagValues[j].name == $scope.alertTemp.tag.tagValues[i].name) {
            //            tagValues.push($scope.alertTemp.tag.tagValues[i]);
            //        }
            //    }
            //}
            //$scope.alertTemp.tagValues = tagValues;

            $scope.alertTemp.compareType = es.translateEnum($scope.alertTemp.compareType.id);
            $scope.alertTemp.relativeType=commonUtil.constant.RelativeType.getEnumById($scope.alertTemp.relativeType.id);
            $scope.alertTemp.alertDataType = commonUtil.constant.AlertDataType.getEnumById($scope.alertTemp.alertDataType.id);

            $('#AlertInfoModal').modal('show');
            $timeout(function () {
                $(".select2Normal").select2();
                $(".select2Multiple").select2({allowClear: true});
            });
        }

        //报警valuehtml
        $scope.alertValuesHtmls = function (index) {
            var alert = $scope.obj.indexAlertDetails[index];
            var text = "<table><tbody>"
            for (i in alert.params) {
                text += "<tr><td>" + alert.params[i] + "</td></tr>"
            }

            text += "</tbody></table>";
            return text;

        }

        //报警信息展示.
        $scope.alertDesc = function (index) {
            var alert = $scope.obj.indexAlertDetails[index];
            return commonUtil.getAlertDesc(alert.type, alert.compareType, alert.threshold,alert.timeWindow,alert.relativeType,alert.alertDataType);
        }

    }]);
});