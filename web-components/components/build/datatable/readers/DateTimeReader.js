'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DateTimeReader = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DateTimeReader = exports.DateTimeReader = function () {
    function DateTimeReader(field, pattern) {
        _classCallCheck(this, DateTimeReader);

        this.field = field;
        this.pattern = pattern;
        this.moment = require('moment');
        require('moment-timezone');
    }

    _createClass(DateTimeReader, [{
        key: 'readCellValue',
        value: function readCellValue(rowData) {
            return _lodash2.default.get(rowData, this.field);
        }
    }, {
        key: 'readSortValue',
        value: function readSortValue(rowData) {
            var value = this.readCellValue(rowData);
            if (!value) {
                return "";
            }

            var _value$trim$split = value.trim().split(" "),
                _value$trim$split2 = _slicedToArray(_value$trim$split, 3),
                date = _value$trim$split2[0],
                time = _value$trim$split2[1],
                zone = _value$trim$split2[2];

            var tz = _lodash2.default.defaultTo(zone, "UTC");
            var dt = date + " " + time;
            return this.moment.tz(dt, this.pattern, tz).tz("UTC").format("X");
        }
    }]);

    return DateTimeReader;
}();