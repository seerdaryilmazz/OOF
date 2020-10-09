'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Page = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _abstract = require('../abstract/');

var _layout = require('../oneorder/layout');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Page = exports.Page = function (_TranslatingComponent) {
    _inherits(Page, _TranslatingComponent);

    function Page(props) {
        _classCallCheck(this, Page);

        var _this = _possibleConstructorReturn(this, (Page.__proto__ || Object.getPrototypeOf(Page)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(Page, [{
        key: 'handleToolbarClick',
        value: function handleToolbarClick(toolbarItem, event) {
            event.preventDefault();
            toolbarItem.action();
        }
    }, {
        key: 'render',
        value: function render() {

            var className = "md-card";
            if (this.props.className) {
                className += " " + this.props.className;
            }
            return _react2.default.createElement(
                'div',
                { className: className },
                _react2.default.createElement(
                    'div',
                    { className: 'uk-grid uk-grid-collapse' },
                    _react2.default.createElement(
                        'div',
                        { className: 'uk-width-medium-1-1' },
                        _react2.default.createElement(
                            'div',
                            { className: 'md-card-toolbar hidden-print' },
                            _react2.default.createElement(_layout.ToolbarItems, { actions: this.props.toolbarItems }),
                            _react2.default.createElement(
                                'div',
                                { className: 'md-card-toolbar-sub-title' },
                                _get(Page.prototype.__proto__ || Object.getPrototypeOf(Page.prototype), 'translate', this).call(this, this.props.title)
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'uk-width-medium-1-1' },
                        _react2.default.createElement(
                            'div',
                            { className: 'md-card-toolbar-sub-title-small-only' },
                            _get(Page.prototype.__proto__ || Object.getPrototypeOf(Page.prototype), 'translate', this).call(this, this.props.title)
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'md-card-content' },
                    this.props.children
                )
            );
        }
    }]);

    return Page;
}(_abstract.TranslatingComponent);

Page.contextTypes = {
    translator: _react2.default.PropTypes.object
};