define([ 'app','toastr' ], function(app) {
	var toastr = require("toastr");
    app.service('alertUtil', [function(){
        var alertMessageInstance;
        function constructor() {
            var opts = {
                "closeButton": true,
                "debug": false,
                "positionClass": "toast-top-right",
                //  "containerId": 'pageBody',
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": "3000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };

            //  toastr.error("这个操作是错误的", opts);
            return {
                error: function (title, content) {
                    return toastr.error(content, title, opts);
                },
                success: function (title, content) {
                    return toastr.success(content, title, opts);
                },
                warning: function (title, content) {
                    return toastr.error(content, title, opts);
                },
                info: function (title, content) {
                    return toastr.success(content, title, opts);
                }
            }
        }
        return {
            getInstance:function() {
                if (!alertMessageInstance)
                    alertMessageInstance = constructor();
                return alertMessageInstance;
            }
        }

    }]);

});