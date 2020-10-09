'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CompanyOrCustomsLocationSearchAutoComplete = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var axios = _interopRequireWildcard(_axios);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _abstract = require('../abstract');

var _basic = require('../basic');

var _Span = require('../basic/Span');

var _layout = require('../layout');

var _CompanySearchAutoComplete = require('./CompanySearchAutoComplete');

var _RenderingComponent = require('./RenderingComponent');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CompanyOrCustomsLocationSearchAutoComplete = exports.CompanyOrCustomsLocationSearchAutoComplete = function (_TranslatingComponent) {
    _inherits(CompanyOrCustomsLocationSearchAutoComplete, _TranslatingComponent);

    function CompanyOrCustomsLocationSearchAutoComplete(props) {
        _classCallCheck(this, CompanyOrCustomsLocationSearchAutoComplete);

        var _this = _possibleConstructorReturn(this, (CompanyOrCustomsLocationSearchAutoComplete.__proto__ || Object.getPrototypeOf(CompanyOrCustomsLocationSearchAutoComplete)).call(this, props));

        var id = _this.props.id ? _this.props.id : _uuid2.default.v4();
        _this.state = { id: id };
        return _this;
    }

    _createClass(CompanyOrCustomsLocationSearchAutoComplete, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            if (this.props.value && this.props.value.company) {
                this.loadLocations(this.props.value.company, function (locations) {
                    var value = _lodash2.default.clone(_this2.props.value);
                    if (!value.location && locations && locations.length === 1 && !_this2.props.disableLocationAutoSelect) {
                        value.location = locations[0];
                        _this2.props.onChange(value);
                    }
                    _this2.setState({ locations: locations });
                });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this3 = this;

            var currentCompanyId = _lodash2.default.get(this.props, "value.company.id");
            var newCompanyId = _lodash2.default.get(nextProps, "value.company.id");
            if (currentCompanyId !== newCompanyId && _lodash2.default.has(nextProps, 'value.company.id')) {
                this.loadLocations(nextProps.value.company, function (locations) {
                    var value = _lodash2.default.clone(nextProps.value);
                    if (!value.location && locations && locations.length === 1 && !_this3.props.disableLocationAutoSelect) {
                        value.location = locations[0];
                        _this3.props.onChange(value);
                    }
                    _this3.setState({ locations: locations });
                });
            }
        }
    }, {
        key: 'loadLocations',
        value: function loadLocations(company, onSuccess) {
            var call = function call(val) {
                return axios.get('/kartoteks-service/company/' + val + '/locations');
            };
            if ("CUSTOMS" === company.type) {
                call = function call(val) {
                    return axios.get('/location-service/location/customs-office/' + val + '/locations');
                };
            }
            call(company.id).then(function (response) {
                onSuccess(response.data);
            }).catch(function (error) {
                _basic.Notify.showError(error);
            });
        }
    }, {
        key: 'handleCompanyOnChange',
        value: function handleCompanyOnChange(company) {
            var _this4 = this;

            this.loadLocations(company, function (data) {
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
        key: 'handleLocationOnChange',
        value: function handleLocationOnChange(item) {
            if (this.props.onChange) {
                var value = _lodash2.default.cloneDeep(this.props.value);
                value.location = item;
                this.props.onChange(value);
            }
        }
    }, {
        key: 'handleCompanyOnClear',
        value: function handleCompanyOnClear() {
            this.props.onChange && this.props.onChange({ company: null, location: null });
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
                    _react2.default.createElement(_CompanySearchAutoComplete.CompanySearchAutoComplete, { id: this.state.id, label: this.props.companyLabel,
                        value: this.props.value ? this.props.value.company : null,
                        sources: this.props.sources,
                        readOnly: this.props.readOnly,
                        onchange: function onchange(item) {
                            return _this6.handleCompanyOnChange(item);
                        },
                        onclear: function onclear() {
                            return _this6.handleCompanyOnClear();
                        },
                        flipDropdown: this.props.flipDropdown,
                        hideLabel: this.props.hideLabel,
                        required: this.props.required, placeholder: 'Search for company...' })
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

    return CompanyOrCustomsLocationSearchAutoComplete;
}(_abstract.TranslatingComponent);

CompanyOrCustomsLocationSearchAutoComplete.contextTypes = {
    translator: _react2.default.PropTypes.object
};