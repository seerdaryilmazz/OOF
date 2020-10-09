'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EnumUtils = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _StringUtils = require('./StringUtils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EnumUtils = exports.EnumUtils = function () {
    function EnumUtils() {
        _classCallCheck(this, EnumUtils);
    }

    _createClass(EnumUtils, null, [{
        key: 'enumHelper',
        value: function enumHelper(id, code, name) {
            if (id) {
                var _CODE = code ? code : id;
                var _NAME = name ? name : _StringUtils.StringUtils.titleCase(_.replace(_CODE, '_', ' '), 'en');
                return {
                    id: id,
                    code: _CODE,
                    name: _NAME
                };
            }
            return null;
        }
    }]);

    return EnumUtils;
}();