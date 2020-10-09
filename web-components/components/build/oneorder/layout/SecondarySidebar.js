'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SecondarySidebar = exports.SecondarySidebar = function () {
    function SecondarySidebar() {
        _classCallCheck(this, SecondarySidebar);
    }

    _createClass(SecondarySidebar, [{
        key: 'hideSidebar',
        value: function hideSidebar() {
            window.console && console.log('hideSidebar');
            this.$body.removeClass('sidebar_secondary_active');
        }
    }, {
        key: 'showSidebar',
        value: function showSidebar() {
            this.$body.addClass('sidebar_secondary_active');
        }
    }, {
        key: 'init',
        value: function init() {
            var _this = this;

            this.$sidebarSecondary = $('#sidebar_secondary');
            this.$sidebarSecondaryToggle = $('#sidebar_secondary_toggle');
            this.$body = $('body');
            this.$document = $('document');

            if (this.$sidebarSecondary.length) {
                this.$sidebarSecondaryToggle.removeClass('sidebar_secondary_check');

                this.$sidebarSecondaryToggle.on('click', function (e) {
                    e.preventDefault();
                    _this.$body.hasClass('sidebar_secondary_active') ? _this.hideSidebar() : _this.showSidebar();
                });

                // hide sidebar (outside/esc click)
                this.$body.on('click keydown', function (e) {
                    if (_this.$body.hasClass('sidebar_secondary_active') && (!$(e.target).closest(_this.$sidebarSecondary).length && !$(e.target).closest(_this.$sidebarSecondaryToggle).length || e.which == 27)) {
                        _this.hideSidebar();
                    }
                });

                // hide page sidebar on page load
                if (this.$body.hasClass('sidebar_secondary_active')) {
                    this.hideSidebar();
                }

                // custom scroller
                //this.customScrollbar(this.$sidebarSecondary);
            }
        }
    }]);

    return SecondarySidebar;
}();