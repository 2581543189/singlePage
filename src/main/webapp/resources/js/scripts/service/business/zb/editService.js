define(['app', 'service/common/common-util', 'service/common/alert-util'], function (app) {
    app.service('zbEditService', ['commonUtil', 'alertUtil', function (commonUtil, alertUtil) {


        var me = this;

        me.CompareType = commonUtil.constant.CompareType;
        me.DEFAULTT_TAGS= commonUtil.constant.DEFAULTT_TAGS;
        me.IndexSimplingType= commonUtil.constant.IndexSimplingType;
        me.DataUnit= commonUtil.constant.DataUnit;
        me.DataClassify= commonUtil.constant.DataClassify;
        me.DataType= commonUtil.constant.DataType;
        me.IndexBaseType= commonUtil.constant.IndexBaseType;
        me.translateEnum= commonUtil.constant.translateEnum;

        ////定义URL类型
        //me.UrlType={
        //    SOA:{
        //        code:"0",
        //        id:"SOA",
        //        desc:"SOA坐标"
        //    },
        //    URL:{
        //        code:"1",
        //        id:"URL",
        //        desc:"URL"
        //    }
        //}

        //默认的空指标
        me.EMPTY = {
            indexName: "",
            indexNameCn: "",
            product: commonUtil.constant.ProductService.EMPTY,
            service: commonUtil.constant.ProductService.EMPTY.services[0],
            baseType: me.IndexBaseType.TechType,
            detailType: me.IndexBaseType.TechType.list[0],
            dataType: me.DataType.Integer,
            dataClassify: me.DataClassify.NumType,
            saveDate: "",
            dataUnit: me.DataUnit.Nums,
            ordinate: 0,
            frecQuency: "0 0 0 * * ? 2099",
            simplingType: me.IndexSimplingType.ActiveType,
            isSoa: false,
            soa: {
                product: "",
                service: "",
                method: ""
            },
            url: "http://",
            timeOut:"10000",
            indexTagDetails: [],
            mergedTags: [],
            indexAlertDetails: [],
            alertDesc: "",
            wikiUrl:"http://"

        }


        //验证表单
        me.validateForm = function (obj) {
            try {
                //校验基础信息
                obj.indexName = commonUtil.trim(obj.indexName);
                if (obj.indexName == "") {
                    alertUtil.getInstance().error("", "指标名称(英文)不能为空");
                    return false;
                }
                if (!commonUtil.validate(obj.indexName)) {
                    alertUtil.getInstance().error("", "指标名称(英文)不能包含特殊字符");
                    return false;
                }
                obj.indexNameCn = commonUtil.trim(obj.indexNameCn);
                if (obj.indexNameCn == "") {
                    alertUtil.getInstance().error("", "指标名称(中文)不能为空");
                    return false;
                }
                //obj.product = commonUtil.trim(obj.product);
                if (obj.product == commonUtil.constant.ProductService.EMPTY) {
                    alertUtil.getInstance().error("", "产品不能为空");
                    return false;
                }
                //if (!commonUtil.validate(obj.product)) {
                //    alertUtil.getInstance().error("", "产品不能包含特殊字符");
                //    return false;
                //}
                //obj.service = commonUtil.trim(obj.service);
                if (obj.service == "") {
                    alertUtil.getInstance().error("", "服务不能为空");
                    return false;
                }
                //if (!commonUtil.validate(obj.service)) {
                //    alertUtil.getInstance().error("", "服务不能包含特殊字符");
                //    return false;
                //}
                //select不需要校验
                obj.saveDate = commonUtil.trim(obj.saveDate);
                if (obj.saveDate == "") {
                    alertUtil.getInstance().error("", "请输入保存天数");
                    return false;
                }
                if (!commonUtil.isNum(obj.saveDate)) {
                    alertUtil.getInstance().error("", "保存天数必须是数字");
                    return false;
                }
                //y轴起始值
                obj.ordinate = commonUtil.trim(obj.ordinate);
                if (obj.ordinate === "") {
                    alertUtil.getInstance().error("", "请输入Y轴起始数");
                    return false;
                }
                if (!commonUtil.isNum(obj.ordinate)) {
                    alertUtil.getInstance().error("", "Y轴起始数必须是数字");
                    return false;
                }

                //校验采样设置..
                obj.frecQuency = commonUtil.trim(obj.frecQuency);
                if (obj.frecQuency == "") {
                    alertUtil.getInstance().error("", "请输入采样Cron表达式");
                    return false;
                }
                //if (!commonUtil.cornExpressionCorrect(obj.frecQuency)) {
                //    alertUtil.getInstance().error("", "采样Cron表达式不合法");
                //    return false;
                //}
                //被动采样不用验证url
                if(obj.simplingType!=me.IndexSimplingType.PassiveType){
                    if (obj.isSoa) {
                        obj.soa.product == commonUtil.trim(obj.soa.product);
                        obj.soa.service == commonUtil.trim(obj.soa.service);
                        obj.soa.method == commonUtil.trim(obj.soa.method);
                        if (obj.soa.product == "" || obj.soa.service == "" || obj.soa.method == "") {
                            alertUtil.getInstance().error("", "请输入完整的SOA信息.");
                            return false;
                        }
                        //if (!commonUtil.validate(obj.soa.product) || !commonUtil.validate(obj.soa.service) || !commonUtil.validate(obj.soa.method)) {
                        //    alertUtil.getInstance().error("", "SOA信息不能包含特殊字符");
                        //    return false;
                        //}

                    } else {
                        obj.url == commonUtil.trim(obj.url);
                        if (obj.url == "") {
                            alertUtil.getInstance().error("", "请输入url");
                            return false;
                        }

                    }
                    obj.timeOut == commonUtil.trim(obj.timeOut);
                    if (obj.timeOut === "") {
                        alertUtil.getInstance().error("", "请输入超时时间");
                        return false;
                    }
                    //超时时间必须是数字，且大于0
                    if(!commonUtil.isNum(obj.timeOut)){
                        alertUtil.getInstance().error("", "超时时间必须是数字");
                        return false;
                    }
                    if(parseInt(obj.timeOut) <=0){
                        alertUtil.getInstance().error("", "超时时间必须大于0");
                        return false;
                    }
                }

                //校验标签信息
                if (obj.indexTagDetails.length == 0) {
                    alertUtil.getInstance().error("", "无可用标签");
                    return false;

                }
                //标签必须有取值范围
                for (i in obj.indexTagDetails) {
                    if (obj.indexTagDetails[i].tagValues.length == 0) {
                        alertUtil.getInstance().error("", "标签:" + obj.indexTagDetails[i].tagNameCn + "无可用取值");
                        return false;
                    }
                }


                if (obj.indexAlertDetails.length > 0) {
                    //校验报警信息
                    obj.alertDesc == commonUtil.trim(obj.alertDesc);
                    if (obj.alertDesc == "") {
                        alertUtil.getInstance().error("", "请输入报警文案");
                        return false;
                    }


                }


                return true;
            } catch (err) {
                alertUtil.getInstance().error("", "表单校验居然异常了，你是怎么做到的.....");
                return false;
            }
        }

        //表单数据转化为提交对象.
        me.objToParam = function (obj) {
            var param = commonUtil.deepCopy(obj);
            //删除不需要的属性
            delete param.isSoa;
            delete param.soa;
            delete param.url;
            delete param.mergtTags;

            //product 需要特殊处理
            param["product"] = obj["product"].product;

            //url需要特殊处理
            var url = "";
            if (obj.isSoa) {
                url = obj.soa.product + "::" + obj.soa.service + "::" + obj.soa.method;
                param["urlType"] = "SOA";
            } else {
                param["urlType"] = "URL";
                url = obj.url;

            }
            param["timeOut"] = obj.timeOut;
            param["url"] = url;
            //select类型需要特殊配置
            param["baseType"] = obj["baseType"].id;
            param["dataType"] = obj["dataType"].id;
            param["dataClassify"] = obj["dataClassify"].id;
            param["dataUnit"] = obj["dataUnit"].id;
            param["simplingType"] = obj["simplingType"].id;



            var indexAlertDetails = param["indexAlertDetails"];


            param["indexAlertDetails"] =  me.indexAlertDetailsToParam(indexAlertDetails);



            //mergtTags 转化为 tagGroupInfos
            var tagGroupInfos = [];
            for (i in obj.mergedTags) {
                var temp = obj.mergedTags[i];
                var str = "";
                for (j in temp) {
                    str += temp[j].tagName;
                    if (j != temp.length - 1) {
                        str += "::"
                    }
                }
                tagGroupInfos.push(str);
            }
            param["tagGroupInfos"] = tagGroupInfos;


            return param;
        }

        //报警信息转化为后台PO
        me.indexAlertDetailsToParam=function(onPage){

            var param=commonUtil.deepCopy(onPage);
            for (i in param) {
                param[i].compareType = param[i].compareType.id;
                //param[i].tagName = param[i].tag.tagName;
                //var tagValues=[];
                //for(x in param[i].tagValues){
                //    tagValues.unshift(param[i].tagValues[x].name);
                //}
                //param[i].tagValues =tagValues;
                param[i].alermMode = param[i].type.field;
                param[i].tags = param[i].params;
                param[i].relativeType=param[i].relativeType.id;
                param[i].alertDataType=param[i].alertDataType.id;
            }
            return param;
        }



        //表单数据转化为提交对象.
        me.responsetoObj = function (response, defaultTags) {
            var obj = commonUtil.deepCopy(response);

            //TODO：删除不需要的属性
            delete obj.urlType
            delete obj.tagGroupInfos;

            //补充需要的属性
            obj["timeOut"] = response.timeOut;
            if (response.urlType == 'SOA') {
                var array = obj.url.split('::');
                var soa = {
                    product: array[0],
                    service: array[1],
                    method: array[2]
                }
                obj["soa"] = soa;
                obj["url"] = "";
                obj["isSoa"] = true;
            } else {
                obj["url"] = response.url;

                obj["soa"] = {
                    product: "",
                    service: "",
                    method: ""
                };
                obj["isSoa"] = false;
            }

            //select类型需要特殊配置
            obj["baseType"] = me.translateEnum(response["baseType"]);
            obj["dataType"] = me.translateEnum(response["dataType"]);
            obj["dataClassify"] = me.translateEnum(response["dataClassify"]);
            obj["dataUnit"] = me.translateEnum(response["dataUnit"]);
            obj["simplingType"] = me.translateEnum(response["simplingType"]);
            obj['product'] = commonUtil.constant.ProductService.getEnumByProduct(response["product"]);
            if(typeof (obj['product']) == 'undefined'){
                commonUtil.alertUtil.error("","product不合法，请重新选择");
                obj['product'] = commonUtil.constant.ProductService.EMPTY;
            }else{
                if($.inArray(obj['service'],obj['product'].services) < 0){
                    commonUtil.alertUtil.error("","service不合法，请重新选择");
                    obj['service'] ='';
                }
            }


            //标签组合排序
            var indexTagDetails = obj["indexTagDetails"];
            var tagGroupInfos = response.tagGroupInfos;
            //标签组合排序 有组合的按照组合顺序，没组合的标签放在最末尾
            var orderedindexTagDetails=[];
            //所有标签打标为false
            for(i in indexTagDetails){
                indexTagDetails[i].flag=false;
            }

            //有分组标签
            if (tagGroupInfos.length != 0) {
                for(i in tagGroupInfos){
                    var group= tagGroupInfos[i];
                    var array=group.split("::");
                    for(j in array){
                        var name=array[j];
                        for(k in indexTagDetails){
                            if(indexTagDetails[k].tagName===name){
                                indexTagDetails[k].flag=true;
                                orderedindexTagDetails.push(indexTagDetails[k]);
                                break;
                            }
                        }
                    }
                }
            }

            //无分组标签
            for(i in indexTagDetails){
                if(!indexTagDetails[i].flag){
                    orderedindexTagDetails.push(indexTagDetails[i]);
                }
            }

            obj['indexTagDetails'] = orderedindexTagDetails;

            indexTagDetails =orderedindexTagDetails;

            //报警信息特殊配置
            var indexAlertDetails = obj["indexAlertDetails"];
            if(typeof(indexAlertDetails)=='undefined'){
                indexAlertDetails=[];
            }

            for (i in indexAlertDetails) {
                var alert = indexAlertDetails[i];
                alert.remove=false;
                //设置compareType
                alert["compareType"] = me.translateEnum(alert["compareType"]);
                alert["relativeType"] = commonUtil.constant.RelativeType.getEnumById(alert["relativeType"]);
                alert["alertDataType"] = commonUtil.constant.AlertDataType.getEnumById(alert["alertDataType"]);

                if(!alert["timeWindow"]){
                    alert["timeWindow"]=0;
                }
                ////寻找标签信息
                //for (j in indexTagDetails) {
                //    if (alert.tagName == indexTagDetails[j].tagName) {
                //        alert.tag = indexTagDetails[j];
                //        break;
                //    }
                //}
                ////如果标签都不存在，报警信息需要展示
                //if(typeof(alert.tag)=='undefined'){
                //    alert.remove=true;
                //    continue;
                //}

                ////寻找标签值
                //var tagNameVals=[];
                //for(x in alert.tagValues){
                //    for(y in alert.tag.tagValues){
                //        if(alert.tag.tagValues[y].name == alert.tagValues[x]){
                //            tagNameVals.unshift(alert.tag.tagValues[y]);
                //        }
                //    }
                //}
                //alert["tagValues"] = tagNameVals;
                alert["startTime"]= alert["startTime"]+"";
                alert["endTime"]= alert["endTime"]+"";
                alert["type"]= commonUtil.constant.AlermMode.getEnumByField(alert["alermMode"]);
                if(typeof(alert["type"])=='undefined'){
                    alert["type"]=commonUtil.constant.AlermMode.ABSOLUTE;
                }

                var params = [];
                //添加params
                for(j in alert.tagValues){
                    params.push(alert.tagValues[j].name);
                }

                alert.params = alert.tags;
                //防止后台存储tags为null 2017-08-25 mingshun.han
                if(typeof(alert.params) == 'undefined'){
                    alert.params=[];
                }

                indexAlertDetails[i] = alert;

            }
            //删除掉无法生效的报警
            var afterRemove=[];
            for(i in indexAlertDetails){
                if(!indexAlertDetails[i].remove){
                    afterRemove.push(indexAlertDetails[i]);
                }
            }


            obj["indexAlertDetails"] = afterRemove;


            //tagGroupInfos 转化为mergtTags
            if (tagGroupInfos.length == 0) {
                obj.mergedTags = [];
            } else {
                var mergedTags = [];
                for (i in tagGroupInfos) {
                    var mTagStr = tagGroupInfos[i];
                    var array = mTagStr.split('::');
                    var tempMergedTag = [];
                    for (j in array) {
                        for (k in indexTagDetails) {
                            if (array[j] == indexTagDetails[k].tagName) {
                                tempMergedTag.push(indexTagDetails[k]);
                                break;
                            }

                        }
                    }

                    //循环完一个组合
                    mergedTags.push(tempMergedTag);
                }
                obj.mergedTags = mergedTags;
            }






            //修改defaultTag中的标签值
            for (i in defaultTags) {

                for (j in obj.indexTagDetails) {
                    if (obj.indexTagDetails[j].tagName == defaultTags[i].tagName) {
                        defaultTags[i] = obj.indexTagDetails[j];
                        break;
                    }
                }
            }

            //自定义标签加入defaultTag中
            for (i in obj.indexTagDetails) {
                var found = false;
                for (j in defaultTags) {
                    if (obj.indexTagDetails[i].tagName == defaultTags[j].tagName) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    defaultTags.push(obj.indexTagDetails[i]);
                }

            }


            return obj;
        }


        //检验标签是否组合标签
       me.isTagMerged= function (tag,mergedTag){
            if(mergedTag.length==0){
                return false;
            }

            for(i in mergedTag){
                var group = mergedTag[i];
                for(j in group){
                    if(group[j].tagName == tag.tagName){
                        return true;
                    }
                }
            }
            return false;
        }

        me.getIntfTagValues=function (notMergeTag,tagGroups,dataClassify){
            var tagValues=[];
            //加入非组合标签
            for(i in notMergeTag){
                var tagName = notMergeTag[i].tagName;
                var  tagMap={};
                tagMap[tagName]=notMergeTag[i].tagValues[0].name;
                var values=[50];
                if(dataClassify.desc=="百分比型"){
                    values.push(100);
                }

                var obj={
                    tagMap:tagMap,
                    values:values
                }
                tagValues.push(obj);
            }
            //加入组合标签
            for(i in tagGroups){
                var group= tagGroups[i];
                var  tagMap={};
                for(j in group){
                    var tagName = group[j].tagName;
                    tagMap[tagName] = group[j].tagValues[0].name;
                }
                var values=[50];
                if(dataClassify.desc=="百分比型"){
                    values.push(100);
                }


                var obj={
                    tagMap:tagMap,
                    values:values
                }
                tagValues.push(obj);
            }
            return tagValues;

        }


    }]);
});