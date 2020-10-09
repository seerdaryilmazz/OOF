'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DateTimeColumn = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _advanced = require('../../advanced');

var _Column2 = require('./Column');

var _DateTimeFormatter = require('../formatters/datetime/DateTimeFormatter');

var _DateTimeReader = require('../readers/DateTimeReader');

var _SimplePrinter = require('../printers/SimplePrinter');

var _DateTimeFilter = require('../filters/DateTimeFilter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DateTimeColumn = exports.DateTimeColumn = function (_Column) {
    _inherits(DateTimeColumn, _Column);

    function DateTimeColumn(props) {
        _classCallCheck(this, DateTimeColumn);

        var _this = _possibleConstructorReturn(this, (DateTimeColumn.__proto__ || Object.getPrototypeOf(DateTimeColumn)).call(this, props));

        _this.formatter = props.formatter;
        if (!_this.formatter) {
            _this.formatter = new _DateTimeFormatter.DateTimeFormatter("DD/MM/YYYY HH:mm");
        }
        _this.reader = props.reader;
        if (!_this.reader) {
            _this.reader = new _DateTimeReader.DateTimeReader(props.field, "DD/MM/YYYY HH:mm");
        }
        _this.printer = props.printer;
        if (!_this.printer) {
            _this.printer = new _SimplePrinter.SimplePrinter();
        }

        _this.defaultEditComponent = _react2.default.createElement(_advanced.DateTime, null);
        _this.defaultFilterComponent = _react2.default.createElement(_DateTimeFilter.DateTimeFilter, null);
        return _this;
    }

    return DateTimeColumn;
}(_Column2.Column);