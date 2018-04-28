define(['app','moment', 'service/common/common-util','bootstrap-datepicker'], function (app,moment) {
    app.controller('alertListController',[ '$scope', 'commonUtil','$state', '$timeout', '$q', function ($scope, commonUtil, $state, $timeout,$q) {
        console.log("alertListController");
        //获取报警list数据

        commonUtil.setScroll();
        $scope.date = moment().format("YYYY-MM-DD");

        //查询数据
        queryData();





        //真实业务逻辑代码
        function realLogicCode() {
            $timeout(function(){
                $('#datepicker').datepicker({
                    format: 'yyyy-mm-dd',
                    language: 'zh-CN',
                    autoclose:'true'
                });
                
            });
        }

        //点击按钮查询
        $scope.doQuery=function(){
            if($scope.date==""){
                commonUtil.alertUtil.error("", "请选择时间");
                return;
            }
            queryData();
        }

        //跳转页面.
        $scope.toDetail=function(indexName){
            $state.go("index.alertDetail",{indexName:indexName});
        }





        function queryData(){
            var AlertHistoryTop10QueryVo={
                collectTime:$scope.date,
                topNum:100
            }
            var param={
                AlertHistoryTop10QueryVoStr:JSON.stringify(AlertHistoryTop10QueryVo)
            }

            var promise = commonUtil.ajaxPost("./indexAlert/getAlertTop10", param);

            //promise 链式调用.
            promise.then(function(response){//获取报警数据
                var data = response.data;
                if (data.retcode != '0') {
                    commonUtil.alertUtil.error("", "获取数据失败，异常信息：" + data.retdesc);
                } else {
                    //初始化数据
                    $scope.alertList = [];

                    for (i in data.body.all) {
                        $scope.alertList.push({
                            indexName: data.body.all[i].id,
                            totalCount: data.body.all[i].data,
                            errorCount: data.body.all[i].alert,
                            percent: commonUtil.pointToPercent(data.body.all[i].per)

                        });
                    }
                }
                return commonUtil.ajaxPost('./mySubscribed/getIndex2AlertMap', {});
            }).then(function(response){//获取订阅信息
                var data = response.data;
                console.log("订阅信息",data);
                if (data.retcode == "0") {
                    var subscribe=[];
                    for(i in data.body){
                        subscribe.push(i);
                    }
                    $scope.subscribe = subscribe;

                    //设置订阅信息
                    for(i in $scope.alertList){
                        if($.inArray($scope.alertList[i].indexName,$scope.subscribe)>=0){
                            $scope.alertList[i].subscribe=true;
                        }else{
                            $scope.alertList[i].subscribe=false;
                        }
                    }

                }else {
                    alertUtil.getInstance().error("", "获取用户订阅数据失败,异常信息:" + data.retdesc);
                }

            }).then(function(){

                realLogicCode();
            }).catch(function(err){

                console.log(err);
                commonUtil.alertUtil.error("", "获取数据失败");
            });


        }


    }]);
});
