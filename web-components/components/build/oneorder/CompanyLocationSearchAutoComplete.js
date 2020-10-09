'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CompanyLocationSearchAutoComplete = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _layout = require('../layout');

var _advanced = require('../advanced');

var _basic = require('../basic');

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _axios = require('axios');

var axios = _interopRequireWildcard(_axios);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _RenderingComponent = require('./RenderingComponent');

var _Span = require('../basic/Span');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CompanyLocationSearchAutoComplete = exports.CompanyLocationSearchAutoComplete = function (_React$Component) {
    _inherits(CompanyLocationSearchAutoComplete, _React$Component);

    function CompanyLocationSearchAutoComplete(props) {
        _classCallCheck(this, CompanyLocationSearchAutoComplete);

        var _this = _possibleConstructorReturn(this, (CompanyLocationSearchAutoComplete.__proto__ || Object.getPrototypeOf(CompanyLocationSearchAutoComplete)).call(this, props));

        _this.autocompleteCallback = function (release, val) {
            axios.get('/kartoteks-service/search?q=' + val).then(function (response) {
                release(response.data.content.map(function (company) {
                    return { id: company.id, name: company.name, locations: company.locations };
                }));
            }).catch(function (error) {
                _basic.Notify.showError(error);
            });
        };

        var id = _this.props.id ? _this.props.id : _uuid2.default.v4();
        _this.state = { id: id };
        return _this;
    }

    _createClass(CompanyLocationSearchAutoComplete, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            if (this.props.value && this.props.value.company) {
                this.loadLocations(this.props.value.company.id, function (data) {
                    return _this2.setState({ locations: data });
                });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this3 = this;

            var currentCompanyId = _lodash2.default.get(this.props, "value.company.id");
            var newCompanyId = _lodash2.default.get(nextProps, "value.company.id");
            if (currentCompanyId !== newCompanyId) {
                this.loadLocations(newCompanyId, function (data) {
                    return _this3.setState({ locations: data });
                });
            }
        }
    }, {
        key: 'handleCompanyOnChange',
        value: function handleCompanyOnChange(company) {
            var _this4 = this;

            this.loadLocations(company.id, function (data) {
                var locations = data;
                var value = { company: company, location: null };
                if (locations && locations.length === 1 && !_this4.props.disableLocationAutoSelect) {
                    value.location = locations[0];
                }
                _this4.setState({ locations: locations }, function () {
                    return _this4.props.onChange(value);
                });
            });
        }
    }, {
        key: 'loadLocations',
        value: function loadLocations(companyId, onSuccess) {
            axios.get('/kartoteks-service/company/' + companyId + '/locations').then(function (response) {
                onSuccess(response.data);
            }).catch(function (error) {
                _basic.Notify.showError(error);
            });
        }
    }, {
        key: 'handleCompanyOnClear',
        value: function handleCompanyOnClear() {
            this.props.onChange({ company: null, location: null });
        }
    }, {
        key: 'handleLocationOnChange',
        value: function handleLocationOnChange(item) {
            var value = _lodash2.default.cloneDeep(this.props.value);
            value.location = item;
            this.props.onChange(value);
        }
    }, {
        key: 'renderRegistrationCompanyLocationSelectionDropdown',
        value: function renderRegistrationCompanyLocationSelectionDropdown() {
            var _this5 = this;

            if (!this.props || !this.props.value) {
                return null;
            }

            return _react2.default.createElement(_basic.DropDown, { label: this.props.locationLabel,
                uninitializedText: 'Please select company',
                options: this.state.locations,
                value: this.props.value ? this.props.value.location : null,
                onchange: function onchange(data) {
                    return _this5.handleLocationOnChange(data);
                },
                hideLabel: this.props.hideLabel,
                required: this.props.required });
        }
    }, {
        key: 'renderReadOnly',
        value: function renderReadOnly() {
            var width = "1-1";
            if (this.props.inline) {
                width = "1-2";
            }

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    _layout.Grid,
                    null,
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: width },
                        _react2.default.createElement(_Span.Span, { label: this.props.companyLabel, value: this.props.value && this.props.value.company ? this.props.value.company.name : "" })
                    )
                ),
                _react2.default.createElement(
                    _layout.Grid,
                    null,
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: width },
                        _react2.default.createElement(_Span.Span, { label: this.props.locationLabel, value: this.props.value && this.props.value.location ? this.props.value.location.name : "" })
                    )
                )
            );
        }
    }, {
        key: 'renderStandard',
        value: function renderStandard() {
            var _this6 = this;

            var width = "1-1";
            if (this.props.inline) {
                width = "1-2";
            }
            return _react2.default.createElement(
                _layout.Grid,
                null,
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: width },
                    _react2.default.createElement(_advanced.AutoComplete, { id: this.state.id, label: this.props.companyLabel, valueField: 'id', labelField: 'name',
                        readOnly: this.props.readOnly,
                        onchange: function onchange(item) {
                            return _this6.handleCompanyOnChange(item);
                        },
                        onclear: function onclear() {
                            return _this6.handleCompanyOnClear();
                        },
                        callback: this.autocompleteCallback, value: this.props.value ? this.props.value.company : null,
                        flipDropdown: this.props.flipDropdown,
                        hideLabel: this.props.hideLabel,
                        required: this.props.required, placeholder: 'Search for company...',
                        ukIcon: this.props.ukIcon,
                        iconColorClass: this.props.iconColorClass })
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: width },
                    this.renderRegistrationCompanyLocationSelectionDropdown()
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            return _RenderingComponent.RenderingComponent.render(this);
        }
    }]);

    return CompanyLocationSearchAutoComplete;
}(_react2.default.Component);