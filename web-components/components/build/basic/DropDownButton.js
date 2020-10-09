'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DropDownButton = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _abstract = require('../abstract/');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DropDownButton = exports.DropDownButton = function (_TranslatingComponent) {
    _inherits(DropDownButton, _TranslatingComponent);

    function DropDownButton(props) {
        _classCallCheck(this, DropDownButton);

        return _possibleConstructorReturn(this, (DropDownButton.__proto__ || Object.getPrototypeOf(DropDownButton)).call(this, props));
    }

    _createClass(DropDownButton, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'handleClick',
        value: function handleClick(e, item) {
            e.preventDefault();
            if (item.onclick) {
                item.onclick();
            } else {
                this.props.onclick && this.props.onclick(item);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var className = "md-btn";
            if (this.props.flat) {
                className += " md-btn-flat";
            }
            if (this.props.style) {
                className += this.props.flat ? " md-btn-flat-" + this.props.style : " md-btn-" + this.props.style;
            }
            if (this.props.size) {
                className += " md-btn-" + this.props.size;
            }
            if (this.props.waves) {
                className += " md-btn-wave waves-effect waves-button";
            }
            if (this.props.disabled) {
                className += " disabled";
            }
            var options = [];
            if (this.props.options) {
                options = this.props.options.map(function (item) {
                    return _react2.default.createElement(
                        'li',
                        { key: item.label },
                        _react2.default.createElement(
                            'a',
                            { href: '#', onClick: function onClick(e) {
                                    return _this2.handleClick(e, item);
                                } },
                            _get(DropDownButton.prototype.__proto__ || Object.getPrototypeOf(DropDownButton.prototype), 'translate', _this2).call(_this2, item.label),
                            ' '
                        )
                    );
                });
            }
            var minWidth = "400px";
            if (this.props.minWidth) {
                minWidth = this.props.minWidth;
            }
            var data_uk_dropdown = "";
            if (this.props.data_uk_dropdown) {
                data_uk_dropdown = this.props.data_uk_dropdown;
            }

            return _react2.default.createElement(
                'div',
                { className: 'uk-button-dropdown', 'data-uk-dropdown': data_uk_dropdown, 'aria-haspopup': 'true', 'aria-expanded': 'false' },
                _react2.default.createElement(
                    'button',
                    { ref: function ref(c) {
                            return _this2._input = c;
                        }, className: className, type: 'button' },
                    _get(DropDownButton.prototype.__proto__ || Object.getPrototypeOf(DropDownButton.prototype), 'translate', this).call(this, this.props.label),
                    _react2.default.createElement(
                        'i',
                        { className: 'material-icons' },
                        '\uE313'
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'uk-dropdown uk-dropdown-small uk-dropdown-bottom', style: { minWidth: minWidth, top: "35px", left: "0px" } },
                    _react2.default.createElement(
                        'ul',
                        { className: 'uk-nav uk-nav-dropdown' },
                        options
                    )
                )
            );
        }
    }]);

    return DropDownButton;
}(_abstract.TranslatingComponent);

DropDownButton.contextTypes = {
    translator: _propTypes2.default.object
};