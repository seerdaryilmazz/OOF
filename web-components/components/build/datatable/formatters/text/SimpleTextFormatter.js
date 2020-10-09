'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SimpleTextFormatter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SimpleTextFormatter = exports.SimpleTextFormatter = function () {
    function SimpleTextFormatter() {
        _classCallCheck(this, SimpleTextFormatter);

        this.id = "simpletextformatter";
    }

    _createClass(SimpleTextFormatter, [{
        key: 'format',
        value: function format(unformattedData) {
            return unformattedData;
        }
    }, {
        key: 'parse',
        value: function parse(value) {
            return value.toLowerCase();
        }
    }, {
        key: 'tableParser',
        value: function tableParser() {
            var _this = this;

            return {
                id: this.id,
                is: function is(s) {
                    return false;
                },
                format: function format(s) {
                    return _this.parse(s);
                },
                // either numeric or text
                type: 'text'
            };
        }
    }]);

    return SimpleTextFormatter;
}();