"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DataTableGroupByRow = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataTableGroupByRow = exports.DataTableGroupByRow = function (_React$Component) {
    _inherits(DataTableGroupByRow, _React$Component);

    function DataTableGroupByRow(props) {
        _classCallCheck(this, DataTableGroupByRow);

        return _possibleConstructorReturn(this, (DataTableGroupByRow.__proto__ || Object.getPrototypeOf(DataTableGroupByRow)).call(this, props));
    }

    _createClass(DataTableGroupByRow, [{
        key: "handleClick",
        value: function handleClick() {
            this.props.onclick && this.props.onclick();
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var level = this.props.level || 0;

            var className = "";
            if (this.props.level === 1) {
                className += " md-bg-grey-300";
            }
            var buttonClass = "uk-icon-chevron-" + (this.props.isHidden ? "down" : "up");

            var label = "";
            var value = this.props.value;
            var indexOfColon = value.indexOf(":");

            if (indexOfColon > -1) {
                label = value.substring(0, indexOfColon + 2);
                value = value.substring(indexOfColon + 2);
            }

            return _react2.default.createElement(
                "tr",
                { style: { borderBottom: "3px double #d0d0d0" } },
                _react2.default.createElement(
                    "td",
                    { style: { textIndent: level * 10 }, colSpan: this.props.columnsLength, className: className },
                    _react2.default.createElement("a", { href: "javascript:void(0);",
                        className: buttonClass,
                        style: { textIndent: 0, margin: "0 10px 0 0" },
                        onClick: function onClick() {
                            return _this2.handleClick();
                        } }),
                    _react2.default.createElement(
                        "span",
                        { className: "uk-text-bold" },
                        label
                    ),
                    value,
                    " (",
                    this.props.rowLength,
                    ")"
                )
            );
        }
    }]);

    return DataTableGroupByRow;
}(_react2.default.Component);