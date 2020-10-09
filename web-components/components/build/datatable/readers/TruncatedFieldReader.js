'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TruncatedFieldReader = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TruncatedFieldReader = exports.TruncatedFieldReader = function () {
    function TruncatedFieldReader(field, wordCount) {
        _classCallCheck(this, TruncatedFieldReader);

        this.field = field;
        this.wordCount = wordCount || 3;
    }

    _createClass(TruncatedFieldReader, [{
        key: 'readCellValue',
        value: function readCellValue(rowData) {
            var data = _lodash2.default.get(rowData, this.field);
            return this.truncate(data);
        }
    }, {
        key: 'readSortValue',
        value: function readSortValue(rowData) {
            return this.readCellValue(rowData);
        }
    }, {
        key: 'truncate',
        value: function truncate(str) {
            var split = str.split(" ");
            return split.splice(0, this.wordCount).join(" ") + (split.length > this.wordCount ? "..." : "");
        }
    }]);

    return TruncatedFieldReader;
}();