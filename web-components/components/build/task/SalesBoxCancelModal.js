"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SalesBoxCancelModal = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _abstract = require("../abstract");

var _layout = require("../layout");

var _basic = require("../basic");

var _SalesBoxCancelReasonDropDown = require("./SalesBoxCancelReasonDropDown");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SalesBoxCancelModal = exports.SalesBoxCancelModal = function (_TranslatingComponent) {
    _inherits(SalesBoxCancelModal, _TranslatingComponent);

    function SalesBoxCancelModal(props) {
        _classCallCheck(this, SalesBoxCancelModal);

        var _this = _possibleConstructorReturn(this, (SalesBoxCancelModal.__proto__ || Object.getPrototypeOf(SalesBoxCancelModal)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(SalesBoxCancelModal, [{
        key: "componentDidMount",
        value: function componentDidMount() {}
    }, {
        key: "updateProperty",
        value: function updateProperty(propertyName, propertyValue) {
            this.setState(_defineProperty({}, propertyName, propertyValue));
        }
    }, {
        key: "open",
        value: function open() {
            this.modalReference.open();
        }
    }, {
        key: "close",
        value: function close() {
            this.modalReference.close();
        }
    }, {
        key: "cancel",
        value: function cancel() {
            this.props.onCancel();
        }
    }, {
        key: "save",
        value: function save() {

            var state = _lodash2.default.cloneDeep(this.state);

            if (_lodash2.default.isNil(state.reason)) {
                _basic.Notify.showError("A reason must be specified.");
                return;
            }

            if (!_lodash2.default.isNil(state.description) && state.description.length > 500) {
                _basic.Notify.showError("Length of description can be 500 at most.");
                return;
            }

            var data = {};
            data.task = _lodash2.default.cloneDeep(this.props.task);
            data.reason = state.reason;
            data.description = state.description;

            this.props.onSave(data);
        }
    }, {
        key: "renderModalContent",
        value: function renderModalContent() {
            var _this2 = this;

            if (_lodash2.default.isNil(this.props.task)) {
                return null;
            } else {
                return _react2.default.createElement(
                    _layout.Grid,
                    null,
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: "1-1" },
                        _react2.default.createElement(_SalesBoxCancelReasonDropDown.SalesBoxCancelReasonDropDown, { label: "Reason",
                            value: this.state.reason,
                            onchange: function onchange(value) {
                                return _this2.updateProperty("reason", value);
                            },
                            required: true })
                    ),
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: "1-1" },
                        _react2.default.createElement(_basic.TextArea, { label: "Description",
                            value: this.state.description,
                            onchange: function onchange(value) {
                                return _this2.updateProperty("description", value);
                            } })
                    ),
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: "1-1" },
                        _react2.default.createElement(
                            "div",
                            { className: "uk-align-right" },
                            _react2.default.createElement(_basic.Button, { label: "Cancel", waves: true, onclick: function onclick() {
                                    return _this2.cancel();
                                } }),
                            _react2.default.createElement(_basic.Button, { label: "Save", style: "primary", waves: true, onclick: function onclick() {
                                    return _this2.save();
                                } })
                        )
                    )
                );
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            return _react2.default.createElement(
                _layout.Modal,
                { title: "Cancel Sales Box",
                    large: false,
                    ref: function ref(c) {
                        return _this3.modalReference = c;
                    } },
                this.renderModalContent()
            );
        }
    }]);

    return SalesBoxCancelModal;
}(_abstract.TranslatingComponent);