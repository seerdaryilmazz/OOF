'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CookieUtils = exports.CookieUtils = function () {
    function CookieUtils() {
        _classCallCheck(this, CookieUtils);
    }

    _createClass(CookieUtils, null, [{
        key: 'getCookie',
        value: function getCookie(name) {
            var cookieValue = "";
            if (document.cookie && document.cookie != '') {
                document.cookie.split(';').forEach(function (cookie) {
                    if (cookie.trim().substring(0, name.length + 1) == name + '=') {
                        cookieValue = decodeURIComponent(cookie.trim().substring(name.length + 1));
                    }
                });
            }
            return cookieValue;
        }
    }]);

    return CookieUtils;
}();