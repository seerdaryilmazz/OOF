"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ToolbarItems = exports.FormContainer = exports.ListContainer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ListContainer = exports.ListContainer = function ListContainer(props) {
    return _react2.default.createElement(
        "div",
        { id: "list-container" },
        _react2.default.createElement(
            "div",
            { className: "md-list-outside-wrapper" },
            props.children
        )
    );
};

var FormContainer = exports.FormContainer = function (_React$Component) {
    _inherits(FormContainer, _React$Component);

    function FormContainer(props) {
        _classCallCheck(this, FormContainer);

        return _possibleConstructorReturn(this, (FormContainer.__proto__ || Object.getPrototypeOf(FormContainer)).call(this, props));
    }

    _createClass(FormContainer, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                "div",
                { id: "form-container", className: this.props.width ? "uk-width-large-" + this.props.width : "uk-width-large-1-1" },
                this.props.children
            );
        }
    }]);

    return FormContainer;
}(_react2.default.Component);

var ToolbarItems = exports.ToolbarItems = function (_React$Component2) {
    _inherits(ToolbarItems, _React$Component2);

    function ToolbarItems() {
        _classCallCheck(this, ToolbarItems);

        return _possibleConstructorReturn(this, (ToolbarItems.__proto__ || Object.getPrototypeOf(ToolbarItems)).apply(this, arguments));
    }

    _createClass(ToolbarItems, [{
        key: "handleOnClick",
        value: function handleOnClick(e, item) {
            e.preventDefault();
            item.onclick && item.onclick();
        }
    }, {
        key: "handleOnClickNoDropdown",
        value: function handleOnClickNoDropdown(e, item) {
            e.preventDefault();
            item.action && item.action();
        }
    }, {
        key: "renderToolbar",
        value: function renderToolbar() {
            var _this3 = this;

            var notInDropDown = _lodash2.default.filter(this.props.actions, function (item) {
                return !item.inDropdown;
            });
            return notInDropDown.map(function (item) {
                if (item.items) {
                    return _this3.renderSubItems(item.library);
                } else {
                    switch (item.library) {
                        case "material":
                            return _react2.default.createElement(
                                "i",
                                { key: item.name,
                                    className: "page-toolbar-icon md-icon material-icons",
                                    onClick: function onClick(e) {
                                        return _this3.handleOnClick(e, item);
                                    } },
                                item.icon
                            );
                            break;
                        case "uikit":
                            return _react2.default.createElement("i", { key: item.name,
                                className: "page-toolbar-icon md-icon uk-icon-" + item.icon,
                                onClick: function onClick(e) {
                                    return _this3.handleOnClick(e, item);
                                } });
                            break;
                        case "none":
                            return false;
                            break;
                        default:
                            return _react2.default.createElement("i", { key: item.icon,
                                className: "page-toolbar-icon md-icon uk-icon-" + item.icon,
                                onClick: function onClick(e) {
                                    return _this3.handleOnClickNoDropdown(e, item);
                                } });
                    }
                }
            });
        }
    }, {
        key: "renderDropDownToolbarItems",
        value: function renderDropDownToolbarItems(inDropDown) {
            var _this4 = this;

            return inDropDown.map(function (item) {
                switch (item.library) {
                    case "material":
                        return _react2.default.createElement(
                            "li",
                            { key: item.name },
                            _react2.default.createElement(
                                "a",
                                { href: "#", onClick: function onClick(e) {
                                        return _this4.handleOnClick(e, item);
                                    } },
                                _react2.default.createElement(
                                    "i",
                                    { className: "page-toolbar-icon material-icons uk-margin-small-right" },
                                    item.icon
                                ),
                                item.name
                            )
                        );
                        break;
                    case "uikit":
                        return _react2.default.createElement(
                            "li",
                            { key: item.name },
                            _react2.default.createElement(
                                "a",
                                { href: "#", onClick: function onClick(e) {
                                        return _this4.handleOnClick(e, item);
                                    } },
                                _react2.default.createElement("i", { className: "page-toolbar-icon uk-margin-small-right uk-icon-" + item.icon }),
                                item.name
                            )
                        );
                        break;
                    default:
                        return _react2.default.createElement(
                            "li",
                            { key: item.name },
                            _react2.default.createElement(
                                "a",
                                { href: "#", onClick: function onClick(e) {
                                        return _this4.handleOnClick(e, item);
                                    } },
                                item.name
                            )
                        );
                }
            });
        }
    }, {
        key: "renderDropDownToolbar",
        value: function renderDropDownToolbar() {
            var inDropDown = _lodash2.default.filter(this.props.actions, { inDropdown: true });
            if (inDropDown.length > 0) {
                return _react2.default.createElement(
                    "div",
                    { className: "md-card-dropdown", "data-uk-dropdown": "{pos:'bottom-right'}" },
                    _react2.default.createElement(
                        "i",
                        { className: "page-toolbar-icon md-icon material-icons" },
                        "more_vert"
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "uk-dropdown uk-dropdown-small" },
                        _react2.default.createElement(
                            "ul",
                            { className: "uk-nav" },
                            this.renderDropDownToolbarItems(inDropDown)
                        )
                    )
                );
            }
            return null;
        }
    }, {
        key: "renderSubItems",
        value: function renderSubItems(library) {
            var _this5 = this;

            var hasSubItems = _lodash2.default.filter(this.props.actions, function (item) {
                return item.items;
            });
            return hasSubItems.map(function (item) {
                return _react2.default.createElement(
                    "div",
                    { className: "md-card-dropdown", "data-uk-dropdown": "{pos:'bottom-center'}", style: { marginLeft: 4, marginRight: 4 } },
                    library === "material" ? _react2.default.createElement(
                        "i",
                        { className: "page-toolbar-icon md-icon material-icons" },
                        item.icon
                    ) : _react2.default.createElement("i", { className: "page-toolbar-icon md-icon uk-margin-small-right uk-icon-" + item.icon }),
                    _react2.default.createElement(
                        "div",
                        { className: "uk-dropdown uk-dropdown-small" },
                        _react2.default.createElement(
                            "ul",
                            { className: "uk-nav" },
                            _this5.renderDropDownToolbarItems(item.items)
                        )
                    )
                );
            });
        }
    }, {
        key: "render",
        value: function render() {
            if (!this.props.actions || this.props.actions.length == 0) {
                return null;
            }
            return _react2.default.createElement(
                "div",
                { className: "md-card-toolbar-actions" },
                this.renderToolbar(),
                this.renderDropDownToolbar()
            );
        }
    }]);

    return ToolbarItems;
}(_react2.default.Component);

;