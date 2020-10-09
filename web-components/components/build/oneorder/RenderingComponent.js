"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RenderingComponent = exports.RenderingComponent = function () {
    function RenderingComponent() {
        _classCallCheck(this, RenderingComponent);
    }

    _createClass(RenderingComponent, null, [{
        key: "render",
        value: function render(component) {

            if (component.props.hidden) {
                if (component.renderHidden) {
                    return component.renderHidden();
                } else {
                    return null;
                }
            } else if (component.props.readOnly) {
                return component.renderReadOnly();
            } else {
                return component.renderStandard();
            }
        }
    }]);

    return RenderingComponent;
}();