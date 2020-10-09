"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TaskService = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require("axios");

var axios = _interopRequireWildcard(_axios);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TaskService = exports.TaskService = function () {
    function TaskService() {
        _classCallCheck(this, TaskService);
    }

    _createClass(TaskService, null, [{
        key: "getMyActiveTasksPaged",
        value: function getMyActiveTasksPaged(params) {
            return axios.get('/task-service/myactivetasks/paged', { params: params });
        }
    }, {
        key: "claim",
        value: function claim(taskId) {
            return axios.put('/task-service/' + taskId + '/claim');
        }
    }, {
        key: "changeStatusInProgress",
        value: function changeStatusInProgress(taskId) {
            return axios.put('/task-service/' + taskId + '/changestatus?taskStatus=' + TaskService.IN_PROGRESS);
        }
    }, {
        key: "getTaskDetails",
        value: function getTaskDetails(id) {
            return axios.get('/task-service/' + id);
        }
    }, {
        key: "completeTaskWithNewParams",
        value: function completeTaskWithNewParams(taskId, params) {
            return axios.put('/task-service/' + taskId + '/completeWithNewParams', params);
        }
    }]);

    return TaskService;
}();

TaskService.IN_PROGRESS = "INPROGRESS";
TaskService.NEW = "NEW";
TaskService.COMPLETED = "COMPLETED";