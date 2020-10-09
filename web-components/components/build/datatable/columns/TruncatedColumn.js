'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TruncatedColumn = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _basic = require('../../basic');

var _Column2 = require('./Column');

var _SimpleTextFormatter = require('../formatters/text/SimpleTextFormatter');

var _TruncatedFieldReader = require('../readers/TruncatedFieldReader');

var _SimplePrinter = require('../printers/SimplePrinter');

var _TextFilter = require('../filters/TextFilter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TruncatedColumn = exports.TruncatedColumn = function (_Column) {
    _inherits(TruncatedColumn, _Column);

    function TruncatedColumn(props) {
        _classCallCheck(this, TruncatedColumn);

        var _this = _possibleConstructorReturn(this, (TruncatedColumn.__proto__ || Object.getPrototypeOf(TruncatedColumn)).call(this, props));

        _this.formatter = props.formatter;
        if (!_this.formatter) {
            _this.formatter = new _SimpleTextFormatter.SimpleTextFormatter();
        }
        _this.reader = props.reader;
        if (!_this.reader) {
            _this.reader = new _TruncatedFieldReader.TruncatedFieldReader(props.field, props.wordCount);
        }
        _this.printer = props.printer;
        if (!_this.printer) {
            _this.printer = new _SimplePrinter.SimplePrinter();
        }

        _this.defaultEditComponent = _react2.default.createElement(_basic.TextInput, null);
        _this.defaultFilterComponent = _react2.default.createElement(_TextFilter.TextFilter, null);

        return _this;
    }

    return TruncatedColumn;
}(_Column2.Column);