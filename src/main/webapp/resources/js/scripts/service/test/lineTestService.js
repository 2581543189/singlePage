define(['app', 'moment', 'highcharts', 'service/common/common-util'], function (app, moment) {
    app.service('lineTestService', ['commonUtil', function (commonUtil) {
        var me = this;

        var LESS_PERCENT = 5;

        var dataArray = [];
        var temp = moment('2017-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss');
        for (var i = 0; i < 600; i++) {
            temp.add(1, 'minutes');
            dataArray.push(temp.format('YYYY-MM-DD HH:mm:ss'));
        }

        //获取假的曲线图数据.
        me.getFakeData = function (param) {
            var dashboards = param.dashboards;

            var data = {};
            for (i in dashboards) {
                var name = dashboards[i].name;
                var lines = dashboards[i].lines;
                var lineMap = {};
                for (k in lines) {

                    var realLine = [];

                    for (j in dataArray) {

                        if (GetRandomNum(0, 100) > LESS_PERCENT) {
                            var obj = {
                                value: GetRandomNum(50, 100),
                                time: dataArray[j]
                            }
                            realLine.push(obj);

                        }
                    }
                    lineMap[lines[k]] = realLine;
                }
                data[name] = lineMap;
            }
            return data;
        }


        function GetRandomNum(Min, Max) {
            var Range = Max - Min;
            var Rand = Math.random();
            return (Min + Math.round(Rand * Range));
        }

        me.getAllTimes = function (charts) {
            var array = [];
            //去重
            for (name in charts) {
                var line = charts[name];
                for (j in line.date) {
                    if ($.inArray(line.date[j], array) >= 0) {
                        continue;
                    } else {
                        array.push(line.date[j]);
                    }
                }
            }
            //排序
            array.sort();
            return array;

        }

        //补充不存在的点
        me.fillOneLine = function (dates, line, isPercentage) {
            if (typeof(isPercentage) == 'undefined') {
                isPercentage = false;
            }


            var result = [];
            var lineDates = line.date;
            var lineValues = line.value;


            for (i in dates) {
                var timeStr = dates[i];

                var obj = {
                    time: timeStr,
                    y: 0,
                    v1: 0,
                    v2: 0
                }
                var index = $.inArray(timeStr, lineDates);
                if (index >= 0) {
                    if (typeof(lineValues[index]) != 'undefined') {
                        var values = lineValues[index];
                        obj.y = calculateY(values, isPercentage);

                        if (isPercentage) {
                            obj.v1 = parseFloat(values[0]);
                            obj.v2 = parseFloat(values[1]);
                        } else {
                            obj.v1 = parseFloat(values[0]).toFixed(2);
                        }
                    }

                }
                result.push(obj);

            }
            return result;
        }
        /*
         * 计算Y值
         * */
        function calculateY(values, isPercentage) {
            if (isPercentage) {
                return (parseFloat(values[0]) * 100 / parseFloat(values[1])).toFixed(2);
            } else {
                return parseFloat(values[0]);
            }
        }


        // 初始化折线图
        me.initLine = function (div, keyList, lineData, customParam) {

            //解析customParam
            var afterZero = 0;
            if (customParam['afterZero']) {
                afterZero = customParam['afterZero'];
            }
            //如果afterZero=2 设置百分比
            var titleText = "数量";
            var unit='';
            if (afterZero == 2) {
                titleText = "百分比";
                unit = '%';
            }

            var ordinate = 0;
            if (customParam['ordinate']) {
                ordinate = customParam['ordinate'];
            }


            var tickInterval = Math.round(keyList.length / 5);

            var data = [];

            for (name in lineData) {

                var list = lineData[name];
                var array = [];

                for (i in list) {
                    var obj = {
                        unit:unit,
                        y: parseFloat(list[i].y),
                        time: list[i].time
                    }
                    array.push(obj);
                }
                data.push({
                    name: name,
                    data: array
                })

            }
            ;

            var param = {
                chart: {
                    type: 'spline', // 指定图表的类型，默认是折线图（line）
                    zoomType: 'x' // x轴方向可以缩放
                },
                title: {
                    text: '汇总数据',
                    x: -20
                    // center
                },
                subtitle: {
                    text: '',
                    x: -20
                },
                xAxis: {
                    categories: keyList,
                    tickInterval: tickInterval
                },
                yAxis: {
                    allowDecimals: 'false',
                    min: ordinate,
                    title: {
                        text: titleText
                    },
                    labels: {
                        formatter: function () {
                            return this.value.toFixed(afterZero);// 这里是两位小数，你要几位小数就改成几
                        }
                    }
                },
                plotOptions: {
                    series: {
                        turboThreshold: 100000 //highchars 默认只展示1000个点，超过会不显示曲线图

                    }
                },
                tooltip: {
                    shared: true,
                    useHTML: true,
                    headerFormat: '<table><tr><td colspan="3">{point.key}</td></tr>',
                    pointFormat: '<tr><td><span style="color:{series.color}">{series.name}</span>:{point.y}{point.unit}</td></tr>',
                    footerFormat: '</table>'
                },
//                legend: {
//                    layout: 'vertical',
//                    align: 'center',
//                    verticalAlign: 'bottom',
//                    borderWidth: 0
//                },
                series: data
            };

            param = $.extend({}, param, customParam);
            div.highcharts(param);
        }

        // 初始化折线图
        me.initLineAndHistogram = function (div, keyList, lineData, histogram, customParam) {

            //解析customParam
            var afterZero = 0;
            if (customParam['afterZero']) {
                afterZero = customParam['afterZero'];
            }
            //如果afterZero=2 设置百分比
            var titleText = "数量";
            var unit='';
            if (afterZero == 2) {
                titleText = "百分比";
                unit = '%';
            }

            var ordinate = 0;
            if (customParam['ordinate']) {
                ordinate = customParam['ordinate'];
            }


            var tickInterval = Math.round(keyList.length / 5);

            var data = [];

            for (name in lineData) {
                var list = lineData[name];
                var array = [];

                for (i in list) {
                    var obj = {
                        unit:unit,
                        y: parseFloat(list[i].y),
                        time: list[i].time
                    }
                    array.push(obj);
                }
                data.push({
                    name: name,
                    data: array,
                    type: 'spline'
                })
            }
            ;
            for (name in histogram) {
                var list = histogram[name];
                var array = [];

                for (i in list) {
                    var obj = {
                        unit:unit,
                        y: parseFloat(list[i].y),
                        time: list[i].time
                    }
                    array.push(obj);
                }
                data.push({
                    name: name,
                    data: array,
                    type: 'column'
                })
            }
            ;

            var param = {
                chart: {
                    type: 'spline', // 指定图表的类型，默认是折线图（line）
                    zoomType: 'x' // x轴方向可以缩放
                },
                title: {
                    text: '汇总数据',
                    x: -20
                    // center
                },
                subtitle: {
                    text: '',
                    x: -20
                },
                xAxis: {
                    categories: keyList,
                    tickInterval: tickInterval
                },
                yAxis: {
                    allowDecimals: 'false',
                    min: ordinate,
                    title: {
                        text: titleText
                    },
                    labels: {
                        formatter: function () {
                            return this.value.toFixed(afterZero);// 这里是两位小数，你要几位小数就改成几
                        }
                    }
                },
                plotOptions: {
                    series: {
                        turboThreshold: 100000 //highchars 默认只展示1000个点，超过会不显示曲线图

                    }
                },
                tooltip: {
                    shared: true,
                    useHTML: true,
                    headerFormat: '<table><tr><td colspan="3">{point.key}</td></tr>',
                    pointFormat: '<tr><td><span style="color:{series.color}">{series.name}</span>:{point.y}{point.unit}</td></tr>',
                    footerFormat: '</table>'
                },
//                legend: {
//                    layout: 'vertical',
//                    align: 'center',
//                    verticalAlign: 'bottom',
//                    borderWidth: 0
//                },
                series: data
            };

            param = $.extend({}, param, customParam);
            div.highcharts(param);
        }


        //翻译曲线图的名字.
        me.translateLineName = function (lineData, tagMap) {

            var newLine = {};
            for (originName in lineData) {
                var key = originName;
                if (originName == 'ALL=ALL') {
                    key = '汇总';
                } else {
                    //计算key
                    var array = originName.split('_');
                    for (i in array) {
                        var str = array[i];
                        var subArray = str.split('=');
                        var tagName = subArray[0];
                        var tagValue = subArray[1];
                        if (i == 0) {
                            key = tagMap[tagName][tagValue];
                            if (typeof(key) == 'undefined') {
                                key = originName;
                                break;
                            }
                        } else {
                            key = key + "_" + tagMap[tagName][tagValue];
                        }
                    }
                }


                //value
                var value = lineData[originName];
                newLine[key] = value;
            }
            return newLine;
        }

        /*
         *计算totalMap.
         * */
        me.calculateTotal = function (data, isPercengate) {
            if (typeof(isPercengate) == 'undefined') {
                isPercengate = false;
            }
            var totalList = [];
            for (name in data) {
                var total = 0;
                var v1 = 0;
                var v2 = 0;
                for (index in data[name]) {
                    v1 += parseFloat(data[name][index].v1);
                    if (isPercengate) {
                        v2 += parseFloat(data[name][index].v2);
                    }
                }
                if (isPercengate) {
                    var temp = (v1 * 100 / v2).toFixed(2);
                    total = "[" + v1.toFixed(2) + "/" + v2.toFixed(2) + "]≈" + temp + "%";
                } else {
                    total = v1;
                }

                var obj = {
                    name: name,
                    count: total
                }

                totalList.push(obj);
            }
            //排序
            totalList.sort(function (a, b) {
                return b.count - a.count;
            });
            return totalList;

        }
        /*
         * 数组合并去重排序
         * */
        me.mergeArray = function (array1, array2) {
            var copy = commonUtil.deepCopy(array1);
            for (i in array2) {
                if ($.inArray(array2[i], copy) < 0) {
                    copy.push(array2[i]);
                }
            }

            //排序
            copy.sort(function (a, b) {
                return b > a ? 1 : -1;
            });
            return copy;
        }

        /**
         * 根据类型计算时间范围.
         *
         *
         */
        me.calculateTimeRangeByDateType = function (timeRange, dateType, compareDate) {
            var result = timeRange;
            var timeRangeArr = timeRange.split(" - ");
            var startTime = timeRangeArr[0];
            var endTime = timeRangeArr[1];

            if (dateType.id == commonUtil.constant.RelativeType.DOD.id) {
                var newStart = moment(startTime).subtract(1, 'days').format("YYYY-MM-DD HH:mm:ss");
                var newEnd = moment(endTime).subtract(1, 'days').format("YYYY-MM-DD HH:mm:ss");
                result = newStart + " - " + newEnd;
            } else if (dateType.id == commonUtil.constant.RelativeType.WOW.id) {
                var newStart = moment(startTime).subtract(7, 'days').format("YYYY-MM-DD HH:mm:ss");
                var newEnd = moment(endTime).subtract(7, 'days').format("YYYY-MM-DD HH:mm:ss");
                result = newStart + " - " + newEnd;
            } else if (dateType.id == commonUtil.constant.RelativeType.SPECIFIC_DAY.id) {
                //计算时间差
                var start1ToDay = moment(startTime).startOf('day');
                var start2ToDay = moment(compareDate);
                var diff = start1ToDay.diff(start2ToDay, 'days')

                var newStart = moment(startTime).subtract(diff, 'days').format("YYYY-MM-DD HH:mm:ss");
                var newEnd = moment(endTime).subtract(diff, 'days').format("YYYY-MM-DD HH:mm:ss");
                result = newStart + " - " + newEnd;
            }


            return result;
        }

    }]);
});