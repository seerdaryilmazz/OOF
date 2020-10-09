"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LocalStorage = exports.LocalStorage = function () {
    function LocalStorage(app) {
        _classCallCheck(this, LocalStorage);

        this.app = app;
    }

    _createClass(LocalStorage, [{
        key: "buildKey",
        value: function buildKey(key) {
            return "oneorder." + this.app + "." + key;
        }
    }, {
        key: "write",
        value: function write(key, value) {
            localStorage.setItem(this.buildKey(key), (typeof value === "undefined" ? "undefined" : _typeof(value)) === 'object' ? JSON.stringify(value) : value);
        }
    }, {
        key: "read",
        value: function read(key) {
            return localStorage.getItem(this.buildKey(key));
        }
    }]);

    return LocalStorage;
}();