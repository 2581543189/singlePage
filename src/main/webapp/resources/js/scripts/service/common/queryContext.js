/**
 * 用于保存查询页面的查询条件，这样后退的时候可以还原跳转页面前的状态
 */
define(['app','service/common/constant'], function (app) {
    app.service('queryContext', ['constant',function(constant){
        var me = this;

        //ZbList 指标列表页查询条件
        me.ZbList={
            cnName: "",
            enName: "",
            productLine: '',
            serviceLine: '',
            baseType: constant.IndexBaseType.NoType,
            detailType: "",
            save:function(obj){
                me.ZbList.cnName = obj.cnName;
                me.ZbList.enName = obj.enName;
                me.ZbList.productLine = obj.productLine;
                me.ZbList.serviceLine = obj.serviceLine;
                me.ZbList.baseType = obj.baseType;
                me.ZbList.detailType = obj.detailType;
            }
        }


    }])
});