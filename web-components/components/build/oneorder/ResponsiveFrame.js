"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ResponsiveFrame = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResponsiveFrame = exports.ResponsiveFrame = function (_React$Component) {
    _inherits(ResponsiveFrame, _React$Component);

    function ResponsiveFrame() {
        _classCallCheck(this, ResponsiveFrame);

        var _this = _possibleConstructorReturn(this, (ResponsiveFrame.__proto__ || Object.getPrototypeOf(ResponsiveFrame)).call(this));

        _this.onReceiveMessage = _this.onReceiveMessage.bind(_this);
        return _this;
    }

    _createClass(ResponsiveFrame, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            window.addEventListener("message", this.onReceiveMessage);
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            window.removeEventListener("message", this.onReceiveMessage, false);
        }
    }, {
        key: "onReceiveMessage",
        value: function onReceiveMessage(event) {
            var data = JSON.parse(event.data);
            if ('success' === data.status) {
                this.props.onSuccess && this.props.onSuccess(data.data);
            } else if ('error' === data.status) {
                this.props.onError && this.props.onError(data.data);
            } else if ('cancel' === data.status) {
                this.props.onCancel && this.props.onCancel();
            } else {
                console.log("modal warning", event.data);
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                src = _props.src,
                style = _props.style;

            return _react2.default.createElement("iframe", {
                ref: function ref(el) {
                    _this2._frame = el;
                },
                src: src,
                style: style,
                allowFullScreen: this.props.allowFullScreen || false,
                frameBorder: this.props.frameBorder || 0
            });
        }
    }]);

    return ResponsiveFrame;
}(_react2.default.Component);