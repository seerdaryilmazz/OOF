'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CardListRow = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _CardListRowIcon = require('./CardListRowIcon');

var _CardListRowBody = require('./CardListRowBody');

var _CardListRowAction = require('./CardListRowAction');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CardListRow = exports.CardListRow = function (_React$Component) {
    _inherits(CardListRow, _React$Component);

    function CardListRow(props) {
        _classCallCheck(this, CardListRow);

        var _this = _possibleConstructorReturn(this, (CardListRow.__proto__ || Object.getPrototypeOf(CardListRow)).call(this, props));

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

            if (headers.iconGroup.defaultIcon) {
                return headers.iconGroup.defaultIcon;
            }

            return null;
        };

        _this.getActionsObject = function (headers, rowData) {

            var i = 0;
            var actions = headers.actionGroup.actions;
            var actionParam = rowData[headers.actionGroup.property];

            var result = [];

            for (i = 0; i < actions.length; i++) {

                var usedBy = actions[i].usedBy;
                var j = 0;

                for (j = 0; j < usedBy.length; j++) {
                    if (usedBy[j].toString() == actionParam.toString()) {
                        actions[i].list.map(function (actionElem) {
                            result.push(actionElem);
                        });
                    }
                }
            }

            if (headers.actionGroup.defaultActions) {

                var defaultActions = headers.actionGroup.defaultActions;

                for (i = 0; i < defaultActions.length; i++) {
                    result.push(defaultActions[i]);
                }
            }

            return result;
        };

        return _this;
    }

    _createClass(CardListRow, [{
        key: 'render',
        value: function render() {

            var rowData = this.props.rowData;
            var headers = this.props.headers;

            var icon = null;
            var actions = null;

            if (headers.iconGroup) {
                var iconObject = this.getIconObject(headers, rowData);
                if (iconObject) {
                    icon = _react2.default.createElement(_CardListRowIcon.CardListRowIcon, { color: iconObject.color, label: iconObject.label });
                }
            }

            if (headers.actionGroup) {
                var actionsObject = this.getActionsObject(headers, rowData);
                if (actionsObject && actionsObject.length > 0) {
                    actions = _react2.default.createElement(_CardListRowAction.CardListRowAction, { rowActions: actionsObject, rowData: rowData });
                }
            }

            return _react2.default.createElement(
                'li',
                null,
                icon,
                _react2.default.createElement(_CardListRowBody.CardListRowBody, { headers: headers, rowData: rowData }),
                actions
            );
        }
    }]);

    return CardListRow;
}(_react2.default.Component);