define(['app'], function (app) {
    app.service('constant', [
        function () {
            var me = this;

            //角色常量
            me.RoleEnum = {
                SUPER_MANAGER: {
                    roleName: "系统管理员",
                    roleId: "1",
                    field: "SUPER_MANAGER"
                },
                BUSINESS_MANAGER: {
                    roleName: "业务管理员",
                    roleId: "2",
                    field: "BUSINESS_MANAGER"
                },
                NORMAL_USER: {
                    roleName: "普通用户",
                    roleId: "3",
                    field: "NORMAL_USER"
                },
                getEnumById: function (id) {
                    switch (id) {
                        case me.RoleEnum.SUPER_MANAGER.roleId:
                            return me.RoleEnum.SUPER_MANAGER;
                        case me.RoleEnum.BUSINESS_MANAGER.roleId:
                            return me.RoleEnum.BUSINESS_MANAGER;
                        case me.RoleEnum.NORMAL_USER.roleId:
                            return me.RoleEnum.NORMAL_USER;
                    }
                },
                getEnumByField: function (field) {
                    switch (field) {
                        case me.RoleEnum.SUPER_MANAGER.field:
                            return me.RoleEnum.SUPER_MANAGER;
                        case me.RoleEnum.BUSINESS_MANAGER.field:
                            return me.RoleEnum.BUSINESS_MANAGER;
                        case me.RoleEnum.NORMAL_USER.field:
                            return me.RoleEnum.NORMAL_USER;
                    }
                }

            }


            //报警类型常量
            me.AlermMode = {
                ABSOLUTE: {
                    code: "0",
                    id: "AbsoluteAlerm",
                    desc: "绝对值报警",
                    field: "ABSOLUTE"
                },
                RELATIVE: {
                    code: "1",
                    id: "RelativeAlerm",
                    desc: "相对值报警",
                    field: "RELATIVE"
                },
                getEnumByField: function (id) {
                    switch (id) {
                        case me.AlermMode.ABSOLUTE.field:
                            return me.AlermMode.ABSOLUTE;
                        case me.AlermMode.RELATIVE.field:
                            return me.AlermMode.RELATIVE;
                    }
                }
            }


            //定义比较类型
            me.CompareType = {
                GT: {
                    code: "0",
                    id: "GT",
                    desc: "大于"
                },
                LT: {
                    code: "1",
                    id: "LT",
                    desc: "小于"
                },
                GTE: {
                    code: "2",
                    id: "GTE",
                    desc: "大于等于"
                },
                LTE: {
                    code: "3",
                    id: "LTE",
                    desc: "小于等于"
                },
                BTW: {
                    code: "4",
                    id: "BTW",
                    desc: "区间"
                },
                getEnumById: function (id) {
                    switch (id) {
                        case me.CompareType.GT.id:
                            return me.CompareType.GT;
                        case me.CompareType.LT.id:
                            return me.CompareType.LT;
                        case me.CompareType.GTE.id:
                            return me.CompareType.GTE;
                        case me.CompareType.LTE.id:
                            return me.CompareType.LTE;
                        case me.CompareType.BTW.id:
                            return me.CompareType.BTW;
                    }
                }

            };

            me.RelativeType = {
                AVG: {
                    code: "0",
                    id: "AVG",
                    desc: "7天均值(AVG)"
                },
                DOD: {
                    code: "1",
                    id: "DOD",
                    desc: "昨天(DOD)"
                },
                WOW: {
                    code: "2",
                    id: "WOW",
                    desc: "上周(WOW)"
                },
                MOM: {
                    code: "3",
                    id: "MOM",
                    desc: "上月(MOM)"
                },
                YOY: {
                    code: "4",
                    id: "YOY",
                    desc: "去年(YOY)"
                },
                SPECIFIC_DAY: {
                    code: "5",
                    id: "SPECIFIC_DAY",
                    desc: "指定日期"
                },
                getEnumById: function (id) {
                    switch (id) {
                        case me.RelativeType.AVG.id:
                            return me.RelativeType.AVG;
                        case me.RelativeType.DOD.id:
                            return me.RelativeType.DOD;
                        case me.RelativeType.WOW.id:
                            return me.RelativeType.WOW;
                        case me.RelativeType.MOM.id:
                            return me.RelativeType.MOM;
                        case me.RelativeType.YOY.id:
                            return me.RelativeType.YOY;
                        case me.RelativeType.SPECIFIC_DAY.id:
                            return me.RelativeType.SPECIFIC_DAY;
                        default :
                            return me.RelativeType.AVG
                    }
                }
            }

            me.AlertDataType = {
                TOTAL: {
                    code: "0",
                    id: "TOTAL",
                    desc: "汇总值"
                },
                AVG: {
                    code: "1",
                    id: "AVG",
                    desc: "平均值"
                },
                getEnumById: function (id) {
                    switch (id) {
                        case me.AlertDataType.TOTAL.id:
                            return me.AlertDataType.TOTAL;
                        case me.AlertDataType.AVG.id:
                            return me.AlertDataType.AVG;
                        default :
                            return me.AlertDataType.TOTAL;
                    }
                }
            }

            me.ProductService = {
                EMPTY: {
                    product: '',
                    services: ['']
                },
                HOTEL: {
                    product: 'hotel',
                    services: ['', 'apartment', 'basicTech', 'crm', 'dc', 'ebooking', 'goods', 'hotelfx', 'mapping', 'mis', 'nb', 'order', 'product', 'rabbitMQ', 'revenue', 'sa', 'search', 'shield']
                },
                MOBILE: {
                    product: 'mobile',
                    services: ['', 'common', 'hotel']
                },
                PLATFORM: {
                    product: 'platform',
                    services: ['', 'account', 'fraud', 'member', 'openapigateway', 'payment']
                },
                PROMOTION: {
                    product: 'promotion',
                    services: ['', 'around', 'bailing', 'daliyreport', 'hongbao', 'perfecthotel', 'promotion', 'tesla']
                },
                TEST: {
                    product: 'test',
                    services: ['', 'test']
                },
                TRAFFIC: {
                    product: 'traffic',
                    services: ['', 'flight', 'ihotel', 'train']
                },
                getEnumByProduct: function (product) {

                    switch (product) {
                        case me.ProductService.HOTEL.product:
                            return me.ProductService.HOTEL;
                        case me.ProductService.MOBILE.product:
                            return me.ProductService.MOBILE;
                        case me.ProductService.PLATFORM.product:
                            return me.ProductService.PLATFORM;
                        case me.ProductService.PROMOTION.product:
                            return me.ProductService.PROMOTION;
                        case me.ProductService.TEST.product:
                            return me.ProductService.TEST;
                        case me.ProductService.TRAFFIC.product:
                            return me.ProductService.TRAFFIC;
                    }
                }

            }

            //定义类型常量
            me.IndexBaseType = {
                NoType: {
                    code: "-1",
                    id: "",
                    desc: "",
                    list: [""]
                },
                TechType: {
                    code: "0",
                    id: "TechType",
                    desc: "技术类",
                    list: ["消息队列", "缓存", "OS", "日志", "逻辑处理"]
                },
                BizType: {
                    code: "1",
                    id: "BizType",
                    desc: "业务类",
                    list: ["产品管理", "内容相关", "订单流程", "服务质量", "直连", "商户端", "流量、转化", "支付相关", "商品、促销", "搜索相关"]
                }
            }

            //定义数据类型
            me.DataType = {
                Integer: {
                    code: "0",
                    id: "Integer",
                    desc: "Integer"
                },
                Float: {
                    code: "1",
                    id: "Float",
                    desc: "Float"
                },
                Double: {
                    code: "2",
                    id: "Double",
                    desc: "Double"
                }
            }

            //定义数据分类
            me.DataClassify = {
                NumType: {
                    code: "0",
                    id: "NumType",
                    desc: "数字型"
                },
                PercentType: {
                    code: "2",
                    id: "PercentType",
                    desc: "百分比型"
                },
                TimeType: {
                    code: "2",
                    id: "TimeType",
                    desc: "时间型"
                }
            }
            //定义单位分类
            me.DataUnit = {
                Times: {
                    code: "0",
                    id: "Times",
                    desc: "次"
                },
                Nums: {
                    code: "1",
                    id: "Nums",
                    desc: "个"
                },
                Percent: {
                    code: "2",
                    id: "Percent",
                    desc: "%"
                },
                Thousandths: {
                    code: "3",
                    id: "Thousandths",
                    desc: "‰"
                },
                Millisecond: {
                    code: "4",
                    id: "Millisecond",
                    desc: "ms"
                },
                Second: {
                    code: "5",
                    id: "Second",
                    desc: "s"
                },
                Hour: {
                    code: "6",
                    id: "Hour",
                    desc: "h"
                },
                Day: {
                    code: "7",
                    id: "Day",
                    desc: "天"
                }
            }
            //定义数据采集方式
            me.IndexSimplingType = {
                ActiveType: {
                    code: "0",
                    id: "ActiveType",
                    desc: "主动"
                },
                PassiveType: {
                    code: "1",
                    id: "PassiveType",
                    desc: "被动"
                }
            }

            //预定义标签
            me.DEFAULTT_TAGS = [
                {
                    tagName: "channel",
                    tagNameCn: "技术平台",
                    tagValues: [
                        {
                            name: "ios",
                            nameCn: "IOS"
                        },
                        {
                            name: "android",
                            nameCn: "Android"
                        },
                        {
                            name: "wxqb",
                            nameCn: "微信钱包"
                        },
                        {
                            name: "h5",
                            nameCn: "H5"
                        },
                        {
                            name: "pc",
                            nameCn: "PC"
                        },
                        {
                            name: "wxapp",
                            nameCn: "微信App"
                        },
                        {
                            name: "qqqb",
                            nameCn: "QQ钱包"
                        },
                        {
                            name: "ctrip",
                            nameCn: "Ctrip"
                        },
                        {
                            name: "qunar",
                            nameCn: "Qunar"
                        },
                        {
                            name: "nbother",
                            nameCn: "NBOther"
                        },
                        {
                            name: "mis",
                            nameCn: "MIS"
                        },
                        {
                            name: "hba",
                            nameCn: "HBA"
                        }

                    ]

                }, {
                    tagName: "supplier",
                    tagNameCn: "供应商分类",
                    tagValues: [
                        {
                            name: "zhq",
                            nameCn: "直签"
                        },
                        {
                            name: "ctrip",
                            nameCn: "Ctrip"
                        },
                        {
                            name: "qunar",
                            nameCn: "Qunar"
                        },
                        {
                            name: "daili",
                            nameCn: "代理商"
                        }
                    ]
                }, {
                    tagName: "userType",
                    tagNameCn: "用户群分类",
                    tagValues: [
                        {
                            name: "unRegister",
                            nameCn: "未注册用户"
                        },
                        {
                            name: "registedNoOrder",
                            nameCn: "已注册未下单用户"
                        },
                        {
                            name: "registedWithOrder",
                            nameCn: "已下单用户"
                        }
                    ]
                }, {
                    tagName: "payType",
                    tagNameCn: "支付方式",
                    tagValues: [
                        {
                            name: "prepay",
                            nameCn: "预付"
                        },
                        {
                            name: "currpay",
                            nameCn: "现付"
                        }
                    ]
                }, {
                    tagName: "idc",
                    tagNameCn: "机房名称",
                    tagValues: [
                        {
                            name: "idc1",
                            nameCn: "idc1"
                        },
                        {
                            name: "idc2",
                            nameCn: "idc2"
                        },
                        {
                            name: "idc3",
                            nameCn: "idc3"
                        }
                    ]
                }, {
                    tagName: "OrderBusinessSystem",
                    tagNameCn: "成单技术平台",
                    tagValues: [
                        {
                            name: "WeiXin",
                            nameCn: "微信钱包"
                        },
                        {
                            name: "IOS",
                            nameCn: "IOS"
                        },
                        {
                            name: "Android",
                            nameCn: "Android"
                        },
                        {
                            name: "Ctrip",
                            nameCn: "携程"
                        },
                        {
                            name: "Qunar",
                            nameCn: "去哪儿"
                        },
                        {
                            name: "NBOther",
                            nameCn: "NBOther"
                        },
                        {
                            name: "H5",
                            nameCn: "H5"
                        },
                        {
                            name: "PC",
                            nameCn: "网站"
                        },
                        {
                            name: "XiaoChengXu",
                            nameCn: "微信小程序"
                        },
                        {
                            name: "QQ",
                            nameCn: "QQ钱包"
                        },
                        {
                            name: "MIS",
                            nameCn: "MIS"
                        },
                        {
                            name: "HBA",
                            nameCn: "HBA"
                        },
                        {
                            name: "IPad",
                            nameCn: "IPad"
                        },
                        {
                            name: "WinPhone",
                            nameCn: "WinPhone"
                        }

                    ]
                }

            ]
            

            //翻译后台返回的枚举类型
            me.translateEnum=function (id) {
                switch (id) {
                    case 'GT':
                        return me.CompareType.GT;
                    case 'LT':
                        return me.CompareType.LT;
                    case 'GTE':
                        return me.CompareType.GTE;
                    case 'LTE':
                        return me.CompareType.LTE;
                    case 'BTW':
                        return me.CompareType.BTW;
                    case 'ActiveType':
                        return me.IndexSimplingType.ActiveType;
                    case 'PassiveType':
                        return me.IndexSimplingType.PassiveType;
                    case 'Day':
                        return me.DataUnit.Day;
                    case 'Hour':
                        return me.DataUnit.Hour;
                    case 'Second':
                        return me.DataUnit.Second;
                    case 'Millisecond':
                        return me.DataUnit.Millisecond;
                    case 'Thousandths':
                        return me.DataUnit.Thousandths;
                    case 'Percent':
                        return me.DataUnit.Percent;
                    case 'Nums':
                        return me.DataUnit.Nums;
                    case 'Times':
                        return me.DataUnit.Times;
                    case 'TimeType':
                        return me.DataClassify.TimeType;
                    case 'PercentType':
                        return me.DataClassify.PercentType;
                    case 'NumType':
                        return me.DataClassify.NumType;
                    case 'Integer':
                        return me.DataType.Integer;
                    case 'Float':
                        return me.DataType.Float;
                    case 'Double':
                        return me.DataType.Double;
                    case 'TechType':
                        return me.IndexBaseType.TechType;
                    case 'BizType':
                        return me.IndexBaseType.BizType;
                }
            }

        }]);
});