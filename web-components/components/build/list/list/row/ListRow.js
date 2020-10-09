'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ListRow = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ListRowIcon = require('./ListRowIcon');

var _ListRowBody = require('./ListRowBody');

var _ListRowButton = require('./ListRowButton');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ListRow = exports.ListRow = function (_React$Component) {
    _inherits(ListRow, _React$Component);

    function ListRow(props) {
        _classCallCheck(this, ListRow);

        var _this = _possibleConstructorReturn(this, (ListRow.__proto__ || Object.getPrototypeOf(ListRow)).call(this, props));

        _this.getIconObject = function (headers, rowData) {

            var i = 0;
            var icons = headers.iconGroup.icons;
            var iconParam = rowData[headers.iconGroup.property];

            for (i = 0; i < icons.length; i++) {

                var usedBy = icons[i].usedBy;
                var j = 0;

                for (j = 0; j < usedBy.length; j++) {
                    if (usedBy[j].toString() == iconParam.toString()) {
                        return icons[i];
                    }
                }
            }

            return headers.iconGroup.defaultIcon;
        };

        _this.getButtonObject = function (headers, rowData) {

            var i = 0;
            var buttons = headers.buttonGroup.buttons;
            var buttonParam = rowData[headers.buttonGroup.property];

            for (i = 0; i < buttons.length; i++) {

                var usedBy = buttons[i].usedBy;
                var j = 0;

                for (j = 0; j < usedBy.length; j++) {
                    if (usedBy[j].toString() == buttonParam.toString()) {
                        return buttons[i];
                    }
                }
            }

            return headers.buttonGroup.defaultButton;
        };

        return _this;
    }

    _createClass(ListRow, [{
        key: 'render',
        value: function render() {

            var rowData = this.props.rowData;
            var headers = this.props.headers;

            var icon = null;
            var button = null;

            if (headers.iconGroup) {
                var iconObject = this.getIconObject(headers, rowData);
                if (iconObject) {
                    icon = _react2.default.createElement(_ListRowIcon.ListRowIcon, { icon: iconObject.icon });
                }
            }

            if (headers.buttonGroup) {
                var buttonObject = this.getButtonObject(headers, rowData);
                if (buttonObject) {
                    button = _react2.default.createElement(_ListRowButton.ListRowButton, { label: buttonObject.label, action: buttonObject.action, rowData: rowData });
                }
            }

            return _react2.default.createElement(
                'li',
                null,
                icon,
                _react2.default.createElement(_ListRowBody.ListRowBody, { headers: headers, rowData: rowData, button: button })
            );
        }
    }]);

    return ListRow;
}(_react2.default.Component);