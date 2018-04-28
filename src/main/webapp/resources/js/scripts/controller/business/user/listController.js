define(['app', 'angular', 'angular-route','bootstrap-table', 'select2'], function (app) {
    app.controller('userListController',
        ['$scope', 'commonUtil','$timeout', function ($scope, commonUtil,$timeout) {
            console.log("userListController");

            commonUtil.setScroll();
            //分页默认值
            $scope.pageSize = 8;
            $scope.currentPage = 1;
            $scope.pageCount = 1;
            $scope.totalCount = 0;
            $scope.tempUserName='';

            //获取所有用户信息
            $scope.queryUsers=function() {

                var param={};
                if($scope.tempUserName!=''){
                    param['userName']=$scope.tempUserName;
                }
                param['pageSize']=$scope.pageSize;
                param['pageNo']=$scope.currentPage;
                console.log("请求入参",param);

                var promise = commonUtil.ajaxPost('./auth/queryUserByUserName4Page', param);

                promise.success(function (data) {
                    console.log("响应结果",data);
                    if(data.retcode=='0'){
                        $scope.userList=data.body.users;
                        //处理角色。
                        for(i in $scope.userList){
                            var roleId=$scope.userList[i].roleId;
                            var roleType=commonUtil.constant.RoleEnum.getEnumById(roleId);
                            if(typeof(roleType)=='undefined'){
                                commonUtil.alertUtil.error("","roleId:"+roleId+"解析失败");
                                $scope.userList[i].useType="error("+roleId+")";
                            }else{
                                $scope.userList[i].useType=roleType.roleName;
                            }

                        }
                        $scope.pageCount = Math.ceil(data.body.totalCount / $scope.pageSize);
                        $scope.totalCount = data.body.totalCount;
                        realLogicCode()
                    }else{
                        commonUtil.alertUtil.error("","获取数据失败,异常信息:"+data.retdesc);
                    }


                });
                promise.error(function (data) {
                    commonUtil.alertUtil.error("","获取数据失败");
                });
            }

            //切换页数事件
            $scope.onPageChange = function () {
                // ajax request to load data
                //console.log($scope.currentPage);
                $scope.queryUsers();
            };


            $scope.userList=[];

            $scope.roleTypeOptions=[commonUtil.constant.RoleEnum.SUPER_MANAGER,commonUtil.constant.RoleEnum.BUSINESS_MANAGER,commonUtil.constant.RoleEnum.NORMAL_USER];
            $scope.tempUser={
                id:"",
                userName:"",
                roleType:$scope.roleTypeOptions[0],
                use:false
            }
            $scope.queryUsers();





            //展示用户信息
            function realLogicCode() {

                $timeout(function(){
                    //设置表格特效
//                    var option={
//                    		pagination: true, //是否显示分页（*）
//                    		pageNumber:1,                       //初始化加载第一页，默认第一页
//                    		pageSize: 15,                       //每页的记录行数（*）
//                    		pageList: [10, 25, 50, 100],        //可供选择的每页的行数（*）
//                    		search: true                //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
//                    		 
//                    };
//                    $("#listTable").bootstrapTable(option);
//                    $('#listTable').on("all.bs.table", function(name, args) {
//                        $scope.$apply();
//                    });
                    //设置摸态框
                    $("#editModal").modal({
                        backdrop: false,
                        keyboard: false,
                        show: false
                    });
                    $(".select2").select2();
                    $('.modal > > .modal-content').draggable();
                });
            }

            //事件方法

           $scope.showUpdatePop= function (userName){

                //获取用户信息
                var param={
                    userName:userName
                }
                var promise=commonUtil.ajaxPost("./auth/queryUserByUserName",param);

                promise.success(function(data){
                    if(data.retcode !='0'){
                        commonUtil.alertUtil.error("","获取数据失败,异常信息："+data.retdesc);
                    }else{
                        var user=data.body;

                        var roleType = commonUtil.constant.RoleEnum.getEnumById(user.roleId);
                        if(typeof(roleType)=='undefined'){
                            commonUtil.alertUtil.error("","roleId:"+user.roleId+"解析失败");
                            roleType=$scope.roleTypeOptions[0];
                        }


                        $scope.tempUser={
                            id:user.id,
                            userName:user.userName,
                            roleType:roleType,
                            use:user.use
                        }
                        $timeout(function(){
                            $(".select2").select2();
                        });
                        $("#editModal").modal('show');
                    }
                });

                promise.error(function(){
                    commonUtil.alertUtil.error("","获取数据失败");
                });



            }

            $scope.doUpdate=function(){

                //执行更新操作
                var param={
                    userId:$scope.tempUser.id,
                    userName:$scope.tempUser.userName,
                    roleId:$scope.tempUser.roleType.roleId,
                    use:$scope.tempUser.use

                }
                var promise=commonUtil.ajaxPost("./auth/updateUser",param);

                promise.success(function(data){
                    if(data.retcode !='0'){
                        commonUtil.alertUtil.error("","更新失败,异常信息："+data.retdesc);
                    }else{

                        commonUtil.alertUtil.success("","更新成功");
                        $scope.tempUser={
                            id:"",
                            userName:"",
                            roleType:$scope.roleTypeOptions[0],
                            use:false
                        }
                        $scope.queryUsers();
                        $("#editModal").modal('hide');

                    }
                });
                promise.error(function(){
                    commonUtil.alertUtil.error("","更新失败");
                    $scope.queryUsers();
                    $("#editModal").modal('hide');
                });

            }

        }]);
});
