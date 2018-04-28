define(['app','service/common/common-util'], function (app) {
    app.controller('hbaseController',['$scope','commonUtil',function ($scope,commonUtil) {
            console.log("hbaseController");

        commonUtil.setScroll();
        //$('#myTab a:first').tab('show')
        $scope.tableName="hotel:hotel_index_monitor_info";

        $scope.tab1={
            rowkey:"",
            data:""
        }
        $scope.tab2={
            seed:"",
            data:[],
            btnName:"来十条"
        }
        $scope.tab3={
            zz:"",
            seed:"",
            data:[],
            count:10
        }


        //随机rowkey
        $scope.randomRowkey=function(){
            //参数校验
            if($scope.tableName==""){
                commonUtil.alertUtil.error("","表名不能为空");
                return;
            }



            var param={
                tableName:$scope.tableName,
                seed:$scope.tab2.seed
            }
            var promise = commonUtil.ajaxPost("./website/hbase/randomRowKey",param);
            $scope.tab2.data=[];
            promise.success(function(data){
                if(data.retcode != '0'){
                    commonUtil.alertUtil.error("",data.retdesc);
                    //$scope.tab2.data=data.retdesc;
                }else{
                    $scope.tab2.data=data.body;
                    $scope.tab2.seed = data.body[data.body.length-1];
                }
                if($scope.tab2.btnName=="来十条"){
                    $scope.tab2.btnName="再来十条"
                }

            });

            promise.error(function(){
                commonUtil.alertUtil.error("","获取数据失败");
            });

        }
        //随机rowkey
        $scope.queryByRowkey=function(){
            //参数校验
            if($scope.tableName==""){
                commonUtil.alertUtil.error("","表名不能为空");
                return;
            }
            if($scope.tab1.rowkey==""){
                commonUtil.alertUtil.error("","rowkey不能为空");
                return;
            }

            var param={
                tableName:$scope.tableName,
                rowKey:$scope.tab1.rowkey
            }
            var promise = commonUtil.ajaxPost("./website/hbase/queryByRowKey",param);
            $scope.tab1.data="正在请求... ..."
            promise.success(function(data){
                if(data.retcode != '0'){
                    commonUtil.alertUtil.error("",data.retdesc);
                    $scope.tab1.data=data.retdesc;
                }else{
                    $scope.tab1.data=JSON.stringify(data.body, null, "\t");

                }

            });

            promise.error(function(){
                commonUtil.alertUtil.error("","获取数据失败");
                $scope.tab1.data="";
            });

        }

        //前缀+正则
        $scope.queryPlus=function(){
            //参数校验
            if($scope.tableName==""){
                commonUtil.alertUtil.error("","表名不能为空");
                return;
            }
            if($scope.tab3.zz==""){
                commonUtil.alertUtil.error("","正则表达式不能为空");
                return;
            }

            var param={
                tableName:$scope.tableName,
                batch:$scope.tab3.count,
                regex:$scope.tab3.zz,
                seed:$scope.tab3.seed
            }
            var promise = commonUtil.ajaxPost("./website/hbase/randomRowKeyFilter",param);
            $scope.tab3.data=[];
            promise.success(function(data){
                if(data.retcode != '0'){
                    commonUtil.alertUtil.error("",data.retdesc);
                }else{
                    $scope.tab3.data=data.body;

                }

            });

            promise.error(function(){
                commonUtil.alertUtil.error("","获取数据失败");
            });

        }


        }]);
});
