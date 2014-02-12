;(function ($) {

    "use strict";

    $.customPlugin = function (element, options) {

        var $element = $(element);

        var $settings = $.extend({}, {
            key: null
        }, options);


        this.customFunction1 = function () {
            alert($settings.key);
        }

        this.customFunction2 = function () {
            alert($settings.key);
        }

    }

    $.fn.customPlugin = function (options) {

        return this.each(function () {
            if (typeof $(this).data("customPlugin") === "undefined") {
                var plugin = new $.customPlugin(this, options);
                $(this).data("customPlugin", plugin);
            }
        });

        return this;
    }

})(window.jQuery);