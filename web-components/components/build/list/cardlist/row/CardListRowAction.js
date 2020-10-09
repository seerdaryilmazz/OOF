'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CardListRowAction = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CardListRowAction = exports.CardListRowAction = function (_React$Component) {
    _inherits(CardListRowAction, _React$Component);

    function CardListRowAction(props) {
        _classCallCheck(this, CardListRowAction);

        var _this = _possibleConstructorReturn(this, (CardListRowAction.__proto__ || Object.getPrototypeOf(CardListRowAction)).call(this, props));

        _this.getClassName = function (actionSpec) {
            var className = "uk-icon-";
            className += actionSpec.icon;
            className += " uk-icon-medsmall";
            return className;
        };

        return _this;
    }

    _createClass(CardListRowAction, [{
        key: 'render',
        value: function render() {
            var rowData = this.props.rowData;
            var rowActions = this.props.rowActions;

            var className = this.getClassName(rowActions);

            var self = this;

            var actionElems = rowActions.map(function (rowAction) {

                var className = self.getClassName(rowAction);

                return _react2.default.createElement(
                    'li',
                    { key: _uuid2.default.v4() },
                    _react2.default.createElement(
                        'a',
                        { href: 'javascript:void(null);', onClick: function onClick() {
                                return rowAction.action(rowData);
                            } },
                        _react2.default.createElement('i', { className: className }),
                        rowAction.label
                    )
                );
            });

            if (actionElems && actionElems.length > 0) {
                return _react2.default.createElement(
                    'div',
                    { className: 'md-card-list-item-menu', 'data-uk-dropdown': '{mode:\'click\',pos:\'bottom-right\'}',
                        'aria-haspopup': 'true', 'aria-expanded': 'false' },
                    _react2.default.createElement('a', { href: '#', className: 'md-icon uk-icon uk-icon-ellipsis-v' }),
                    _react2.default.createElement(
                        'div',
                        { className: 'uk-dropdown uk-dropdown-small uk-dropdown-bottom' },
                        _react2.default.createElement(
                            'ul',
                            { className: 'uk-nav' },
                            actionElems
                        )
                    )
                );
            } else {
                return null;
            }
        }
    }]);

    return CardListRowAction;
}(_react2.default.Component);