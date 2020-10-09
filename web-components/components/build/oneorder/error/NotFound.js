"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NotFound = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _abstract = require("../../abstract/");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NotFound = exports.NotFound = function (_TranslatingComponent) {
    _inherits(NotFound, _TranslatingComponent);

    function NotFound() {
        _classCallCheck(this, NotFound);

        return _possibleConstructorReturn(this, (NotFound.__proto__ || Object.getPrototypeOf(NotFound)).apply(this, arguments));
    }

    _createClass(NotFound, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                "div",
                { className: "error_page" },
                _react2.default.createElement(
                    "div",
                    { className: "error_page_header md-bg-amber-700" },
                    _react2.default.createElement(
                        "div",
                        { className: "uk-width-8-10 uk-container-center" },
                        "404!"
                    )
                ),
                _react2.default.createElement(
                    "div",
                    { className: "error_page_content" },
                    _react2.default.createElement(
                        "div",
                        { className: "uk-width-8-10 uk-container-center" },
                        _react2.default.createElement(
                            "p",
                            { className: "heading_b" },
                            "Page not found"
                        ),
                        _react2.default.createElement(
                            "p",
                            { className: "uk-text-large" },
                            "The requested URL ",
                            _react2.default.createElement(
                                "span",
                                { className: "uk-text-muted" },
                                this.props.location.pathname
                            ),
                            " was not found on this server."
                        )
                    )
                )
            );
        }
    }]);

    return NotFound;
}(_abstract.TranslatingComponent);