'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AdvancedTextFilter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _basic = require('../../basic');

var _layout = require('../../layout');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AdvancedTextFilter = exports.AdvancedTextFilter = function (_React$Component) {
    _inherits(AdvancedTextFilter, _React$Component);

    function AdvancedTextFilter(props) {
        _classCallCheck(this, AdvancedTextFilter);

        var _this = _possibleConstructorReturn(this, (AdvancedTextFilter.__proto__ || Object.getPrototypeOf(AdvancedTextFilter)).call(this, props));

        _this.state = { filter: {} };
        return _this;
    }

    _createClass(AdvancedTextFilter, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {}
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps() {}
    }, {
        key: 'handleAdvancedClick',
        value: function handleAdvancedClick(e) {
            e.preventDefault();
            this.modal.open();
        }
    }, {
        key: 'handleClose',
        value: function handleClose() {
            this.modal.close();
        }
    }, {
        key: 'handleApply',
        value: function handleApply() {
            this.apply(this.state.filter);
            this.handleClose();
        }
    }, {
        key: 'apply',
        value: function apply(filter) {
            this.props.onchange && this.props.onchange(filter.text);
        }
    }, {
        key: 'handleChangeAndApply',
        value: function handleChangeAndApply(field, value) {
            var filter = this.handleChange(field, value);
            this.apply(filter);
        }
    }, {
        key: 'handleChange',
        value: function handleChange(field, value) {
            var filter = _lodash2.default.cloneDeep(this.state.filter);
            filter[field] = value;
            this.setState({ filter: filter });
            return filter;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                _layout.Grid,
                { collapse: true, noMargin: true },
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '3-4', noMargin: true },
                    _react2.default.createElement(_basic.TextInput, { onchange: function onchange(value) {
                            return _this2.handleChangeAndApply("text", value);
                        }, value: this.state.filter.text })
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-4', noMargin: true },
                    _react2.default.createElement(
                        'a',
                        { href: '#', onClick: function onClick(e) {
                                return _this2.handleAdvancedClick(e);
                            } },
                        _react2.default.createElement('i', { className: 'uk-icon-external-link' }),
                        ' '
                    )
                ),
                _react2.default.createElement(
                    _layout.Modal,
                    { ref: function ref(c) {
                            return _this2.modal = c;
                        }, title: 'Text Filter',
                        actions: [{ label: "Close", action: function action() {
                                return _this2.handleClose();
                            } }, { label: "Apply", action: function action() {
                                return _this2.handleApply();
                            } }] },
                    _react2.default.createElement(_basic.DropDown, { options: [{ id: "startsWith", name: "Starts With" }, { id: "matchAny", name: "Match Any" }], value: this.state.filter.type, onchange: function onchange(value) {
                            return _this2.handleChange("type", value);
                        } }),
                    _react2.default.createElement(_basic.TextInput, { onchange: function onchange(value) {
                            return _this2.handleChange("text", value);
                        }, value: this.state.filter.text })
                )
            );
        }
    }]);

    return AdvancedTextFilter;
}(_react2.default.Component);