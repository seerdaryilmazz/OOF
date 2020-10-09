'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DateColumn = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _advanced = require('../../advanced');

var _Column2 = require('./Column');

var _DateFormatter = require('../formatters/datetime/DateFormatter');

var _DateReader = require('../readers/DateReader');

var _SimplePrinter = require('../printers/SimplePrinter');

var _DateFilter = require('../filters/DateFilter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DateColumn = exports.DateColumn = function (_Column) {
    _inherits(DateColumn, _Column);

    function DateColumn(props) {
        _classCallCheck(this, DateColumn);

        var _this = _possibleConstructorReturn(this, (DateColumn.__proto__ || Object.getPrototypeOf(DateColumn)).call(this, props));

        _this.formatter = props.formatter;
        if (!_this.formatter) {
            _this.formatter = new _DateFormatter.DateFormatter("DD/MM/YYYY");
        }
        _this.reader = props.reader;
        if (!_this.reader) {
            _this.reader = new _DateReader.DateReader(props.field, "DD/MM/YYYY");
        }
        _this.printer = props.printer;
        if (!_this.printer) {
            _this.printer = new _SimplePrinter.SimplePrinter();
        }

        _this.defaultEditComponent = _react2.default.createElement(_advanced.Date, null);
        _this.defaultFilterComponent = _react2.default.createElement(_DateFilter.DateFilter, null);
        return _this;
    }

    return DateColumn;
}(_Column2.Column);