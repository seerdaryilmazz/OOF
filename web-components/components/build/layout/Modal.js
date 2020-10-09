"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Modal = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _basic = require("../basic");

var _abstract = require("../abstract/");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Modal = exports.Modal = function (_TranslatingComponent) {
    _inherits(Modal, _TranslatingComponent);

    function Modal(props) {
        _classCallCheck(this, Modal);

        var _this = _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        return _this;
    }

    _createClass(Modal, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            $('#' + this.state.id).on({
                'show.uk.modal': function showUkModal() {
                    _this2.props.onopen && _this2.props.onopen();
                },
                'hide.uk.modal': function hideUkModal() {
                    _this2.props.onclose && _this2.props.onclose();
                }
            });
        }
    }, {
        key: "open",
        value: function open() {

            var closeOnBackgroundClicked = void 0;

            if (this.props.closeOnBackgroundClicked === true || this.props.closeOnBackgroundClicked === false) {
                closeOnBackgroundClicked = this.props.closeOnBackgroundClicked;
            } else {
                closeOnBackgroundClicked = true;
            }

            var closeOnEscKeyPressed = void 0;

            if (this.props.closeOnEscKeyPressed === true || this.props.closeOnEscKeyPressed === false) {
                closeOnEscKeyPressed = this.props.closeOnEscKeyPressed;
            } else {
                closeOnEscKeyPressed = true;
            }

            // Bu özellik doğru çalışmıyor, değer true olduğunda modal'ın kendisi de kapanıyor.
            // Detaylı bilgi için: https://github.com/uikit/uikit/issues/2123
            var closeOtherOpenModals = void 0;

            if (this.props.closeOtherOpenModals === true || this.props.closeOtherOpenModals === false) {
                closeOtherOpenModals = this.props.closeOtherOpenModals;
            } else {
                closeOtherOpenModals = true;
            }

            var center = void 0;

            if (this.props.center === true || this.props.center === false) {
                center = this.props.center;
            } else {
                center = true;
            }

            UIkit.modal('#' + this.state.id, {
                bgclose: closeOnBackgroundClicked,
                keyboard: closeOnEscKeyPressed,
                modal: closeOtherOpenModals,
                center: center
            }).show();
        }
    }, {
        key: "close",
        value: function close() {
            UIkit.modal('#' + this.state.id).hide();
        }
    }, {
        key: "isOpen",
        value: function isOpen() {
            return UIkit.modal('#' + this.state.id).isActive();
        }
    }, {
        key: "handleActionClick",
        value: function handleActionClick(item) {
            item.action();
        }
    }, {
        key: "decideFlat",
        value: function decideFlat(item) {
            if (item.flat === false) {
                return false;
            } else return true;
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var className = "uk-modal-dialog";

            if (this.props.fullscreen === true) {
                className += " uk-modal-dialog-blank uk-height-viewport";
            } else {
                if (this.props.large) {
                    className += " uk-modal-dialog-large";
                }
                if (this.props.medium) {
                    className += " uk-modal-dialog-medium";
                }
            }

            if (this.props.removePadding === true) {
                className += " uk-padding-remove";
            }

            var title = null;
            if (this.props.title) {
                title = _react2.default.createElement(
                    "div",
                    { className: "uk-modal-header" },
                    _react2.default.createElement(
                        "h3",
                        { className: "uk-modal-title" },
                        _get(Modal.prototype.__proto__ || Object.getPrototypeOf(Modal.prototype), "translate", this).call(this, this.props.title)
                    )
                );
            }

            var actions = null;
            if (this.props.actions && this.props.actions.length > 0) {
                actions = _react2.default.createElement(
                    "div",
                    { className: "uk-modal-footer uk-text-right" },
                    this.props.actions && this.props.actions.map(function (item) {
                        return _react2.default.createElement(_basic.Button, { key: item.label, flat: _this3.decideFlat(item), waves: true, style: item.buttonStyle,
                            label: item.label, onclick: function onclick() {
                                return _this3.handleActionClick(item);
                            } });
                    })
                );
            }

            var style = {};
            if (this.props.minHeight) {
                style = { minHeight: this.props.minHeight };
            }

            return _react2.default.createElement(
                "div",
                { id: this.state.id, className: "uk-modal" },
                _react2.default.createElement(
                    "div",
                    { className: className, style: style },
                    title,
                    this.props.children,
                    actions
                )
            );
        }
    }]);

    return Modal;
}(_abstract.TranslatingComponent);

Modal.contextTypes = {
    translator: _propTypes2.default.object
};