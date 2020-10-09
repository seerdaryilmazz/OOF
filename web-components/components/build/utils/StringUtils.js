"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StringUtils = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StringUtils = exports.StringUtils = function () {
    function StringUtils() {
        _classCallCheck(this, StringUtils);
    }

    _createClass(StringUtils, null, [{
        key: "trimAndSet",
        value: function trimAndSet(obj, path) {
            var val = _lodash2.default.get(obj, path);
            if (val) {
                _lodash2.default.set(obj, path, _lodash2.default.trim(val));
            }
        }
    }, {
        key: "stripWhitespaces",
        value: function stripWhitespaces(value) {
            var result = "" + value;
            while (result.indexOf(" ") > -1) {
                result = _lodash2.default.replace(result, " ", "");
            }
            return result;
        }
    }, {
        key: "uppercaseFirst",
        value: function uppercaseFirst(value, locale) {
            return value && this.uppercase(this.substring(value, 0, 1), locale) + this.substring(value, 1);
        }
    }, {
        key: "capitalize",
        value: function capitalize(value, locale) {
            return value && this.uppercase(this.substring(value, 0, 1), locale) + this.lowercase(this.substring(value, 1), locale);
        }
    }, {
        key: "sentenceCase",
        value: function sentenceCase(value, locale) {
            var _this = this;

            var seperators = ['.', '!', '?', ':'];
            var result = _lodash2.default.cloneDeep(this.lowercase(value));
            seperators.forEach(function (seperator) {
                result = _this.uppercaseFirstBySeperator(result, seperator, locale);
            });
            return result;
        }
    }, {
        key: "titleCase",
        value: function titleCase(value, locale) {
            return this.capitilizeBySeperator(value, ' ', locale);
        }
    }, {
        key: "uppercaseFirstBySeperator",
        value: function uppercaseFirstBySeperator(value, seperator, locale) {
            var _this2 = this;

            var sentences = _lodash2.default.split(_lodash2.default.trim(value), seperator);
            var result = '';
            sentences.forEach(function (sentence) {
                result = _lodash2.default.trim(result + _this2.uppercaseFirst(sentence, locale) + seperator) + ' ';
            });
            return _lodash2.default.trimEnd(result.trim(), seperator);
        }
    }, {
        key: "capitilizeBySeperator",
        value: function capitilizeBySeperator(value, seperator, locale) {
            var _this3 = this;

            var sentences = _lodash2.default.split(_lodash2.default.trim(value), seperator);
            var result = '';
            sentences.forEach(function (sentence) {
                result = _lodash2.default.trim(result + _this3.capitalize(sentence, locale) + seperator) + ' ';
            });
            return _lodash2.default.trimEnd(result.trim(), seperator);
        }
    }, {
        key: "uppercase",
        value: function uppercase(value, locale) {
            return value && value.trim().toLocaleUpperCase(locale);
        }
    }, {
        key: "lowercase",
        value: function lowercase(value, locale) {
            return value && value.trim().toLocaleLowerCase(locale);
        }
    }, {
        key: "substring",
        value: function substring(value, start, end) {
            return value && value.trim().substring(start, end);
        }
    }]);

    return StringUtils;
}();