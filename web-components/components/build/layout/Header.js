'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ActionHeader = exports.HeaderWithBackground = exports.CardHeader = exports.CardSubHeader = exports.PageHeader = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _abstract = require('../abstract/');

var _basic = require('../basic');

var _2 = require('./');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PageHeader = exports.PageHeader = function (_TranslatingComponent) {
    _inherits(PageHeader, _TranslatingComponent);

    function PageHeader() {
        _classCallCheck(this, PageHeader);

        return _possibleConstructorReturn(this, (PageHeader.__proto__ || Object.getPrototypeOf(PageHeader)).apply(this, arguments));
    }

    _createClass(PageHeader, [{
        key: 'render',
        value: function render() {
            var icon = "";
            if (this.props.icon) {
                icon = this.props.icon;
            }
            var subtitle = "";
            if (this.props.subtitle) {
                subtitle = _react2.default.createElement(
                    'span',
                    { className: 'sub-heading' },
                    this.props.translate ? _get(PageHeader.prototype.__proto__ || Object.getPrototypeOf(PageHeader.prototype), 'translate', this).call(this, this.props.subtitle) : this.props.subtitle
                );
            }
            return _react2.default.createElement(
                'h3',
                { className: 'heading_b uk-margin-bottom' },
                this.props.translate ? _get(PageHeader.prototype.__proto__ || Object.getPrototypeOf(PageHeader.prototype), 'translate', this).call(this, this.props.title) : this.props.title,
                icon,
                subtitle
            );
        }
    }]);

    return PageHeader;
}(_abstract.TranslatingComponent);

PageHeader.contextTypes = {
    translator: _propTypes2.default.object
};

var CardSubHeader = exports.CardSubHeader = function (_TranslatingComponent2) {
    _inherits(CardSubHeader, _TranslatingComponent2);

    function CardSubHeader() {
        _classCallCheck(this, CardSubHeader);

        return _possibleConstructorReturn(this, (CardSubHeader.__proto__ || Object.getPrototypeOf(CardSubHeader)).apply(this, arguments));
    }

    _createClass(CardSubHeader, [{
        key: 'render',
        value: function render() {
            var _this3 = this;

            var toolbar = this.props.toolbar || [];
            return _react2.default.createElement(
                'h3',
                { className: 'full_width_in_card card-sub-header' },
                this.props.translate ? _get(CardSubHeader.prototype.__proto__ || Object.getPrototypeOf(CardSubHeader.prototype), 'translate', this).call(this, this.props.title) : this.props.title,
                toolbar.map(function (item) {
                    return _react2.default.createElement('i', { key: item.iconClass, style: { float: "right", marginTop: "-5px" }, className: "md-icon-small " + item.iconClass,
                        title: _this3.props.translate ? _get(CardSubHeader.prototype.__proto__ || Object.getPrototypeOf(CardSubHeader.prototype), 'translate', _this3).call(_this3, item.title) : item.title, 'data-uk-tooltip': '{pos:\'bottom\'}', onClick: function onClick() {
                            return item.onClick();
                        } });
                })
            );
        }
    }]);

    return CardSubHeader;
}(_abstract.TranslatingComponent);

CardSubHeader.contextTypes = {
    translator: _propTypes2.default.object
};

var CardHeader = exports.CardHeader = function (_TranslatingComponent3) {
    _inherits(CardHeader, _TranslatingComponent3);

    function CardHeader() {
        _classCallCheck(this, CardHeader);

        return _possibleConstructorReturn(this, (CardHeader.__proto__ || Object.getPrototypeOf(CardHeader)).apply(this, arguments));
    }

    _createClass(CardHeader, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'h3',
                { className: 'full_width_in_card heading_c' },
                this.props.translate ? _get(CardHeader.prototype.__proto__ || Object.getPrototypeOf(CardHeader.prototype), 'translate', this).call(this, this.props.title) : this.props.title
            );
        }
    }]);

    return CardHeader;
}(_abstract.TranslatingComponent);

CardHeader.contextTypes = {
    translator: _propTypes2.default.object
};

var HeaderWithBackground = exports.HeaderWithBackground = function (_TranslatingComponent4) {
    _inherits(HeaderWithBackground, _TranslatingComponent4);

    function HeaderWithBackground() {
        _classCallCheck(this, HeaderWithBackground);

        return _possibleConstructorReturn(this, (HeaderWithBackground.__proto__ || Object.getPrototypeOf(HeaderWithBackground)).apply(this, arguments));
    }

    _createClass(HeaderWithBackground, [{
        key: 'triggerOnClickIfNecessary',
        value: function triggerOnClickIfNecessary(onClickFunction) {
            if (onClickFunction) {
                onClickFunction();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var backgroundColor = void 0;

            if (this.props.backgroundColor) {
                backgroundColor = this.props.backgroundColor;
            } else {
                // Diğer renk seçenekleri için: http://altair_html.tzdthemes.com/components_colors.html
                backgroundColor = "md-bg-grey-200";
            }

            var className = "heading_c " + backgroundColor;

            var style = {
                padding: "10px 16px 10px 16px"
            };

            if (this.props.onClick) {
                style.cursor = "pointer";
            }

            var icon = null;

            if (this.props.icon) {
                var styleForIcon = {
                    display: "inline",
                    float: "right",
                    verticalAlign: "middle",
                    paddingLeft: "18px"
                };
                if (this.props.onIconClick) {
                    styleForIcon.cursor = "pointer";
                }
                icon = _react2.default.createElement('i', { key: 0, className: "uk-icon-medsmall uk-icon-" + this.props.icon, style: styleForIcon, onClick: function onClick() {
                        return _this6.triggerOnClickIfNecessary(_this6.props.onIconClick);
                    } });
            }

            var options = [];
            if (icon) {
                options.push(icon);
            }
            if (!_.isEmpty(this.props.options)) {
                var styleForOption = {
                    display: "inline",
                    float: "right",
                    verticalAlign: "middle"
                };
                this.props.options.forEach(function (option, i) {
                    options.push(_react2.default.createElement(
                        'i',
                        { key: i + 1, className: 'md-icon material-icons', style: styleForOption, onClick: function onClick() {
                                return _this6.triggerOnClickIfNecessary(option.onclick);
                            } },
                        option.icon
                    ));
                });
            }

            var title = void 0;
            if (this.props.title && this.props.title.trim().length > 0) {
                title = this.props.translate ? _get(HeaderWithBackground.prototype.__proto__ || Object.getPrototypeOf(HeaderWithBackground.prototype), 'translate', this).call(this, this.props.title) : this.props.title;
            } else {
                title = _react2.default.createElement(
                    'span',
                    null,
                    '\xA0'
                );
            }

            return _react2.default.createElement(
                'h3',
                { className: className, style: style, onClick: function onClick() {
                        return _this6.triggerOnClickIfNecessary(_this6.props.onClick);
                    } },
                title,
                options
            );
        }
    }]);

    return HeaderWithBackground;
}(_abstract.TranslatingComponent);

HeaderWithBackground.contextTypes = {
    translator: _propTypes2.default.object
};

var ActionHeader = exports.ActionHeader = function (_TranslatingComponent5) {
    _inherits(ActionHeader, _TranslatingComponent5);

    function ActionHeader(props) {
        _classCallCheck(this, ActionHeader);

        return _possibleConstructorReturn(this, (ActionHeader.__proto__ || Object.getPrototypeOf(ActionHeader)).call(this, props));
    }

    _createClass(ActionHeader, [{
        key: 'emptyOnClick',
        value: function emptyOnClick() {}
    }, {
        key: 'render',
        value: function render() {
            var _this8 = this;

            var className = "full_width_in_card heading_c " + this.props.backgroundColor;

            if (this.props.removeTopMargin) {
                className += " uk-margin-top-remove";
            }

            var toolbar = [];
            if (!this.props.readOnly && !_.isEmpty(this.props.tools)) {
                this.props.tools.forEach(function (tool) {
                    if (tool && !_.isEmpty(tool.items)) {
                        if (tool.items.length == 1) {
                            var item = tool.items[0];
                            toolbar.push(_react2.default.createElement(
                                _2.Secure,
                                { operations: _this8.props.operationName },
                                _react2.default.createElement(_basic.Button, { label: tool.title, icon: tool.icon, flat: tool.flat, waves: true, style: tool.style ? tool.style : "primary", size: 'mini', onclick: function onclick() {
                                        return item.onclick();
                                    } })
                            ));
                        } else {
                            toolbar.push(_react2.default.createElement(
                                _2.Secure,
                                { operations: _this8.props.operationName },
                                _react2.default.createElement(_basic.DropDownButton, { label: tool.title, waves: true, style: tool.style ? tool.style : "primary", size: 'mini', options: tool.items,
                                    minWidth: tool.minWidth ? tool.minWidth : "50px", data_uk_dropdown: tool.data_uk_dropdown ? tool.data_uk_dropdown : "" }),
                                ');'
                            ));
                        }
                    }
                });
            }
            return _react2.default.createElement(
                'h3',
                { className: className },
                _get(ActionHeader.prototype.__proto__ || Object.getPrototypeOf(ActionHeader.prototype), 'translate', this).call(this, this.props.title),
                toolbar.map(function (tool, index) {
                    return _react2.default.createElement(
                        'div',
                        { key: index, className: 'uk-align-right' },
                        tool
                    );
                })
            );
        }
    }]);

    return ActionHeader;
}(_abstract.TranslatingComponent);

ActionHeader.defaultProps = {
    backgroundColor: "md-bg-grey-200"
};

ActionHeader.contextTypes = {
    translator: _propTypes2.default.object
};