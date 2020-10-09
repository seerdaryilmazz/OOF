'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TableFooterRow = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TableFooterRow = exports.TableFooterRow = function (_React$Component) {
    _inherits(TableFooterRow, _React$Component);

    function TableFooterRow(props) {
        _classCallCheck(this, TableFooterRow);

        var _this = _possibleConstructorReturn(this, (TableFooterRow.__proto__ || Object.getPrototypeOf(TableFooterRow)).call(this, props));

        _this.prepareRowData = function (headers, footer, icons, self) {

            return headers.map(function (header) {

                var className = self.getClassName(header);
                var hidden = self.isHidden(header);

                var style = {};
                if (hidden) {
                    style.display = 'none';
                }

                return _react2.default.createElement(
                    'td',
                    { key: header.data, className: className, style: style },
                    self.getCellValue(header.data, footer, icons, self)
                );
            });
        };

        _this.getCellValue = function (headerData, footer, icons, self) {

            var value = footer[headerData];
            var icon = null;

            var displayValue = true;;

            var iconAlign = "left";

            if (icons) {

                var currIconSet = icons[headerData];

                if (currIconSet) {

                    if (!currIconSet.displayValue) {
                        displayValue = false;
                    }
                    currIconSet.data.forEach(function (currIcon) {
                        if (currIcon.value == value) {
                            icon = self.getIconElem(headerData, currIcon.icon);
                        }
                    });

                    if (!icon && currIconSet.default) {
                        icon = self.getIconElem(headerData, currIconSet.default);
                    }

                    if (currIconSet.align) {
                        iconAlign = currIconSet.align;
                    }
                }
            }

            var result = [];

            if (icon && iconAlign == "left") {
                result.push(icon);
            }

            if (displayValue) {
                result.push(value);
            }

            if (icon && iconAlign == "right") {
                result.push(icon);
            }

            return result;
        };

        _this.getIconElem = function (headerData, iconName) {

            var className = "uk-icon-" + iconName;

            return _react2.default.createElement('i', { key: headerData, className: className });
        };

        _this.isHidden = function (header) {
            if (!header.hidden) {
                return false;
            }
            return true;
        };

        _this.getClassName = function (header) {

            return _this.getClassNameAlignment(header);
        };

        _this.getClassNameAlignment = function (header) {

            var className = "uk-text-";

            if (header.alignment) {
                className += header.alignment;
            } else {
                className += "center";
            }

            return className;
        };

        return _this;
    }

    _createClass(TableFooterRow, [{
        key: 'render',
        value: function render() {

            var footer = this.props.footer;
            var headers = this.props.headers;
            var icons = this.props.icons;

            var self = this;

            if (footer) {

                return _react2.default.createElement(
                    'tr',
                    null,
                    this.prepareRowData(headers, footer, icons, self)
                );
            } else {
                return null;
            }
        }
    }]);

    return TableFooterRow;
}(_react2.default.Component);