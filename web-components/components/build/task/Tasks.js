"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Tasks = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _abstract = require("../abstract");

var _layout = require("../layout");

var _basic = require("../basic");

var _services = require("../services");

var _SalesBoxCancelModal = require("./SalesBoxCancelModal");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PAGE_SIZE = 1;

var Tasks = exports.Tasks = function (_TranslatingComponent) {
    _inherits(Tasks, _TranslatingComponent);

    function Tasks(props) {
        _classCallCheck(this, Tasks);

        var _this = _possibleConstructorReturn(this, (Tasks.__proto__ || Object.getPrototypeOf(Tasks)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(Tasks, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.loadNewTasks(1);
        }
    }, {
        key: "loadNewTasks",
        value: function loadNewTasks(pageNumber) {
            var _this2 = this;

            this.setState({ loadingNewTasks: true }, function () {
                var params = {
                    page: pageNumber - 1,
                    pageSize: PAGE_SIZE,
                    taskStatusCode: "NEW"
                };
                var callbackOnSuccess = function callbackOnSuccess(response) {
                    _this2.setState({
                        loadingNewTasks: false,
                        activeTabNo: 1,
                        newTasks: response.data.content,
                        newTasksPageNumber: pageNumber,
                        newTasksPageCount: response.data.totalPages
                    });
                };
                var callbackOnError = function callbackOnError() {
                    _this2.setState({ loadingNewTasks: false });
                };
                _this2.getMyActiveTasksPaged(params, callbackOnSuccess, callbackOnError);
            });
        }
    }, {
        key: "loadInProgressTasks",
        value: function loadInProgressTasks(pageNumber) {
            var _this3 = this;

            this.setState({ loadingInProgressTasks: true }, function () {
                var params = {
                    page: pageNumber - 1,
                    pageSize: PAGE_SIZE,
                    taskStatusCode: "INPROGRESS"
                };
                var callbackOnSuccess = function callbackOnSuccess(response) {
                    _this3.setState({
                        loadingInProgressTasks: false,
                        activeTabNo: 2,
                        inProgressTasks: response.data.content,
                        inProgressTasksPageNumber: pageNumber,
                        inProgressTasksPageCount: response.data.totalPages
                    });
                };
                var callbackOnError = function callbackOnError() {
                    _this3.setState({ loadingInProgressTasks: false });
                };
                _this3.getMyActiveTasksPaged(params, callbackOnSuccess, callbackOnError);
            });
        }
    }, {
        key: "loadCompletedTasks",
        value: function loadCompletedTasks(pageNumber) {
            var _this4 = this;

            this.setState({ loadingCompletedTasks: true }, function () {
                var params = {
                    page: pageNumber - 1,
                    pageSize: PAGE_SIZE,
                    taskStatusCode: "COMPLETED"
                };
                var callbackOnSuccess = function callbackOnSuccess(response) {
                    _this4.setState({
                        loadingCompletedTasks: false,
                        activeTabNo: 3,
                        completedTasks: response.data.content,
                        completedTasksPageNumber: pageNumber,
                        completedTasksPageCount: response.data.totalPages
                    });
                };
                var callbackOnError = function callbackOnError() {
                    _this4.setState({ loadingCompletedTasks: false });
                };
                _this4.getMyActiveTasksPaged(params, callbackOnSuccess, callbackOnError);
            });
        }
    }, {
        key: "getMyActiveTasksPaged",
        value: function getMyActiveTasksPaged(params, callbackOnSuccess, callbackOnError) {
            _services.TaskService.getMyActiveTasksPaged(params).then(function (response) {
                callbackOnSuccess(response);
            }).catch(function (error) {
                _basic.Notify.showError(error);
                callbackOnError();
            });
        }
    }, {
        key: "startTask",
        value: function startTask(task) {
            var _this5 = this;

            // TODO: Aşağıdaki işlemler atomic olsa daha doğru olur.
            _services.TaskService.claim(task.id).then(function (response) {
                _services.TaskService.changeStatusInProgress(task.id).then(function (responseInner) {
                    _basic.Notify.showSuccess("Status of task changed to 'in progress'.");
                    _this5.loadInProgressTasks(1);
                }).catch(function (error) {
                    _basic.Notify.showError(error);
                });
            }).catch(function (error) {
                _basic.Notify.showError(error);
            });
        }
    }, {
        key: "prepareForSalesBoxTaskCancel",
        value: function prepareForSalesBoxTaskCancel(task) {
            var _this6 = this;

            this.setSelectedSalesBoxTaskToBeCancelled(task, function () {
                return _this6.salesBoxCancelModal.open();
            });
        }
    }, {
        key: "quitSalesBoxTaskCancel",
        value: function quitSalesBoxTaskCancel() {
            var _this7 = this;

            this.setSelectedSalesBoxTaskToBeCancelled(null, function () {
                return _this7.salesBoxCancelModal.close();
            });
        }
    }, {
        key: "setSelectedSalesBoxTaskToBeCancelled",
        value: function setSelectedSalesBoxTaskToBeCancelled(task, callback) {
            this.setState({ selectedSalesBoxTaskToBeCancelled: task }, callback);
        }
    }, {
        key: "shiftValidityStartDateOfPotential",
        value: function shiftValidityStartDateOfPotential(potentialId, numberOfDays, callback) {
            _services.CrmAccountService.shiftValidityStartDateOfPotential(potentialId, numberOfDays).then(function (response) {
                callback(response);
            }).catch(function (error) {
                _basic.Notify.showError(error);
            });
        }
    }, {
        key: "findTask",
        value: function findTask(taskId, callback) {
            _services.TaskService.getTaskDetails(taskId).then(function (response) {
                callback(response);
            }).catch(function (error) {
                _basic.Notify.showError(error);
            });
        }
    }, {
        key: "completeTaskWithNewParams",
        value: function completeTaskWithNewParams(taskId, params, callback) {
            _services.TaskService.completeTaskWithNewParams(taskId, params).then(function (response) {
                callback(response);
            }).catch(function (error) {
                _basic.Notify.showError(error);
            });
        }
    }, {
        key: "cancelSalesBoxTask",
        value: function cancelSalesBoxTask(data) {
            var _this8 = this;

            var taskId = data.task.id;
            var potentialId = data.task.params.potentialId;
            var cancelReason = data.reason;
            var cancelDescription = data.description;

            // TODO: Aşağıdaki işlemler atomic olsa daha doğru olur.
            this.shiftValidityStartDateOfPotential(potentialId, cancelReason.potentialDeactivationSetting.numberOfDays, function (response1) {

                _this8.findTask(taskId, function (response2) {

                    var params = response2.data.params;
                    params.cancelReason = {
                        id: cancelReason.id,
                        name: cancelReason.name
                    };
                    params.cancelDescription = cancelDescription;

                    _this8.completeTaskWithNewParams(taskId, params, function (response3) {
                        _this8.setSelectedSalesBoxTaskToBeCancelled(null, function () {
                            return _this8.salesBoxCancelModal.close();
                        });
                        _this8.loadInProgressTasks(1);
                    });
                });
            });
        }
    }, {
        key: "getLoadingTasksProperty",
        value: function getLoadingTasksProperty(taskStatus) {
            var loadingTasks = false;
            if (taskStatus == "NEW") {
                loadingTasks = this.state.loadingNewTasks;
            } else if (taskStatus == "INPROGRESS") {
                loadingTasks = this.state.loadingInProgressTasks;
            } else if (taskStatus == "COMPLETED") {
                loadingTasks = this.state.loadingCompletedTasks;
            }
            return loadingTasks;
        }
    }, {
        key: "getTasksProperty",
        value: function getTasksProperty(taskStatus) {
            var tasks = [];
            if (taskStatus == "NEW") {
                tasks = this.state.newTasks;
            } else if (taskStatus == "INPROGRESS") {
                tasks = this.state.inProgressTasks;
            } else if (taskStatus == "COMPLETED") {
                tasks = this.state.completedTasks;
            }
            return tasks;
        }
    }, {
        key: "renderTasks",
        value: function renderTasks(taskStatus) {
            var _this9 = this;

            var loadingTasks = this.getLoadingTasksProperty(taskStatus);
            if (loadingTasks) {
                return _react2.default.createElement(_layout.Loader, { size: "L" });
            } else {
                var tasks = this.getTasksProperty(taskStatus);
                if (_lodash2.default.isEmpty(tasks)) {
                    return _get(Tasks.prototype.__proto__ || Object.getPrototypeOf(Tasks.prototype), "translate", this).call(this, "No task");
                } else {
                    var cells = [];
                    tasks.forEach(function (task, taskIndex) {
                        cells.push(_react2.default.createElement(
                            _layout.GridCell,
                            { key: task.id, width: "1-1", noMargin: true },
                            _this9.renderTask(task, taskIndex)
                        ));
                    });
                    return _react2.default.createElement(
                        _layout.Grid,
                        null,
                        cells,
                        _react2.default.createElement(
                            _layout.GridCell,
                            { width: "1-1" },
                            this.renderTaskPagination(taskStatus)
                        )
                    );
                }
            }
        }
    }, {
        key: "renderTask",
        value: function renderTask(task, taskIndex) {
            var _this10 = this;

            var taskType = task.taskType;
            var taskStatus = task.taskStatus;

            if (taskType == "SalesBox") {

                var taskLastUpdateDate = null;
                var taskCompletionDate = null;
                var cancelReason = null;

                if (taskStatus == "INPROGRESS") {
                    taskLastUpdateDate = this.renderPropertyOfTask(task, "Task Update Date", "lastUpdated");
                } else if (taskStatus == "COMPLETED") {
                    taskCompletionDate = this.renderPropertyOfTask(task, "Task Completion Date", "lastUpdated");
                    cancelReason = this.renderPropertyOfTask(task, "Cancel Reason", "params.cancelReason.name");
                }

                return _react2.default.createElement(
                    _layout.Grid,
                    null,
                    this.renderTaskSeparatorIfNecessary(taskIndex),
                    this.renderPropertyOfTask(task, "Task Creation Date", "createDate"),
                    this.renderPropertyOfTask(task, "Task Type", "taskType"),
                    taskLastUpdateDate,
                    taskCompletionDate,
                    this.renderPropertyOfTask(task, "Campaign", "params.campaignDescription"),
                    this.renderPropertyOfTask(task, "Account", "params.account.name"),
                    this.renderPropertyOfTask(task, "From - To", "params.fromToDescription"),
                    this.renderPropertyOfTask(task, "Shipment Loading Types", "params.shipmentLoadingTypes"),
                    this.renderPropertyOfTask(task, "Load Weight Types", "params.loadWeightTypes"),
                    cancelReason,
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: "1-1", hidden: taskStatus != "NEW" },
                        _react2.default.createElement(
                            "div",
                            { className: "uk-align-right" },
                            _react2.default.createElement(_basic.Button, { label: "Start", waves: true, size: "small", onclick: function onclick() {
                                    return _this10.startTask(task);
                                } })
                        )
                    ),
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: "1-1", hidden: taskStatus != "INPROGRESS" },
                        _react2.default.createElement(
                            "div",
                            { className: "uk-align-right" },
                            _react2.default.createElement(_basic.Button, { label: "Cancel", waves: true, size: "small", style: "danger", onclick: function onclick() {
                                    return _this10.prepareForSalesBoxTaskCancel(task);
                                } }),
                            _react2.default.createElement(_basic.Button, { label: "Go To New Spot Quote", waves: true, size: "small",
                                onclick: function onclick() {
                                    return _this10.goToNewSpotQuote(task.params.account.id, task.params.potentialId, task.id);
                                } })
                        )
                    )
                );
            } else {

                var _taskLastUpdateDate = null;
                var _taskCompletionDate = null;

                if (taskStatus == "INPROGRESS") {
                    _taskLastUpdateDate = this.renderPropertyOfTask(task, "Task Update Date", "lastUpdated");
                } else if (taskStatus == "COMPLETED") {
                    _taskCompletionDate = this.renderPropertyOfTask(task, "Task Completion Date", "lastUpdated");
                }

                return _react2.default.createElement(
                    _layout.Grid,
                    null,
                    this.renderTaskSeparatorIfNecessary(taskIndex),
                    this.renderPropertyOfTask(task, "Task Id", "id"),
                    this.renderPropertyOfTask(task, "Task Creation Date", "createDate"),
                    this.renderPropertyOfTask(task, "Task Type", "taskType"),
                    _taskLastUpdateDate,
                    _taskCompletionDate,
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: "1-1", hidden: taskStatus != "NEW" },
                        _react2.default.createElement(
                            "div",
                            { className: "uk-align-right" },
                            _react2.default.createElement(_basic.Button, { label: "Start", waves: true, size: "small", onclick: function onclick() {
                                    return _this10.startTask(task);
                                } })
                        )
                    )
                );
            }
        }
    }, {
        key: "renderPropertyOfTask",
        value: function renderPropertyOfTask(task, label, propertyPath) {

            var labelClassName = "uk-text-primary";
            var valueClassName = "uk-text-muted";
            var value = null;

            if (propertyPath == "params.campaignDescription") {
                if (_lodash2.default.get(task, "params.campaign") === true) {
                    labelClassName = "uk-text-danger";
                    valueClassName = "uk-text-danger";
                    value = _lodash2.default.get(task, "params.minPrice") + "-" + _lodash2.default.get(task, "params.maxPrice") + " " + _lodash2.default.get(task, "params.currency.code");
                }
            } else if (propertyPath == "params.fromToDescription") {
                var value1 = _get(Tasks.prototype.__proto__ || Object.getPrototypeOf(Tasks.prototype), "translate", this).call(this, _lodash2.default.get(task, "params.fromCountry.name"));
                var value2 = _get(Tasks.prototype.__proto__ || Object.getPrototypeOf(Tasks.prototype), "translate", this).call(this, _lodash2.default.get(task, "params.toCountry.name"));
                value = value1 + " " + _lodash2.default.get(task, "params.fromPostalCode.code") + " - " + value2 + " " + _lodash2.default.get(task, "params.toPostalCode.code");
            } else if (propertyPath == "params.shipmentLoadingTypes" || propertyPath == "params.loadWeightTypes") {
                value = this.convertObjectArrayToString(_lodash2.default.get(task, propertyPath), "name", ", ");
            } else {
                value = _get(Tasks.prototype.__proto__ || Object.getPrototypeOf(Tasks.prototype), "translate", this).call(this, _lodash2.default.get(task, propertyPath));
            }

            if (_lodash2.default.isNil(value)) {
                return null;
            } else {
                return _react2.default.createElement(
                    _layout.GridCell,
                    { width: "1-1" },
                    _react2.default.createElement(
                        "span",
                        null,
                        _react2.default.createElement(
                            "span",
                            { className: labelClassName },
                            _get(Tasks.prototype.__proto__ || Object.getPrototypeOf(Tasks.prototype), "translate", this).call(this, label),
                            ":"
                        ),
                        "\xA0",
                        _react2.default.createElement(
                            "span",
                            { className: valueClassName },
                            value
                        )
                    )
                );
            }
        }
    }, {
        key: "convertObjectArrayToString",
        value: function convertObjectArrayToString(array, propertyName, separator) {
            var _this11 = this;

            if (_lodash2.default.isEmpty(array)) {
                return "";
            } else {
                return array.map(function (elem) {
                    return _get(Tasks.prototype.__proto__ || Object.getPrototypeOf(Tasks.prototype), "translate", _this11).call(_this11, _lodash2.default.get(elem, propertyName));
                }).join(separator);
            }
        }
    }, {
        key: "goToNewSpotQuote",
        value: function goToNewSpotQuote(accountId, potentialId, taskId) {
            window.open("/ui/crm/#/quote/new/SPOT/ROAD/" + accountId + "/" + potentialId + "?referrerTaskId=" + taskId);
        }
    }, {
        key: "renderTaskSeparatorIfNecessary",
        value: function renderTaskSeparatorIfNecessary(taskIndex) {
            if (taskIndex > 0) {
                return _react2.default.createElement(
                    _layout.GridCell,
                    { width: "1-1", noMargin: true },
                    _react2.default.createElement("hr", null)
                );
            } else {
                return null;
            }
        }
    }, {
        key: "renderTaskPagination",
        value: function renderTaskPagination(taskStatus) {
            var _this12 = this;

            if (taskStatus == "NEW") {
                return _react2.default.createElement(_layout.Pagination, { page: this.state.newTasksPageNumber,
                    totalPages: this.state.newTasksPageCount,
                    onPageChange: function onPageChange(pageNumber) {
                        return _this12.loadNewTasks(pageNumber);
                    },
                    range: 10 });
            } else if (taskStatus == "INPROGRESS") {
                return _react2.default.createElement(_layout.Pagination, { page: this.state.inProgressTasksPageNumber,
                    totalPages: this.state.inProgressTasksPageCount,
                    onPageChange: function onPageChange(pageNumber) {
                        return _this12.loadInProgressTasks(pageNumber);
                    },
                    range: 10 });
            } else if (taskStatus == "COMPLETED") {
                return _react2.default.createElement(_layout.Pagination, { page: this.state.completedTasksPageNumber,
                    totalPages: this.state.completedTasksPageCount,
                    onPageChange: function onPageChange(pageNumber) {
                        return _this12.loadCompletedTasks(pageNumber);
                    },
                    range: 10 });
            } else {
                return null;
            }
        }
    }, {
        key: "getClassNameForTabButton",
        value: function getClassNameForTabButton(tabNo) {
            if (tabNo == this.state.activeTabNo) {
                return "primary";
            } else {
                return null;
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this13 = this;

            var tasks = void 0;
            if (this.state.activeTabNo == 1) {
                tasks = this.renderTasks("NEW");
            } else if (this.state.activeTabNo == 2) {
                tasks = this.renderTasks("INPROGRESS");
            } else if (this.state.activeTabNo == 3) {
                tasks = this.renderTasks("COMPLETED");
            }

            return _react2.default.createElement(
                _layout.Card,
                null,
                _react2.default.createElement(
                    _layout.Grid,
                    { divider: true, removeTopMargin: true },
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: "1-3", noMargin: true, textCenter: true },
                        _react2.default.createElement(_basic.Button, { flat: true, label: "New Tasks", onclick: function onclick() {
                                return _this13.loadNewTasks(1);
                            }, style: this.getClassNameForTabButton(1) })
                    ),
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: "1-3", noMargin: true, textCenter: true },
                        _react2.default.createElement(_basic.Button, { flat: true, label: "In Progress Tasks", onclick: function onclick() {
                                return _this13.loadInProgressTasks(1);
                            }, style: this.getClassNameForTabButton(2) })
                    ),
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: "1-3", noMargin: true, textCenter: true },
                        _react2.default.createElement(_basic.Button, { flat: true, label: "Completed Tasks", onclick: function onclick() {
                                return _this13.loadCompletedTasks(1);
                            }, style: this.getClassNameForTabButton(3) })
                    ),
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: "1-1", noMargin: true },
                        tasks
                    ),
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: "1-1", noMargin: true },
                        _react2.default.createElement(_SalesBoxCancelModal.SalesBoxCancelModal, { ref: function ref(c) {
                                return _this13.salesBoxCancelModal = c;
                            },
                            task: this.state.selectedSalesBoxTaskToBeCancelled,
                            onSave: function onSave(data) {
                                return _this13.cancelSalesBoxTask(data);
                            },
                            onCancel: function onCancel() {
                                return _this13.quitSalesBoxTaskCancel();
                            } })
                    )
                )
            );
        }
    }]);

    return Tasks;
}(_abstract.TranslatingComponent);

Tasks.contextTypes = {
    translator: _propTypes2.default.object
};