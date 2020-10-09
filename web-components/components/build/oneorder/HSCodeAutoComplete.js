'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HSCodeAutoComplete = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _advanced = require('../advanced');

var _axios = require('axios');

var axios = _interopRequireWildcard(_axios);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HSCodeAutoComplete = exports.HSCodeAutoComplete = function (_React$Component) {
    _inherits(HSCodeAutoComplete, _React$Component);

    function HSCodeAutoComplete(props) {
        _classCallCheck(this, HSCodeAutoComplete);

        var _this = _possibleConstructorReturn(this, (HSCodeAutoComplete.__proto__ || Object.getPrototypeOf(HSCodeAutoComplete)).call(this, props));

        _this.autocompleteCallback = function (val) {
            return new Promise(function (resolve, reject) {
                axios.get('/order-service/search/hscode', { params: { q: val } }).then(function (response) {
                    var data = response.data.content.map(function (item) {
                        var parent1 = item.parents && item.parents.length > 0 ? item.parents[0] : "";
                        var parent2 = item.parents && item.parents.length > 1 ? item.parents[1] : "";
                        return { id: item.id, name: item.name, code: item.code, parent1: parent1, parent2: parent2, data: item };
                    });
                    resolve({ data: data });
                }).catch(function (error) {
                    console.log(error);
                    reject();
                });
            });
        };

        _this.state = {};
        _this.template = '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}} ' + '<li data-id="{{ $item.id}}" data-name="{{ $item.name}}" data-value="{{ $item.code}} {{ $item.name}}"> ' + '<a href="javascript:void()">' + '<div style="font-weight: bold">{{ $item.code}}</div>' + '<div class="md-color-blue-500">{{ $item.name}}</div>' + '<div class="uk-text-small uk-text-muted uk-text-truncate">{{ $item.parent1}}</div>' + '<div class="uk-text-small uk-text-muted uk-text-truncate">{{ $item.parent2}}</div>' + '</a>' + '</li>{{/items}} </ul>';
        return _this;
    }

    _createClass(HSCodeAutoComplete, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'render',
        value: function render() {

            return _react2.default.createElement(_advanced.AutoComplete, { label: this.props.label, valueField: 'id', labelField: 'name',
                value: this.props.value,
                promise: this.autocompleteCallback,
                onchange: this.props.onchange,
                hideLabel: this.props.hideLabel,
                flipDropdown: this.props.flipDropdown,
                required: this.props.required, placeholder: 'Search for HS Code...',
                ukIcon: this.props.ukIcon,
                template: this.template,
                iconColorClass: this.props.iconColorClass });
        }
    }]);

    return HSCodeAutoComplete;
}(_react2.default.Component);