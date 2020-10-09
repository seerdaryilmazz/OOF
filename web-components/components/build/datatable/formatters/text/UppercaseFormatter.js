'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UppercaseFormatter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UppercaseFormatter = exports.UppercaseFormatter = function () {
    function UppercaseFormatter() {
        _classCallCheck(this, UppercaseFormatter);

        this.id = "uppercaseformatter";
    }

    _createClass(UppercaseFormatter, [{
        key: 'format',
        value: function format(value) {
            if (_lodash2.default.isObject(value)) {
                value.text = _lodash2.default.toUpper(value.text);
                return value;
            } else {
                return _lodash2.default.toUpper(value);
            }
        }
    }, {
        key: 'parse',
        value: function parse(value) {
            if (_lodash2.default.isObject(value)) {
                return _lodash2.default.toLower(value.text);
            } else {
                return _lodash2.default.toLower(value);
            }
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

    return UppercaseFormatter;
}();