'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NotificationService = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var axios = _interopRequireWildcard(_axios);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotificationService = exports.NotificationService = function () {
    function NotificationService() {
        _classCallCheck(this, NotificationService);
    }

    _createClass(NotificationService, null, [{
        key: 'my',
        value: function my() {
            return axios.get('/notification-service/notification/my');
        }
    }, {
        key: 'read',
        value: function read(id) {
            return axios.put('/notification-service/notification/read/' + id);
        }
    }, {
        key: 'readAll',
        value: function readAll() {
            return axios.put('/notification-service/notification/read-all');
        }
    }]);

    return NotificationService;
}();