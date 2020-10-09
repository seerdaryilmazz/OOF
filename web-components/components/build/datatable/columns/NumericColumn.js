'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NumericColumn = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _advanced = require('../../advanced');

var _Column2 = require('./Column');

var _SimpleNumericFormatter = require('../formatters/numeric/SimpleNumericFormatter');

var _SimpleFieldReader = require('../readers/SimpleFieldReader');

var _NumberPrinter = require('../printers/NumberPrinter');

var _NumericFilter = require('../filters/NumericFilter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NumericColumn = exports.NumericColumn = function (_Column) {
    _inherits(NumericColumn, _Column);

    function NumericColumn(props) {
        _classCallCheck(this, NumericColumn);

        var _this = _possibleConstructorReturn(this, (NumericColumn.__proto__ || Object.getPrototypeOf(NumericColumn)).call(this, props));

        _this.formatter = props.formatter;
        if (!_this.formatter) {
            _this.formatter = new _SimpleNumericFormatter.SimpleNumericFormatter();
        }
        _this.reader = props.reader;
        if (!_this.reader) {
            _this.reader = new _SimpleFieldReader.SimpleFieldReader(props.field);
        }
        _this.printer = props.printer;
        if (!_this.printer) {
            _this.printer = new _NumberPrinter.NumberPrinter(props.numberOfDecimalDigits);
        }

        _this.defaultEditComponent = _react2.default.createElement(_advanced.NumericInput, { digits: '2', digitsOptional: true });
        _this.defaultFilterComponent = _react2.default.createElement(_NumericFilter.NumericFilter, null);

        return _this;
    }

    return NumericColumn;
}(_Column2.Column);