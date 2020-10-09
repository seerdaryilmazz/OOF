'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Notify = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _AxiosUtils = require('../utils/AxiosUtils');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Notify = exports.Notify = function () {
    function Notify() {
        _classCallCheck(this, Notify);
    }

    _createClass(Notify, null, [{
        key: 'translateMessage',
        value: function translateMessage(message, args) {
            var text = _lodash2.default.isString(message) ? message : message.message ? message.message : message;
            return Notify.translator ? Notify.translator.translate(text, args) : message;
        }
    }, {
        key: 'showError',
        value: function showError(error) {
            var message = _AxiosUtils.AxiosUtils.getErrorMessage(error);
            var errorTemplate = '<i class="uk-icon-exclamation uk-icon-medium" style="color:white;padding-right:10px;"></i>';
            UIkit.notify(errorTemplate + Notify.translateMessage(message.message, message.args), { status: 'danger' });
        }
    }, {
        key: 'showSuccess',
        value: function showSuccess(msg, args) {
            var successTemplate = '<i class="uk-icon-check uk-icon-medium" style="color:white;padding-right:10px;"></i>';
            UIkit.notify(successTemplate + Notify.translateMessage(msg, args), { status: 'success' });
        }
    }, {
        key: 'showInformation',
        value: function showInformation(msg, args) {
            var informationTemplate = '<i class="material-icons" style="color:white; padding-right:10px">info</i>';
            UIkit.notify(informationTemplate + Notify.translateMessage(msg, args), { status: 'info' });
        }
    }, {
        key: 'confirm',
        value: function confirm(msg, func, args) {
            UIkit.modal.confirm(Notify.translateMessage(msg, args), func, { labels: { 'Ok': Notify.translateMessage('ok'), 'Cancel': Notify.translateMessage('cancel') } });
        }
    }]);

    return Notify;
}();