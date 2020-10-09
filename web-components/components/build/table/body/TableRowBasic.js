'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TableRowBasic = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _TableRowAction = require('../action/TableRowAction');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TableRowBasic = exports.TableRowBasic = function (_React$Component) {
    _inherits(TableRowBasic, _React$Component);

    function TableRowBasic(props) {
        _classCallCheck(this, TableRowBasic);

        var _this = _possibleConstructorReturn(this, (TableRowBasic.__proto__ || Object.getPrototypeOf(TableRowBasic)).call(this, props));

        _this.prepareRowData = function (headers, rowData, icons, self) {

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
                    self.getCellValue(header, rowData, icons, self)
                );
            });
        };

        _this.getCellValue = function (header, rowData, icons, self) {

            var value = void 0;

            if (header.render) {
                value = header.render(rowData);
                if (!value) {
                    value = "";
                }
            } else if (value = rowData[header.data]) {
                if (value instanceof Object) {
                    if (value.value) {
                        value = value.value;
                    } else if (value.name) {
                        value = value.name;
                    } else {
                        value = "";
                    }
                }
            }

            if (!value) {
                value = "";
            }

            var icon = null;

            var displayValue = true;

            var iconAlign = "left";

            if (icons) {

                var currIconSet = icons[header.data];

                if (currIconSet) {

                    if (!currIconSet.displayValue) {
                        displayValue = false;
                    }
                    currIconSet.data.forEach(function (currIcon) {
                        if (currIcon.value == value) {
                            icon = self.getIconElem(header.data, currIcon.icon);
                        }
                    });

                    if (!icon && currIconSet.default) {
                        icon = self.getIconElem(header.data, currIconSet.default);
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

    _createClass(TableRowBasic, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var rowData = this.props.row;
            var headers = this.props.headers;
            var actionButtons = this.props.actionButtons;
            var icons = this.props.icons;
            var rowClick = this.props.rowClick;
            var rowEdit = this.props.rowEdit;
            var rowDelete = this.props.rowDelete;

            var self = this;

            var className = "";

            if (this.props.selected) {
                className = "md-bg-blue-50";
            }

            if (rowData) {

                return _react2.default.createElement(
                    'tr',
                    { onClick: function onClick() {
                            return rowClick(_this2.props.index);
                        }, className: className },
                    this.prepareRowData(headers, rowData, icons, self),
                    _react2.default.createElement(_TableRowAction.TableRowAction, { actionButtons: actionButtons, index: this.props.index, values: rowData,
                        rowEdit: rowEdit, rowDelete: rowDelete,
                        enableRowEditMode: function enableRowEditMode(index) {
                            return _this2.props.enableRowEditMode(index);
                        } })
                );
            } else {
                return null;
            }
        }
    }]);

    return TableRowBasic;
}(_react2.default.Component);