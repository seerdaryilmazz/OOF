"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FabToolbar = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _abstract = require("../abstract");

var _layout = require("../layout");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FabToolbar = exports.FabToolbar = function (_TranslatingComponent) {
    _inherits(FabToolbar, _TranslatingComponent);

    function FabToolbar(props) {
        _classCallCheck(this, FabToolbar);

        return _possibleConstructorReturn(this, (FabToolbar.__proto__ || Object.getPrototypeOf(FabToolbar)).call(this, props));
    }

    _createClass(FabToolbar, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var $fab_toolbar = $('.md-fab-toolbar');

            if ($fab_toolbar) {
                $fab_toolbar.children('i').on('click', function (e) {
                    e.preventDefault();
                    var toolbarItems = $fab_toolbar.children('.md-fab-toolbar-actions').children().length;

                    $fab_toolbar.addClass('md-fab-animated');

                    var FAB_padding = !$fab_toolbar.hasClass('md-fab-small') ? 16 : 24,
                        FAB_size = !$fab_toolbar.hasClass('md-fab-small') ? 64 : 44;

                    setTimeout(function () {
                        $fab_toolbar.width(toolbarItems * FAB_size + FAB_padding);
                    }, 140);

                    setTimeout(function () {
                        $fab_toolbar.addClass('md-fab-active');
                    }, 420);
                });

                $(document).on('click scroll', function (e) {
                    if ($fab_toolbar.hasClass('md-fab-active')) {
                        if (!$(e.target).closest($fab_toolbar).length) {

                            $fab_toolbar.css('width', '').removeClass('md-fab-active');

                            setTimeout(function () {
                                $fab_toolbar.removeClass('md-fab-animated');
                            }, 140);
                        }
                    }
                });
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                "div",
                { className: "md-fab-wrapper", style: this.props.style },
                _react2.default.createElement(
                    "div",
                    { className: "md-fab md-fab-toolbar md-fab-small md-fab-accent" },
                    _react2.default.createElement(
                        "i",
                        { className: "material-icons" },
                        "\uE8BE"
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "md-fab-toolbar-actions" },
                        this.props.actions.map(function (item, index) {
                            return _react2.default.createElement(
                                _layout.Secure,
                                { users: item.users, usersKey: item.usersKey, operations: item.operationName, key: index },
                                _react2.default.createElement(FabButton, { name: item.name, label: item.label, title: _get(FabToolbar.prototype.__proto__ || Object.getPrototypeOf(FabToolbar.prototype), "translate", _this2).call(_this2, item.name), onclick: function onclick(e) {
                                        return item.onAction(e);
                                    }, icon: item.icon })
                            );
                        })
                    )
                )
            );
        }
    }]);

    return FabToolbar;
}(_abstract.TranslatingComponent);

FabToolbar.contextTypes = {
    translator: _propTypes2.default.object
};

var FabButton = function (_React$Component) {
    _inherits(FabButton, _React$Component);

    function FabButton() {
        _classCallCheck(this, FabButton);

        return _possibleConstructorReturn(this, (FabButton.__proto__ || Object.getPrototypeOf(FabButton)).apply(this, arguments));
    }

    _createClass(FabButton, [{
        key: "render",
        value: function render() {
            var _this4 = this;

            return _react2.default.createElement(
                "button",
                { key: this.props.name, type: "submit", "data-uk-tooltip": "{cls:'uk-tooltip-small',pos:'bottom'}", title: this.props.title, onClick: function onClick(e) {
                        return _this4.props.onclick(e);
                    } },
                this.props.label ? _react2.default.createElement(
                    "i",
                    { className: "material-icons md-color-white", style: { marginTop: "-6.5px" } },
                    this.props.label
                ) : _react2.default.createElement(
                    "i",
                    { className: "material-icons md-color-white" },
                    this.props.icon
                )
            );
        }
    }]);

    return FabButton;
}(_react2.default.Component);