"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AxiosUtils = exports.AxiosUtils = function () {
    function AxiosUtils() {
        _classCallCheck(this, AxiosUtils);
    }

    _createClass(AxiosUtils, null, [{
        key: "getErrorMessage",
        value: function getErrorMessage(msg) {
            if (msg && msg.response && msg.response.data) {
                if (msg.response.data.args) {
                    return { message: msg.response.data.message, args: msg.response.data.args };
                }
                if (msg.response.data.message) {
                    return { message: msg.response.data.message };
                }
                return { message: msg.response.data };
            } else {
                return { message: msg };
            }
        }
    }]);

    return AxiosUtils;
}();