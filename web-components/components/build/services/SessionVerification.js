'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.verifySession = verifySession;

var _axios = require('axios');

var axios = _interopRequireWildcard(_axios);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var loginPopup = null;
function verifySession() {
    axios.interceptors.response.use(undefined, function (error) {
        if (!error.response || error.response.status === 403 && error.response.data.message !== 'Access is denied') {
            var left = (window.innerWidth - 480) / 2;
            var top = 300;
            if (!loginPopup || loginPopup.closed) {
                loginPopup = window.open("/login-success", "_blank", 'menubar=no,status=no,toolbar=no,scrollbars=no,left=' + left + ', top=' + top + ',resizable=no,width=480,height=480');
                throw new Error("Session is expired");
            }
        }
        throw error;
    });
}