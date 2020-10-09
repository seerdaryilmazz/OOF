'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SelectedCompanyList = exports.MultipleCompanySelector = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _abstract = require('../abstract');

var _layout = require('../layout');

var _basic = require('../basic');

var _RenderingComponent = require('./RenderingComponent');

var _CompanySearchAutoComplete = require('./CompanySearchAutoComplete');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MultipleCompanySelector = exports.MultipleCompanySelector = function (_TranslatingComponent) {
    _inherits(MultipleCompanySelector, _TranslatingComponent);

    function MultipleCompanySelector(props) {
        _classCallCheck(this, MultipleCompanySelector);

        var _this = _possibleConstructorReturn(this, (MultipleCompanySelector.__proto__ || Object.getPrototypeOf(MultipleCompanySelector)).call(this, props));

        _this.state = { label: "" };

        if (props.data) {
            _this.state.selectedCompanies = props.data;
        } else {
            _this.state.selectedCompanies = [];
        }
        if (props.label) {
            _this.state.label = props.label;
        }
        return _this;
    }

    _createClass(MultipleCompanySelector, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {

            if (nextProps.data) {
                this.state.selectedCompanies = this.validateArray(nextProps.data);
            }
            this.setState(this.state);
        }
    }, {
        key: 'validateArray',
        value: function validateArray(data) {
            if (!Array.isArray(data)) {
                var array = [];
                array.push(data);
                return array;
            }

            return data;
        }
    }, {
        key: 'autoCompleteValueSelected',
        value: function autoCompleteValueSelected(selected) {

            if (selected && selected.id) {
                selected.code = selected.id;
            }

            this.state.selectedCompanies.push(selected);

            this.props.handleDataUpdate(this.state.selectedCompanies);

            this.setState(this.state);
        }
    }, {
        key: 'handleDeleteSelectedCompany',
        value: function handleDeleteSelectedCompany(id) {

            var elemIndex = -1;

            this.state.selectedCompanies.forEach(function (s, i) {
                if (s.id == id) {
                    elemIndex = i;
                }
            });

            if (elemIndex > -1) {
                this.state.selectedCompanies.splice(elemIndex, 1);
            }

            this.props.handleDataUpdate(this.state.selectedCompanies);

            this.setState(this.state);
        }
    }, {
        key: 'renderStandard',
        value: function renderStandard() {
            var _this2 = this;

            return _react2.default.createElement(
                _layout.Grid,
                null,
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-1' },
                    _react2.default.createElement(
                        'div',
                        { className: 'uk-form-row' },
                        _react2.default.createElement(
                            'div',
                            { className: 'md-input-wrapper md-input-filled' },
                            _react2.default.createElement(
                                'label',
                                null,
                                this.state.label
                            )
                        )
                    )
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-1' },
                    _react2.default.createElement(SelectedCompanyList, { data: this.state.selectedCompanies,
                        deleteNodeHandler: function deleteNodeHandler(id) {
                            return _this2.handleDeleteSelectedCompany(id);
                        },
                        readOnly: this.props.readOnly })
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { noMargin: true, width: '1-1' },
                    _react2.default.createElement(_CompanySearchAutoComplete.CompanySearchAutoComplete, {
                        value: null,
                        onchange: function onchange(value) {
                            _this2.autoCompleteValueSelected(value);
                        } })
                )
            );
        }
    }, {
        key: 'renderReadOnly',
        value: function renderReadOnly() {
            var _this3 = this;

            return _react2.default.createElement(
                _layout.Grid,
                null,
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-1' },
                    _react2.default.createElement(
                        'div',
                        { className: 'uk-form-row' },
                        _react2.default.createElement(
                            'div',
                            { className: 'md-input-wrapper md-input-filled' },
                            _react2.default.createElement(
                                'label',
                                null,
                                this.state.label
                            )
                        )
                    )
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-1' },
                    _react2.default.createElement(SelectedCompanyList, { data: this.state.selectedCompanies,
                        deleteNodeHandler: function deleteNodeHandler(id) {
                            return _this3.handleDeleteSelectedCompany(id);
                        },
                        readOnly: this.props.readOnly })
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            return _RenderingComponent.RenderingComponent.render(this);
        }
    }]);

    return MultipleCompanySelector;
}(_abstract.TranslatingComponent);

var SelectedCompanyList = exports.SelectedCompanyList = function (_React$Component) {
    _inherits(SelectedCompanyList, _React$Component);

    function SelectedCompanyList(props) {
        _classCallCheck(this, SelectedCompanyList);

        var _this4 = _possibleConstructorReturn(this, (SelectedCompanyList.__proto__ || Object.getPrototypeOf(SelectedCompanyList)).call(this, props));

        _this4.state = {};

        return _this4;
    }

    _createClass(SelectedCompanyList, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.state.selectedElems = this.props.data;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {

            this.state.selectedElems = nextProps.data;
            this.setState(this.state);
        }
    }, {
        key: 'renderStandard',
        value: function renderStandard() {
            var _this5 = this;

            if (!this.state.selectedElems) {
                return null;
            }

            return _react2.default.createElement(
                _layout.Grid,
                null,
                this.state.selectedElems.map(function (elem) {
                    return _react2.default.createElement(
                        _layout.GridCell,
                        { key: elem.id, width: '1-1', noMargin: true },
                        _react2.default.createElement(
                            'div',
                            { style: { float: 'left' } },
                            _react2.default.createElement(
                                'span',
                                { className: 'uk-text-small uk-text-muted' },
                                elem.name
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { style: { float: 'right' } },
                            _react2.default.createElement('i', { onClick: function onClick(e) {
                                    return _this5.props.deleteNodeHandler(elem.id);
                                },
                                className: 'sm-icon uk-icon-times' })
                        )
                    );
                })
            );
        }
    }, {
        key: 'renderReadOnly',
        value: function renderReadOnly() {

            if (!this.state.selectedElems) {
                return null;
            }

            return _react2.default.createElement(
                _layout.Grid,
                null,
                this.state.selectedElems.map(function (elem) {
                    return _react2.default.createElement(
                        _layout.GridCell,
                        { key: elem.id, width: '1-1', noMargin: true },
                        elem.name
                    );
                })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            return _RenderingComponent.RenderingComponent.render(this);
        }
    }]);

    return SelectedCompanyList;
}(_react2.default.Component);

MultipleCompanySelector.contextTypes = {
    translator: _propTypes2.default.object
};