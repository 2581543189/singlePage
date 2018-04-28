define(['app', 'LoadingUtil', 'ConfirmUtil', 'service/common/cronExpressionValidator', 'service/common/alert-util', 'service/common/constant', 'AdminLTE','service/common/queryContext'], function (app, LoadingUtil, ConfirmUtil) {
    app.service('commonUtil', ['$http', '$state', 'alertUtil', 'constant','queryContext',
        function ($http, $state, alertUtil, constant,queryContext) {


            var me = this;
            //定义发送ajax请求的方法


            me.alertUtil = alertUtil.getInstance();

            me.ConfirmUtil = ConfirmUtil;

            me.constant = constant;

            me.queryContext = queryContext;

            //定义数据转化的方法
            me.transform = function (jsonData) {
                var string = '';

                for (str in jsonData) {
                    if (typeof(jsonData[str]) == 'string') {
                        string = string + str + '=' + encodeURIComponent(jsonData[str]) + '&';
                    } else {
                        string = string + str + '=' + encodeURIComponent(JSON.stringify(jsonData[str])) + '&';
                    }

                }

                var _last = string.lastIndexOf('&');

                string = string.substring(0, _last);

                return string;
            };
            me.ajaxPost = function (url, data, success, error, id) {


                //参数校验
                if (typeof(url) == 'undefined' || url == "") {
                    url = "./"
                }
                if (typeof(data) == 'undefined') {
                    data = {};
                }
                if (typeof(success) == 'undefined') {
                    success = function () {
                    };
                }
                if (typeof(error) == 'undefined') {
                    error = function () {
                    };
                }

                var $loading = $('<div></div>');
                if (typeof(id) != 'undefined') {
                    $loading = $('#' + id);
                }

                $loading.shieldLoading();

                //将promise对象返回.
                return $http({
                    method: "post",
                    url: url,
                    data: me.transform(data),//对提交的数据格式化
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    timeout: 600000 //超时时间10min
                }).success(function (data) {
                    $loading.shieldLoading('close');
                    //验证data是否符合数据规范
                    if (typeof(data.retcode) == "undefined") {
                        me.alertUtil.error("", "数据:" + data + "不符合baseResponse规范");
                        //$state.go("index.error", {"message": "数据不符合baseResponse规范"});
                        return;
                    }
                    //如果retcode==-100（未登录）
                    if (data.retcode == "-100") {
                        me.alertUtil.error("", "未登录");
                        $state.go("login");
                        return;
                    }

                    success(data);
                }).error(function () {
                    $loading.shieldLoading('close');
                    if (error) {
                        error();
                    } else {
                        $state.go("index.error", {"message": "请求失败!"});
                    }

                });
            }

            //去掉空格
            me.trim = function (inputString) {

                if (typeof inputString != "string") {
                    return inputString;
                }
                var retValue = inputString;
                var ch = retValue.substring(0, 1);
                while (ch == " ") {
                    //检查字符串开始部分的空格
                    retValue = retValue.substring(1, retValue.length);
                    ch = retValue.substring(0, 1);
                }
                ch = retValue.substring(retValue.length - 1, retValue.length);
                while (ch == " ") {
                    //检查字符串结束部分的空格
                    retValue = retValue.substring(0, retValue.length - 1);
                    ch = retValue.substring(retValue.length - 1, retValue.length);
                }
                while (retValue.indexOf("  ") != -1) {
                    //将文字中间多个相连的空格变为一个空格
                    retValue = retValue.substring(0, retValue.indexOf("  ")) + retValue.substring(retValue.indexOf("  ") + 1, retValue.length);
                }
                return retValue;
            }

            //判断是否包含特殊字符.
            me.validate = function (str) {
                var a = new RegExp("^[a-zA-Z 0-9]+$");
                return a.test(str);
            }

            //判断一个变量是不是数字.
            me.isNum = function (val) {
                var a1 = parseFloat(val);
                if (isNaN(a1)) {
                    return false;
                } else {
                    return true;
                }
            }
            var CronExpressionValidator = require('service/common/cronExpressionValidator');

            //判断表达式是否合法.
            me.cornExpressionCorrect = function (str) {
                return CronExpressionValidator.validateCronExpression(str);
            }


            //深度克隆
            me.deepCopy = function (obj) {
                var result, oClass = isClass(obj);
                //确定result的类型
                if (oClass === "Object") {
                    result = {};
                } else if (oClass === "Array") {
                    result = [];
                } else {
                    return obj;
                }
                for (key in obj) {
                    var copy = obj[key];
                    if (isClass(copy) == "Object") {
                        result[key] = arguments.callee(copy);//递归调用
                    } else if (isClass(copy) == "Array") {
                        result[key] = arguments.callee(copy);
                    } else {
                        result[key] = obj[key];
                    }
                }
                return result;
            }
            //返回传递给他的任意对象的类
            function isClass(o) {
                if (o === null) return "Null";
                if (o === undefined) return "Undefined";
                return Object.prototype.toString.call(o).slice(8, -1);
            }

            //设置页面滚动
            me.setScroll = function () {
                $(".fullScreenBody").slimScroll({
                    height: '100%' //可滚动区域高度
                });
            }


            /**
             * 获取属性对象
             *
             * @param $el
             * @param data_var
             *            属性字段名
             * @param default_val
             *            属性字段默认值
             * @returns {*}
             */
            me.attrDefault = function ($el, data_var, default_val) {
                if (typeof $el.data(data_var) != 'undefined') {
                    return $el.data(data_var);
                }
                return default_val;
            }

            //百分比转小数
            me.percentToPoint = function (percent) {
                var str = percent.replace("%", "");
                str = str / 100;
                return str;
            }

            /**
             *这里需要先用Number进行数据类型转换，然后去指定截取转换后的小数点后几位(按照四舍五入)，这里是截取一位，0.1266转换后会变成12.7%
             */
            me.pointToPercent = function (point) {
                var str = Number(point * 100).toFixed(1);
                str += "%";
                return str;
            }

            //获取报警的描述信息.
            me.getAlertDesc = function (alertType, compareType, threshold, timewindow, relativeType, alertDataType) {

                var desc = "";
                //数据
                if (alertType.id == me.constant.AlermMode.RELATIVE.id) {
                    if (timewindow != 0) {
                        desc += "最近" + timewindow + "分钟" + alertDataType.desc + ",";
                    }
                    desc += "与" + relativeType.desc + "比较,";

                } else {
                    if (timewindow != 0) {
                        desc += "最近" + timewindow + "分钟" + alertDataType.desc + ",";
                    }
                }

                //阈值
                var unit = "";
                if (alertType.id == me.constant.AlermMode.RELATIVE.id) {
                    unit = "%";
                }
                if (compareType.id == me.constant.CompareType.BTW.id) {//区间额外处理

                    return desc + "在[" + threshold[0] + unit + "] 和 [" + threshold[1] + unit + "]之间";
                } else {
                    return desc + compareType.desc + "[" + threshold[0] + unit + "]";
                }

            }
        }
    ]);
});
