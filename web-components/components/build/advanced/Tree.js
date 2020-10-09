'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Tree = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _basic = require('../basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tree = exports.Tree = function (_React$Component) {
    _inherits(Tree, _React$Component);

    function Tree(props) {
        _classCallCheck(this, Tree);

        var _this = _possibleConstructorReturn(this, (Tree.__proto__ || Object.getPrototypeOf(Tree)).call(this, props));

        _this.getItem = function (data) {
            if (!data) {
                return null;
            } else if (Array.isArray(data)) {
                return _this.iterateArray(data);
            } else if (data.children && data.children.length > 0) {
                return _this.getNodeItem(data);
            } else {
                return _this.getLeafItem(data);
            }
        };

        _this.getNodeItem = function (data) {
            var className = "uk-nestable-panel";
            if (_this.props.selectedId && data.id == _this.props.selectedId) {
                className += " md-bg-blue-50";
            }

            var actionButtons = _this.retrieveActionButtons(data);

            return _react2.default.createElement(
                'div',
                { key: data.id, className: 'uk-nestable-item uk-parent uk-collapsed' },
                _react2.default.createElement(
                    'div',
                    { className: className, onClick: function onClick() {
                            return _this.elementSelected(data);
                        } },
                    _react2.default.createElement('div', { className: 'uk-nestable-toggle', 'data-nestable-action': 'toggle' }),
                    data.name,
                    actionButtons
                ),
                _this.iterateArray(data.children)
            );
        };

        _this.getLeafItem = function (data) {
            var className = "uk-nestable-panel";
            if (_this.props.selectedId && data.id == _this.props.selectedId) {
                className += " md-bg-blue-50";
            }

            var actionButtons = _this.retrieveActionButtons(data);

            return _react2.default.createElement(
                'div',
                { key: data.id, className: 'uk-nestable-item' },
                _react2.default.createElement(
                    'div',
                    { className: className, onClick: function onClick() {
                            return _this.elementSelected(data);
                        } },
                    data.name,
                    actionButtons
                )
            );
        };

        _this.iterateArray = function (arrayData) {
            return _react2.default.createElement(
                'div',
                { className: 'uk-nestable-list' },
                arrayData.map(function (data) {
                    return _this.getItem(data);
                })
            );
        };

        _this.elementSelected = function (data) {
            if (_this.props.onselect) {
                _this.props.onselect(data);
            }
        };

        _this.retrieveActionButtons = function (data) {

            if (!_this.props.actions) {
                return null;
            }

            return _react2.default.createElement(
                'div',
                null,
                _this.props.actions.map(function (action) {
                    return _react2.default.createElement(_basic.Button, { key: data.id + action.name, label: action.name, onclick: function onclick() {
                            return action.action(data);
                        } });
                })
            );
        };

        _this.state = {};
        return _this;
    }

    _createClass(Tree, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.data) {
                UIkit.nestable(this.treeTopDiv, {});
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            if (this.props.data) {
                UIkit.nestable(this.treeTopDiv, {});
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var data = this.props.data;

            if (!data) {
                return null;
            }
            return _react2.default.createElement(
                'div',
                { ref: function ref(c) {
                        return _this2.treeTopDiv = c;
                    }, className: 'uk-nestable', 'data-uk-nestable': '' },
                this.getItem(data)
            );
        }
    }]);

    return Tree;
}(_react2.default.Component);