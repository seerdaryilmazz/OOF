"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ListRowBody = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ListRowBody = exports.ListRowBody = function (_React$Component) {
    _inherits(ListRowBody, _React$Component);

    function ListRowBody(props) {
        _classCallCheck(this, ListRowBody);

        return _possibleConstructorReturn(this, (ListRowBody.__proto__ || Object.getPrototypeOf(ListRowBody)).call(this, props));
    }

    _createClass(ListRowBody, [{
        key: "render",
        value: function render() {
            var rowData = this.props.rowData;
            var headers = this.props.headers;

            return _react2.default.createElement(
                "div",
                { className: "md-list-content" },
                _react2.default.createElement(
                    "span",
                    { className: "md-card-list-heading" },
                    rowData[headers.header]
                ),
                _react2.default.createElement(
                    "span",
                    { className: "uk-text-small uk-text-muted" },
                    rowData[headers.details]
                ),
                this.props.button
            );
        }
    }]);

    return ListRowBody;
}(_react2.default.Component);