define(['app','moment','service/common/common-util'], function (app,moment) {
    app.controller('singletimeController',['$scope','commonUtil',function ($scope,commonUtil) {

        //展示数据.
        $scope.rendor = function(){
            var data =  $scope.data;
            var ths = [];
            //获取th
            if(data.length >0){
                var first = data[0];
                for(prop in first){
                    if(first.hasOwnProperty(prop)){
                        ths.push(prop);
                    }
                }
            }
            //获取trs
            var trs=[];
            for(i in data){
                var obj = data[i];
                var objArray=[];
                for(j in ths){
                    objArray.push(obj[ths[j]]);
                }
                trs.push(objArray);
            }
            $scope.ths = ths;
            $scope.trs = trs;
        }


        //初始化
        $scope.indexName ='';
        $scope.dateStr =moment().format("YYYY-MM-DD HH:mm:SS");;
        $scope.data =[];
        $scope.rendor();

        //请求后台数据
        $scope.query=function(){
            if($scope.indexName==''){
                commonUtil.alertUtil.error("","指标名称不能为空");
                return;
            }
            if($scope.dateStr==''){
                commonUtil.alertUtil.error("","时间戳不能为空");
                return;
            }
            var param={
                'indexName':$scope.indexName,
                'dateStr':$scope.dateStr
            }
            var promise = commonUtil.ajaxPost('./indexMonitor/getIndexDataOnePoint',param);

            promise.success(function(data){
                console.log("接口返回",data);
                if(data.retcode != '0'){
                    commonUtil.alertUtil.error("","发生异常:"+data.retdesc);
                }else{
                    $scope.data=data.body;
                    if($scope.data.length==0){
                        commonUtil.alertUtil.error("","获取数据为空");
                    }
                    $scope.rendor();
                }
            }).catch(function(error){
                console.log("error",error);
                commonUtil.alertUtil.error("","发生异常");
            })
        }


        //请求后台数据
        $scope.delete=function(){
            if($scope.indexName==''){
                commonUtil.alertUtil.error("","指标名称不能为空");
                return;
            }
            if($scope.dateStr==''){
                commonUtil.alertUtil.error("","时间戳不能为空");
                return;
            }
            var param={
                'indexName':$scope.indexName,
                'dateStr':$scope.dateStr
            }
            var promise = commonUtil.ajaxPost('./indexMonitor/deleteIndexDataOnePoint',param);

            promise.success(function(data){
                console.log("接口返回",data);
                if(data.retcode != '0'){
                    commonUtil.alertUtil.error("","发生异常:"+data.retdesc);
                }else{
                    commonUtil.alertUtil.info("",data.retdesc);
                    $scope.data=[];
                    $scope.rendor();
                }
            }).catch(function(error){
                console.log("error",error);
                commonUtil.alertUtil.error("","发生异常");
            })
        }



    }]);
});
