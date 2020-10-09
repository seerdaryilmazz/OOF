'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SearchUtils = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var accented = {
    'A': '[Aa\xAA\xC0-\xC5\xE0-\xE5\u0100-\u0105\u01CD\u01CE\u0200-\u0203\u0226\u0227\u1D2C\u1D43\u1E00\u1E01\u1E9A\u1EA0-\u1EA3\u2090\u2100\u2101\u213B\u249C\u24B6\u24D0\u3371-\u3374\u3380-\u3384\u3388\u3389\u33A9-\u33AF\u33C2\u33CA\u33DF\u33FF\uFF21\uFF41]',
    'B': '[Bb\u1D2E\u1D47\u1E02-\u1E07\u212C\u249D\u24B7\u24D1\u3374\u3385-\u3387\u33C3\u33C8\u33D4\u33DD\uFF22\uFF42]',
    'C': '[Cc\xC7\xE7\u0106-\u010D\u1D9C\u2100\u2102\u2103\u2105\u2106\u212D\u216D\u217D\u249E\u24B8\u24D2\u3376\u3388\u3389\u339D\u33A0\u33A4\u33C4-\u33C7\uFF23\uFF43]',
    'Ç': '[Cc\xC7\xE7\u0106-\u010D\u1D9C\u2100\u2102\u2103\u2105\u2106\u212D\u216D\u217D\u249E\u24B8\u24D2\u3376\u3388\u3389\u339D\u33A0\u33A4\u33C4-\u33C7\uFF23\uFF43]',
    'D': '[Dd\u010E\u010F\u01C4-\u01C6\u01F1-\u01F3\u1D30\u1D48\u1E0A-\u1E13\u2145\u2146\u216E\u217E\u249F\u24B9\u24D3\u32CF\u3372\u3377-\u3379\u3397\u33AD-\u33AF\u33C5\u33C8\uFF24\uFF44]',
    'E': '[Ee\xC8-\xCB\xE8-\xEB\u0112-\u011B\u0204-\u0207\u0228\u0229\u1D31\u1D49\u1E18-\u1E1B\u1EB8-\u1EBD\u2091\u2121\u212F\u2130\u2147\u24A0\u24BA\u24D4\u3250\u32CD\u32CE\uFF25\uFF45]',
    'F': '[Ff\u1DA0\u1E1E\u1E1F\u2109\u2131\u213B\u24A1\u24BB\u24D5\u338A-\u338C\u3399\uFB00-\uFB04\uFF26\uFF46]',
    'G': '[Gg\u011C-\u0123\u01E6\u01E7\u01F4\u01F5\u1D33\u1D4D\u1E20\u1E21\u210A\u24A2\u24BC\u24D6\u32CC\u32CD\u3387\u338D-\u338F\u3393\u33AC\u33C6\u33C9\u33D2\u33FF\uFF27\uFF47]',
    'Ğ': '[Gg\u011C-\u0123\u01E6\u01E7\u01F4\u01F5\u1D33\u1D4D\u1E20\u1E21\u210A\u24A2\u24BC\u24D6\u32CC\u32CD\u3387\u338D-\u338F\u3393\u33AC\u33C6\u33C9\u33D2\u33FF\uFF27\uFF47]',
    'H': '[Hh\u0124\u0125\u021E\u021F\u02B0\u1D34\u1E22-\u1E2B\u1E96\u210B-\u210E\u24A3\u24BD\u24D7\u32CC\u3371\u3390-\u3394\u33CA\u33CB\u33D7\uFF28\uFF48]',
    'I': '[Ii\xCC-\xCF\xEC-\xEF\u0128-\u0130\u0132\u0133\u01CF\u01D0\u0208-\u020B\u1D35\u1D62\u1E2C\u1E2D\u1EC8-\u1ECB\u2071\u2110\u2111\u2139\u2148\u2160-\u2163\u2165-\u2168\u216A\u216B\u2170-\u2173\u2175-\u2178\u217A\u217B\u24A4\u24BE\u24D8\u337A\u33CC\u33D5\uFB01\uFB03\uFF29\uFF49]',
    'İ': '[Ii\xCC-\xCF\xEC-\xEF\u0128-\u0130\u0132\u0133\u01CF\u01D0\u0208-\u020B\u1D35\u1D62\u1E2C\u1E2D\u1EC8-\u1ECB\u2071\u2110\u2111\u2139\u2148\u2160-\u2163\u2165-\u2168\u216A\u216B\u2170-\u2173\u2175-\u2178\u217A\u217B\u24A4\u24BE\u24D8\u337A\u33CC\u33D5\uFB01\uFB03\uFF29\uFF49]',
    'J': '[Jj\u0132-\u0135\u01C7-\u01CC\u01F0\u02B2\u1D36\u2149\u24A5\u24BF\u24D9\u2C7C\uFF2A\uFF4A]',
    'K': '[Kk\u0136\u0137\u01E8\u01E9\u1D37\u1D4F\u1E30-\u1E35\u212A\u24A6\u24C0\u24DA\u3384\u3385\u3389\u338F\u3391\u3398\u339E\u33A2\u33A6\u33AA\u33B8\u33BE\u33C0\u33C6\u33CD-\u33CF\uFF2B\uFF4B]',
    'L': '[Ll\u0139-\u0140\u01C7-\u01C9\u02E1\u1D38\u1E36\u1E37\u1E3A-\u1E3D\u2112\u2113\u2121\u216C\u217C\u24A7\u24C1\u24DB\u32CF\u3388\u3389\u33D0-\u33D3\u33D5\u33D6\u33FF\uFB02\uFB04\uFF2C\uFF4C]',
    'M': '[Mm\u1D39\u1D50\u1E3E-\u1E43\u2120\u2122\u2133\u216F\u217F\u24A8\u24C2\u24DC\u3377-\u3379\u3383\u3386\u338E\u3392\u3396\u3399-\u33A8\u33AB\u33B3\u33B7\u33B9\u33BD\u33BF\u33C1\u33C2\u33CE\u33D0\u33D4-\u33D6\u33D8\u33D9\u33DE\u33DF\uFF2D\uFF4D]',
    'N': '[Nn\xD1\xF1\u0143-\u0149\u01CA-\u01CC\u01F8\u01F9\u1D3A\u1E44-\u1E4B\u207F\u2115\u2116\u24A9\u24C3\u24DD\u3381\u338B\u339A\u33B1\u33B5\u33BB\u33CC\u33D1\uFF2E\uFF4E]',
    'O': '[Oo\xBA\xD2-\xD6\xF2-\xF6\u014C-\u0151\u01A0\u01A1\u01D1\u01D2\u01EA\u01EB\u020C-\u020F\u022E\u022F\u1D3C\u1D52\u1ECC-\u1ECF\u2092\u2105\u2116\u2134\u24AA\u24C4\u24DE\u3375\u33C7\u33D2\u33D6\uFF2F\uFF4F]',
    'Ö': '[Oo\xBA\xD2-\xD6\xF2-\xF6\u014C-\u0151\u01A0\u01A1\u01D1\u01D2\u01EA\u01EB\u020C-\u020F\u022E\u022F\u1D3C\u1D52\u1ECC-\u1ECF\u2092\u2105\u2116\u2134\u24AA\u24C4\u24DE\u3375\u33C7\u33D2\u33D6\uFF2F\uFF4F]',
    'P': '[Pp\u1D3E\u1D56\u1E54-\u1E57\u2119\u24AB\u24C5\u24DF\u3250\u3371\u3376\u3380\u338A\u33A9-\u33AC\u33B0\u33B4\u33BA\u33CB\u33D7-\u33DA\uFF30\uFF50]',
    'Q': '[Qq\u211A\u24AC\u24C6\u24E0\u33C3\uFF31\uFF51]',
    'R': '[Rr\u0154-\u0159\u0210-\u0213\u02B3\u1D3F\u1D63\u1E58-\u1E5B\u1E5E\u1E5F\u20A8\u211B-\u211D\u24AD\u24C7\u24E1\u32CD\u3374\u33AD-\u33AF\u33DA\u33DB\uFF32\uFF52]',
    'S': '[Ss\u015A-\u0161\u017F\u0218\u0219\u02E2\u1E60-\u1E63\u20A8\u2101\u2120\u24AE\u24C8\u24E2\u33A7\u33A8\u33AE-\u33B3\u33DB\u33DC\uFB06\uFF33\uFF53]',
    'Ş': '[Ss\u015A-\u0161\u017F\u0218\u0219\u02E2\u1E60-\u1E63\u20A8\u2101\u2120\u24AE\u24C8\u24E2\u33A7\u33A8\u33AE-\u33B3\u33DB\u33DC\uFB06\uFF33\uFF53]',
    'T': '[Tt\u0162-\u0165\u021A\u021B\u1D40\u1D57\u1E6A-\u1E71\u1E97\u2121\u2122\u24AF\u24C9\u24E3\u3250\u32CF\u3394\u33CF\uFB05\uFB06\uFF34\uFF54]',
    'U': '[Uu\xD9-\xDC\xF9-\xFC\u0168-\u0173\u01AF\u01B0\u01D3\u01D4\u0214-\u0217\u1D41\u1D58\u1D64\u1E72-\u1E77\u1EE4-\u1EE7\u2106\u24B0\u24CA\u24E4\u3373\u337A\uFF35\uFF55]',
    'Ü': '[Uu\xD9-\xDC\xF9-\xFC\u0168-\u0173\u01AF\u01B0\u01D3\u01D4\u0214-\u0217\u1D41\u1D58\u1D64\u1E72-\u1E77\u1EE4-\u1EE7\u2106\u24B0\u24CA\u24E4\u3373\u337A\uFF35\uFF55]',
    'V': '[Vv\u1D5B\u1D65\u1E7C-\u1E7F\u2163-\u2167\u2173-\u2177\u24B1\u24CB\u24E5\u2C7D\u32CE\u3375\u33B4-\u33B9\u33DC\u33DE\uFF36\uFF56]',
    'W': '[Ww\u0174\u0175\u02B7\u1D42\u1E80-\u1E89\u1E98\u24B2\u24CC\u24E6\u33BA-\u33BF\u33DD\uFF37\uFF57]',
    'X': '[Xx\u02E3\u1E8A-\u1E8D\u2093\u213B\u2168-\u216B\u2178-\u217B\u24B3\u24CD\u24E7\u33D3\uFF38\uFF58]',
    'Y': '[Yy\xDD\xFD\xFF\u0176-\u0178\u0232\u0233\u02B8\u1E8E\u1E8F\u1E99\u1EF2-\u1EF9\u24B4\u24CE\u24E8\u33C9\uFF39\uFF59]',
    'Z': '[Zz\u0179-\u017E\u01F1-\u01F3\u1DBB\u1E90-\u1E95\u2124\u2128\u24B5\u24CF\u24E9\u3390-\u3394\uFF3A\uFF5A]'
};

var SearchUtils = function () {
    function SearchUtils(searchFields) {
        _classCallCheck(this, SearchUtils);

        this.searchFields = searchFields;
        this.translatr = null;
    }

    _createClass(SearchUtils, [{
        key: 'translator',
        value: function translator(_translator) {
            this.translatr = _translator;
            return this;
        }
    }, {
        key: 'translate',
        value: function translate(value) {
            return this.translatr ? this.translatr.translate(value) : value;
        }
    }, {
        key: 'make_pattern',
        value: function make_pattern(search_string) {
            // escape meta characters
            search_string = search_string.replace(/([|()[{.+*?^$\\])/g, "\\$1");

            // split into words
            var words = search_string.split(/\s+/);

            // sort by length
            var length_comp = function length_comp(a, b) {
                return b.length - a.length;
            };
            words.sort(length_comp);

            // replace characters by their compositors
            var accent_replacer = function accent_replacer(chr) {
                return accented[chr.toUpperCase()] || chr;
            };
            for (var i = 0; i < words.length; i++) {
                words[i] = words[i].replace(/\S/g, accent_replacer);
            }

            // join as alternatives
            var regexp = words.join("|");
            return new RegExp(regexp, 'g');
        }
    }, {
        key: 'matcher',
        value: function matcher(option, input) {
            var _this = this;

            var keys = [];
            if (this.searchFields) {
                _lodash2.default.each(this.searchFields, function (field) {
                    var value = _lodash2.default.get(option, field);
                    if (value) {
                        if (_lodash2.default.isString(value) && 0 <= _this.translate(value).toLocaleUpperCase(navigator.language).search(_this.make_pattern(input))) {
                            keys.push(field);
                        } else if (_lodash2.default.isObject(value) && _this.matcher(value, input)) {
                            keys.push(field);
                        }
                    }
                });
            } else {
                _lodash2.default.each(option, function (value, key) {
                    if (value) {
                        if (_lodash2.default.isString(value) && 0 <= _this.translate(value).toLocaleUpperCase(navigator.language).search(_this.make_pattern(input))) {
                            keys.push(key);
                        } else if (_lodash2.default.isObject(value) && _this.matcher(value, input)) {
                            keys.push(key);
                        }
                    }
                });
            }
            return !_lodash2.default.isEmpty(keys);
        }
    }, {
        key: 'search',
        value: function search(searchValue, list) {
            var _this2 = this;

            var value = _lodash2.default.defaultTo(searchValue, '').split(" ").filter(function (o) {
                return !_lodash2.default.isEmpty(o);
            });
            var filtered = list;
            value.forEach(function (token) {
                filtered = _lodash2.default.intersection(filtered, _lodash2.default.filter(list, function (o) {
                    return _this2.matcher(o, token);
                }));
            });
            return _lodash2.default.isEmpty(value) ? list : filtered;
        }
    }]);

    return SearchUtils;
}();

exports.SearchUtils = SearchUtils;