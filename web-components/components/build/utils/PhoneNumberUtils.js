"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PhoneNumberUtils = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _StringUtils = require("./StringUtils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PhoneNumberUtils = exports.PhoneNumberUtils = function () {
    function PhoneNumberUtils() {
        _classCallCheck(this, PhoneNumberUtils);
    }

    _createClass(PhoneNumberUtils, null, [{
        key: "format",
        value: function format(phoneNumber) {
            if (!phoneNumber) {
                return "";
            }
            return (phoneNumber.countryCode ? "+" + _lodash2.default.trim(phoneNumber.countryCode) : "") + (phoneNumber.regionCode ? "(" + _lodash2.default.trim(phoneNumber.regionCode) + ")" : "") + PhoneNumberUtils.formatPhoneNumber(phoneNumber.phone) + (phoneNumber.extension ? "-" + phoneNumber.extension : "");
        }
    }, {
        key: "sanitize",
        value: function sanitize(phoneNumber) {
            phoneNumber.countryCode = _lodash2.default.trim(phoneNumber.countryCode);
            phoneNumber.regionCode = _lodash2.default.trim(phoneNumber.regionCode);
            phoneNumber.phone = _StringUtils.StringUtils.stripWhitespaces(phoneNumber.phone);
            return phoneNumber;
        }
    }, {
        key: "setIsValid",
        value: function setIsValid(phoneNumber) {
            if (!phoneNumber) {
                return;
            }
            var isValid = phoneNumber.phone && phoneNumber.regionCode && phoneNumber.countryCode;
            if (isValid) {
                phoneNumber._valid = true;
            } else {
                phoneNumber._valid = false;
            }
        }
    }, {
        key: "formatPhoneNumber",
        value: function formatPhoneNumber(value) {
            if (value) {
                var phone = _StringUtils.StringUtils.stripWhitespaces(value);
                if (phone.length == 5 || phone.length == 6) {
                    return phone.substring(0, 3) + " " + phone.substring(3);
                } else if (phone.length == 7 || phone.length == 8) {
                    return phone.substring(0, 3) + " " + phone.substring(3, 5) + " " + phone.substring(5);
                } else if (phone.length >= 9) {
                    return phone.substring(0, 3) + " " + phone.substring(3, 6) + " " + phone.substring(6);
                } else {
                    return phone;
                }
            }
            return "";
        }
    }]);

    return PhoneNumberUtils;
}();