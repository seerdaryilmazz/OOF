"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MultipleCompanyLocationSelector = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _abstract = require("../abstract");

var _layout = require("../layout");

var _basic = require("../basic");

var _CompanyLocationSearchAutoComplete = require("./CompanyLocationSearchAutoComplete");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MultipleCompanyLocationSelector = exports.MultipleCompanyLocationSelector = function (_TranslatingComponent) {
    _inherits(MultipleCompanyLocationSelector, _TranslatingComponent);

    function MultipleCompanyLocationSelector(props) {
        _classCallCheck(this, MultipleCompanyLocationSelector);

        var _this = _possibleConstructorReturn(this, (MultipleCompanyLocationSelector.__proto__ || Object.getPrototypeOf(MultipleCompanyLocationSelector)).call(this, props));

        _this.state = { data: [] };
        return _this;
    }

    _createClass(MultipleCompanyLocationSelector, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.initialize(this.props);
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            this.initialize(nextProps);
        }
    }, {
        key: "initialize",
        value: function initialize(props) {
            var data = [];
            var company = this.state.value ? this.state.value.company : null;
            var location = this.state.value ? this.state.value.location : null;

            var _company = this.state._company;
            var _location = this.state._location;

            if (props.data) {
                data = _lodash2.default.cloneDeep(props.data);
            }

            if (props.company) {
                if (!_company || _company.id != props.company.id) {
                    company = props.company;
                    _company = props.company;
                }
            } else if (_company) {
                company = null;
                _company = null;
            }

            if (props.location) {
                if (!_location || _location.id != props.location.id) {
                    location = props.location;
                    _location = props.location;
                }
            } else if (_location) {
                location = null;
                _location = null;
            }

            data.forEach(function (d) {
                if (!d._guiKey) {
                    d._guiKey = _uuid2.default.v4();
                }
            });

            this.setState({
                data: data,
                company: company,
                location: location,
                _company: _company,
                _location: _location
            });
        }
    }, {
        key: "handleCompanyLocationAdd",
        value: function handleCompanyLocationAdd() {
            var _this2 = this;

            var data = this.state.data;

            var company = this.state.value ? this.state.value.company : null;
            var location = this.state.value ? this.state.value.location : null;

            if (!company) {
                _basic.Notify.showError("Company is not selected");
                return;
            }

            if (!location) {
                _basic.Notify.showError("Location is not selected");
                return;
            }

            var alreadyExist = false;
            data.forEach(function (d) {
                if (d.company.id == company.id && d.location.id == location.id) {
                    alreadyExist = true;
                }
            });

            if (alreadyExist) {
                _basic.Notify.showError("Company and Location is already selected");
                return;
            }

            var newElem = {};
            newElem._guiKey = _uuid2.default.v4();
            newElem.company = company;
            newElem.location = location;

            data.push(newElem);

            this.setState({ data: data, value: { company: null, location: null } }, function () {
                _this2.props.onUpdate(data);
            });
        }
    }, {
        key: "handleCompanyLocationDelete",
        value: function handleCompanyLocationDelete(item) {
            var _this3 = this;

            var data = this.state.data;

            var elemIndex = data.findIndex(function (e) {
                return e._guiKey == item._guiKey;
            });
            if (elemIndex < 0) return false;
            data.splice(elemIndex, 1);

            this.setState({ data: data }, function () {
                _this3.props.onUpdate(data);
            });
        }
    }, {
        key: "handleSelectItem",
        value: function handleSelectItem(e, item, index) {
            e.preventDefault();
            this.setState({ value: { company: item.company, location: item.location } });
        }
    }, {
        key: "renderItemList",
        value: function renderItemList(item, index) {
            var _this4 = this;

            return _react2.default.createElement(
                "li",
                { key: item.company.id + item.location.id },
                _react2.default.createElement(
                    "div",
                    { className: "md-list-content" },
                    _react2.default.createElement(
                        "div",
                        { className: "uk-align-left" },
                        _react2.default.createElement(
                            "div",
                            { className: "md-list-heading" },
                            _react2.default.createElement(
                                "a",
                                { href: "#", className: "uk-text-break", style: { width: "90%" },
                                    onClick: function onClick(e) {
                                        return _this4.handleSelectItem(e, item, index);
                                    } },
                                item.company.name
                            )
                        ),
                        _react2.default.createElement(
                            "div",
                            { className: "uk-text-small uk-text-muted uk-text-break", style: { width: "90%" } },
                            item.location.name
                        )
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "uk-align-right" },
                        _react2.default.createElement(_basic.Button, { label: "delete", flat: true, style: "danger", size: "small", waves: true,
                            onclick: function onclick(e) {
                                return _this4.handleCompanyLocationDelete(item);
                            } })
                    )
                )
            );
        }
    }, {
        key: "renderList",
        value: function renderList() {
            var _this5 = this;

            var list = _react2.default.createElement(
                "div",
                null,
                _get(MultipleCompanyLocationSelector.prototype.__proto__ || Object.getPrototypeOf(MultipleCompanyLocationSelector.prototype), "translate", this).call(this, "There are no locations")
            );
            if (this.state.data && this.state.data.length > 0) {
                list = _react2.default.createElement(
                    "ul",
                    { className: "md-list md-list-centered" },
                    this.state.data.map(function (item, index) {
                        return _this5.renderItemList(item, index);
                    })
                );
            }

            return list;
        }
    }, {
        key: "render",
        value: function render() {
            var _this6 = this;

            var companyCellWidth = "1-1";
            var buttonCellWidth = "1-1";

            if (this.props.inline) {
                companyCellWidth = "9-10";
                buttonCellWidth = "1-10";
            }

            return _react2.default.createElement(
                _layout.Grid,
                null,
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: companyCellWidth, noMargin: true },
                    _react2.default.createElement(_CompanyLocationSearchAutoComplete.CompanyLocationSearchAutoComplete, { inline: this.props.inline,
                        companyLabel: this.props.companyLabel, locationLabel: this.props.locationLabel,
                        value: this.state.value,
                        onChange: function onChange(value) {
                            return _this6.setState({ value: value });
                        } })
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: buttonCellWidth },
                    _react2.default.createElement(_basic.Button, { label: "Add", onclick: function onclick() {
                            _this6.handleCompanyLocationAdd();
                        } })
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: "1-1" },
                    _react2.default.createElement(
                        "ul",
                        { className: "md-list" },
                        this.renderList()
                    )
                )
            );
        }
    }]);

    return MultipleCompanyLocationSelector;
}(_abstract.TranslatingComponent);