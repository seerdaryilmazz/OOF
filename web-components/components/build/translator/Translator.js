"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Translator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _services = require("../oneorder/services");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Translator = exports.Translator = function () {
    function Translator(app) {
        _classCallCheck(this, Translator);

        this.messages = {};
        this.defaultLocale = "en";
        this.localStorageKey = "locale";
        this.messagesStorageKey = "oneorder.common.messages.";
        this.notTranslatedStorageKey = "notTranslated";
        this.app = app;
        this.readLocaleFromStorage();
        var MessageFormat = require('messageformat');
        this.mf = new MessageFormat(this.locale);
        this.startNotTranslatedValuesSyncTimer();
    }

    _createClass(Translator, [{
        key: "readLocaleFromStorage",
        value: function readLocaleFromStorage() {
            this.locale = this.getLocale();
            this.onChangeLocale && this.onChangeLocale(this.locale);
        }
    }, {
        key: "getLocale",
        value: function getLocale() {
            var selectedLocale = localStorage.getItem(this.localStorageKey);
            if (!selectedLocale) {
                selectedLocale = this.defaultLocale;
            }
            return selectedLocale;
        }
    }, {
        key: "getLanguage",
        value: function getLanguage() {
            var language = this.getLocale().split("_");
            return language[0].toUpperCase();
        }
    }, {
        key: "setLocale",
        value: function setLocale(locale) {
            localStorage.setItem(this.localStorageKey, locale);
            this.readLocaleFromStorage();
            this.loadTranslations();
        }
    }, {
        key: "loadTranslations",
        value: function loadTranslations() {
            var _this = this;

            var messages = localStorage.getItem(this.messagesStorageKey + this.app);
            this.messages = messages ? JSON.parse(messages) : {};

            _services.TranslatorService.getTranslations(this.app, this.locale).then(function (response) {
                _this.messages = response.data;
                localStorage.setItem(_this.messagesStorageKey + _this.app, JSON.stringify(_this.messages));
                _this.onMessagesReceived && _this.onMessagesReceived();
            }).catch(function (error) {
                console.log(error);
            });
        }
    }, {
        key: "translate",
        value: function translate(text, params, postTranslationCaseConverter) {
            if (!text) {
                return "";
            }
            var key = _lodash2.default.toLower(text);
            if (this.locale == this.defaultLocale) {
                return this.mf.compile(text)(params);
            } else if (this.messages[key]) {
                var adjustedLocale = this.adjustLocaleForJavascript(this.locale);
                switch (postTranslationCaseConverter) {
                    case 1:
                        return this.mf.compile(this.messages[key])(params).toLocaleUpperCase(adjustedLocale);
                    case 0:
                        return this.mf.compile(this.messages[key])(params).toLocaleLowerCase(adjustedLocale);
                    default:
                        return this.mf.compile(this.messages[key])(params);
                }
            } else {
                this.addNotTranslate(key, this.locale, this.app);
                return this.mf.compile(text)(params);
            }
        }
    }, {
        key: "adjustLocaleForJavascript",
        value: function adjustLocaleForJavascript(locale) {
            return locale.replace("_", "-");
        }
    }, {
        key: "getNotTranslatedItems",
        value: function getNotTranslatedItems() {
            var notTranslatedItems = localStorage.getItem(this.notTranslatedStorageKey);

            if (notTranslatedItems) {
                notTranslatedItems = JSON.parse(notTranslatedItems);
            } else {
                notTranslatedItems = [];
            }

            return notTranslatedItems;
        }
    }, {
        key: "addNotTranslate",
        value: function addNotTranslate(key, locale, appName) {
            var notTranslatedItems = this.getNotTranslatedItems();

            var newNotTranslated = {
                key: key,
                locale: locale,
                appName: appName
            };

            if (!_lodash2.default.find(notTranslatedItems, newNotTranslated)) {
                notTranslatedItems.push(newNotTranslated);
                localStorage.setItem(this.notTranslatedStorageKey, JSON.stringify(notTranslatedItems));
            }
        }
    }, {
        key: "sendNotTranslatedItems",
        value: function sendNotTranslatedItems() {
            var _this2 = this;

            var notTranslatedItems = this.getNotTranslatedItems();
            if (notTranslatedItems.length > 0) {
                console.log("Sending not translated items");
                console.log(notTranslatedItems);
                _services.TranslatorService.addNotTranslatedItems(notTranslatedItems).then(function (response) {
                    localStorage.removeItem(_this2.notTranslatedStorageKey);
                }).catch(function (error) {
                    console.log(error);
                });
            }
        }
    }, {
        key: "startNotTranslatedValuesSyncTimer",
        value: function startNotTranslatedValuesSyncTimer() {
            var _this3 = this;

            this.sendNotTranslatedItems();
            setInterval(function () {
                _this3.sendNotTranslatedItems();
            }, 1000 * 60 * 60 /* 1 hour */);
        }
    }]);

    return Translator;
}();