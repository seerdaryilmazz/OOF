'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Card = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _abstract = require('../abstract/');

var _layout = require('../oneorder/layout');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Card = exports.Card = function (_TranslatingComponent) {
    _inherits(Card, _TranslatingComponent);

    function Card(props) {
        _classCallCheck(this, Card);

        var _this = _possibleConstructorReturn(this, (Card.__proto__ || Object.getPrototypeOf(Card)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(Card, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'handleToolbarClick',
        value: function handleToolbarClick(toolbarItem, event) {
            event.preventDefault();
            toolbarItem.action();
        }
    }, {
        key: 'render',
        value: function render() {
            var toolbar = "";
            var title = "";
            if (this.props.toolbarItems) {
                toolbar = _react2.default.createElement(
                    'div',
                    { className: 'md-card-toolbar' },
                    _react2.default.createElement(_layout.ToolbarItems, { actions: this.props.toolbarItems }),
                    _react2.default.createElement(
                        'h3',
                        { className: 'md-card-toolbar-heading-text', style: { fontSize: "14px" } },
                        _get(Card.prototype.__proto__ || Object.getPrototypeOf(Card.prototype), 'translate', this).call(this, this.props.title)
                    )
                );
            } else {
                title = _react2.default.createElement(
                    'h3',
                    { className: 'heading_a', style: { fontSize: "14px" } },
                    _get(Card.prototype.__proto__ || Object.getPrototypeOf(Card.prototype), 'translate', this).call(this, this.props.title)
                );
            }
            var className = "md-card";
            if (this.props.className) {
                className += " " + this.props.className;
            }
            var contentClassName = ["md-card-content"];
            if (this.props.zeroPadding) {
                contentClassName.push("uk-padding-remove");
            }
            return _react2.default.createElement(
                'div',
                { className: className, style: this.props.style },
                toolbar,
                _react2.default.createElement(
                    'div',
                    { className: contentClassName.join(" ") },
                    title,
                    this.props.children
                )
            );
        }
    }]);

    return Card;
}(_abstract.TranslatingComponent);

Card.contextTypes = {
    translator: _propTypes2.default.object
};