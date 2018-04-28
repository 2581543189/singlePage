define(['app','angular','angular-route'], function (app) {
    app.controller('welcomeController',
        ['$scope','commonUtil','$state',function ($scope,commonUtil,$state) {
        	//设置BODYSCROLL
        	commonUtil.setScroll();

            //设置默认信息
            $scope.subscribe={
                indexCount:0,
                alertIndexCount:0,
                alertCount:0
            }



            //获取当前用户订阅信息
            var promise = commonUtil.ajaxPost('./mySubscribed/getIndex2AlertMap', {});

            promise.success(function (data) {
                console.log("订阅信息",data);
                if (data.retcode == "0") {

                    var indexCount=0;
                    var alertIndexCount=0;
                    var alertCount=0;

                    for(i in data.body){
                        indexCount++;
                        if(data.body[i] > 0){
                            alertIndexCount++;
                            alertCount+=data.body[i];
                        }
                    }

                    var subscribe={
                        indexCount:indexCount,
                        alertIndexCount:alertIndexCount,
                        alertCount:alertCount
                    }
                    $scope.subscribe = subscribe;

                }else {
                    commonUtil.alertUtil.error("", "获取用户订阅数据失败,异常信息:" + data.retdesc);
                }
            });

            promise.error(function () {
                alertUtil.getInstance().error("", "获取用户订阅信息失败");
            });

            var AlertHistoryTop10QueryVo={
                collectTime:$scope.date,
                topNum:100
            }
            var param={
                AlertHistoryTop10QueryVoStr:JSON.stringify(AlertHistoryTop10QueryVo)
            }

            var promise2 = commonUtil.ajaxPost("./indexAlert/getAlertTop10", param);

            promise2.success(function (data) {
                if (data.retcode != '0') {
                    commonUtil.alertUtil.error("", "获取数据失败，异常信息：" + data.retdesc);
                } else {
                    console.log("top信息",data.body);
                    //初始化数据
                    $scope.myAlertList = [];
                    $scope.allAlertList = [];

                    for (i in data.body.my) {
                        $scope.myAlertList.push({
                            indexName: data.body.my[i].id,
                            totalCount: data.body.my[i].data,
                            errorCount: data.body.my[i].alert,
                            percent: commonUtil.pointToPercent(data.body.my[i].per)

                        });
                    }

                    for (i in data.body.all) {
                        $scope.allAlertList.push({
                            indexName: data.body.all[i].id,
                            totalCount: data.body.all[i].data,
                            errorCount: data.body.all[i].alert,
                            percent: commonUtil.pointToPercent(data.body.all[i].per)

                        });
                    }
                }
                //realLogicCode();
            });

            promise2.error(function () {
                commonUtil.alertUtil.error("", "获取数据失败");
            });

            //跳转页面.
            $scope.toDetail=function(indexName){
                $state.go("index.alertDetail",{indexName:indexName});
            }

            //跳转页面.
            $scope.toAlertList=function(){
                $state.go("index.alertList");
            }
            
//            $scope.toMyDashboard=function(){
//            	$state.go("myDashboard",'_blank');
//            }

        }]);


});
