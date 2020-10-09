'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CompanySearchAutoComplete = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _axios = require('axios');

var axios = _interopRequireWildcard(_axios);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _abstract = require('../abstract');

var _advanced = require('../advanced');

var _basic = require('../basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var services = {
    COMPANY: {
        className: "md-bg-light-blue-600",
        label: "Company",
        callback: function callback(val) {
            return axios.get('/kartoteks-service/search', { params: { q: val, size: 25 } });
        }
    },
    CUSTOMS: {
        className: "md-bg-light-green-600",
        label: "Customs",
        callback: function callback(val) {
            return axios.get('/search-service/search/customs-office', { params: { q: val } });
        }
    }
};

var CompanySearchAutoComplete = exports.CompanySearchAutoComplete = function (_TranslatingComponent) {
    _inherits(CompanySearchAutoComplete, _TranslatingComponent);

    function CompanySearchAutoComplete(props) {
        _classCallCheck(this, CompanySearchAutoComplete);

        var _this = _possibleConstructorReturn(this, (CompanySearchAutoComplete.__proto__ || Object.getPrototypeOf(CompanySearchAutoComplete)).call(this, props));

        _this.autocompleteCallback = function (release, val) {
            var calls = [];
            if (_.isEmpty(_this.props.sources)) {
                calls.push(services.COMPANY.callback(val));
            } else {
                var _loop = function _loop(key) {
                    if (_.find(_this.props.sources, function (i) {
                        return _.isEqual(i, key);
                    })) {
                        calls.push(_.get(services, key).callback(val));
                    }
                };

                for (var key in services) {
                    _loop(key);
                }
            }

            axios.all(calls).then(axios.spread(function (company, customsOffice) {
                var results = [];
                if (company) {
                    company.data.content.forEach(function (item) {
                        results.push({
                            id: item.id,
                            name: item.name,
                            new: "",
                            display: "",
                            shortName: item.shortName,
                            type: {
                                code: 'COMPANY',
                                label: _get(CompanySearchAutoComplete.prototype.__proto__ || Object.getPrototypeOf(CompanySearchAutoComplete.prototype), 'translate', _this).call(_this, services['COMPANY'].label),
                                className: services['COMPANY'].className
                            }
                        });
                    });
                }
                if (customsOffice) {
                    customsOffice.data.content.forEach(function (item) {
                        results.push({
                            id: item.id,
                            name: item.name,
                            display: "",
                            shortName: item.shortName,
                            type: {
                                code: 'CUSTOMS',
                                label: _get(CompanySearchAutoComplete.prototype.__proto__ || Object.getPrototypeOf(CompanySearchAutoComplete.prototype), 'translate', _this).call(_this, services['CUSTOMS'].label),
                                className: services['CUSTOMS'].className
                            }
                        });
                    });
                }
                if (_this.props.onAddNew) {
                    results.push({
                        id: -1,
                        name: "",
                        new: _get(CompanySearchAutoComplete.prototype.__proto__ || Object.getPrototypeOf(CompanySearchAutoComplete.prototype), 'translate', _this).call(_this, "Add New"),
                        display: "none",
                        type: {
                            label: "",
                            className: ""
                        }
                    });
                }
                release(results);
            })).catch(function (error) {
                _basic.Notify.showError(error);
            });
        };

        var id = _this.props.id ? _this.props.id : _uuid2.default.v4();
        _this.state = { id: id };
        _this.buildTemplate();
        return _this;
    }

    _createClass(CompanySearchAutoComplete, [{
        key: 'buildTemplate',
        value: function buildTemplate() {
            var name = this.props.showShortName ? "shortName" : "name";
            this.template = '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">' + '{{~items}} ' + '<li data-type="{{$item.type.code}}" data-value="{{ $item.' + name + ' }}" data-name="{{ $item.' + name + ' }}" data-id="{{ $item.id }}">' + '<a style="display:table; width:100%" tabindex="-1" href="javascript:void()">' + '<span style="display:table-cell">' + '{{ $item.' + name + ' }}' + '<span class="md-color-green-600">{{$item.new}}</span>' + '</span>' + '<span style="display:table-cell; float: right; margin-right: 24px">' + '<span class="uk-badge {{$item.type.className}}" style="display:{{$item.display}}">{{$item.type.label}}</span>' + '</span>' + '</a>' + '</li>' + '{{/items}}' + '</ul>';
        }
    }, {
        key: 'handleOnChange',
        value: function handleOnChange(item) {
            if (item.id !== -1) {
                this.props.onchange && this.props.onchange(item);
            } else {
                this.props.onchange && this.props.onchange(null);
                this.props.onAddNew && this.props.onAddNew();
            }
        }
    }, {
        key: 'handleOnClear',
        value: function handleOnClear() {
            this.props.onclear && this.props.onclear();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(_advanced.AutoComplete, { id: this.state.id, label: this.props.label,
                template: this.template,
                readOnly: this.props.readOnly,
                onchange: function onchange(item) {
                    return _this2.handleOnChange(item);
                },
                onclear: function onclear() {
                    return _this2.handleOnClear();
                },
                callback: this.autocompleteCallback, value: this.props.value,
                flipDropdown: this.props.flipDropdown,
                hideLabel: this.props.hideLabel,
                required: this.props.required, placeholder: 'Search for company...',
                ukIcon: this.props.ukIcon,
                iconColorClass: this.props.iconColorClass
            });
        }
    }]);

    return CompanySearchAutoComplete;
}(_abstract.TranslatingComponent);

CompanySearchAutoComplete.contextTypes = {
    translator: _propTypes2.default.object
};