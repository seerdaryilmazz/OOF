import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import uuid from 'uuid';

import {TranslatingComponent} from '../abstract';
import {Card, Grid, GridCell, Loader, Pagination} from '../layout';
import {Button, Notify} from '../basic';

import {CrmAccountService, TaskService} from '../services';
import {SalesBoxCancelModal} from './SalesBoxCancelModal';

const PAGE_SIZE = 1;

export class Tasks extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.loadNewTasks(1);
    }

    loadNewTasks(pageNumber) {
        this.setState({loadingNewTasks: true}, () => {
            let params = {
                page: pageNumber - 1,
                pageSize: PAGE_SIZE,
                taskStatusCode: "NEW"
            };
            let callbackOnSuccess = (response) => {
                this.setState({
                    loadingNewTasks: false,
                    activeTabNo: 1,
                    newTasks: response.data.content,
                    newTasksPageNumber: pageNumber,
                    newTasksPageCount: response.data.totalPages
                });
            };
            let callbackOnError = () => {
                this.setState({loadingNewTasks: false});
            };
            this.getMyActiveTasksPaged(params, callbackOnSuccess, callbackOnError);
        });
    }

    loadInProgressTasks(pageNumber) {
        this.setState({loadingInProgressTasks: true}, () => {
            let params = {
                page: pageNumber - 1,
                pageSize: PAGE_SIZE,
                taskStatusCode: "INPROGRESS"
            };
            let callbackOnSuccess = (response) => {
                this.setState({
                    loadingInProgressTasks: false,
                    activeTabNo: 2,
                    inProgressTasks: response.data.content,
                    inProgressTasksPageNumber: pageNumber,
                    inProgressTasksPageCount: response.data.totalPages
                });
            };
            let callbackOnError = () => {
                this.setState({loadingInProgressTasks: false});
            };
            this.getMyActiveTasksPaged(params, callbackOnSuccess, callbackOnError);
        });
    }

    loadCompletedTasks(pageNumber) {
        this.setState({loadingCompletedTasks: true}, () => {
            let params = {
                page: pageNumber - 1,
                pageSize: PAGE_SIZE,
                taskStatusCode: "COMPLETED"
            };
            let callbackOnSuccess = (response) => {
                this.setState({
                    loadingCompletedTasks: false,
                    activeTabNo: 3,
                    completedTasks: response.data.content,
                    completedTasksPageNumber: pageNumber,
                    completedTasksPageCount: response.data.totalPages
                });
            };
            let callbackOnError = () => {
                this.setState({loadingCompletedTasks: false});
            };
            this.getMyActiveTasksPaged(params, callbackOnSuccess, callbackOnError);
        });
    }

    getMyActiveTasksPaged(params, callbackOnSuccess, callbackOnError) {
        TaskService.getMyActiveTasksPaged(params).then(response => {
            callbackOnSuccess(response);
        }).catch(error => {
            Notify.showError(error);
            callbackOnError();
        });
    }

    startTask(task) {
        // TODO: Aşağıdaki işlemler atomic olsa daha doğru olur.
        TaskService.claim(task.id).then(response => {
            TaskService.changeStatusInProgress(task.id).then(responseInner => {
                Notify.showSuccess("Status of task changed to 'in progress'.");
                this.loadInProgressTasks(1);
            }).catch(error => {
                Notify.showError(error);
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    prepareForSalesBoxTaskCancel(task) {
        this.setSelectedSalesBoxTaskToBeCancelled(task, () => this.salesBoxCancelModal.open());
    }

    quitSalesBoxTaskCancel() {
        this.setSelectedSalesBoxTaskToBeCancelled(null, () => this.salesBoxCancelModal.close());
    }

    setSelectedSalesBoxTaskToBeCancelled(task, callback) {
        this.setState({selectedSalesBoxTaskToBeCancelled: task}, callback);
    }

    shiftValidityStartDateOfPotential(potentialId, numberOfDays, callback) {
        CrmAccountService.shiftValidityStartDateOfPotential(potentialId, numberOfDays).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    findTask(taskId, callback) {
        TaskService.getTaskDetails(taskId).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    completeTaskWithNewParams(taskId, params, callback) {
        TaskService.completeTaskWithNewParams(taskId, params).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    cancelSalesBoxTask(data) {

        let taskId = data.task.id;
        let potentialId = data.task.params.potentialId;
        let cancelReason = data.reason;
        let cancelDescription = data.description;

        // TODO: Aşağıdaki işlemler atomic olsa daha doğru olur.
        this.shiftValidityStartDateOfPotential(potentialId, cancelReason.potentialDeactivationSetting.numberOfDays, (response1) => {

            this.findTask(taskId, (response2) => {

                let params = response2.data.params;
                params.cancelReason = {
                    id: cancelReason.id,
                    name: cancelReason.name
                };
                params.cancelDescription = cancelDescription;

                this.completeTaskWithNewParams(taskId, params, (response3) => {
                    this.setSelectedSalesBoxTaskToBeCancelled(null, () => this.salesBoxCancelModal.close());
                    this.loadInProgressTasks(1);
                });
            });
        });
    }

    getLoadingTasksProperty(taskStatus) {
        let loadingTasks = false;
        if (taskStatus == "NEW") {
            loadingTasks = this.state.loadingNewTasks;
        } else if (taskStatus == "INPROGRESS") {
            loadingTasks = this.state.loadingInProgressTasks;
        } else if (taskStatus == "COMPLETED") {
            loadingTasks = this.state.loadingCompletedTasks;
        }
        return loadingTasks;
    }

    getTasksProperty(taskStatus) {
        let tasks = [];
        if (taskStatus == "NEW") {
            tasks = this.state.newTasks;
        } else if (taskStatus == "INPROGRESS") {
            tasks = this.state.inProgressTasks;
        } else if (taskStatus == "COMPLETED") {
            tasks = this.state.completedTasks;
        }
        return tasks;
    }

    renderTasks(taskStatus) {
        let loadingTasks = this.getLoadingTasksProperty(taskStatus);
        if (loadingTasks) {
            return (
                <Loader size="L"/>
            );
        } else {
            let tasks = this.getTasksProperty(taskStatus);
            if (_.isEmpty(tasks)) {
                return super.translate("No task");
            } else {
                let cells = [];
                tasks.forEach((task, taskIndex) => {
                    cells.push(
                        <GridCell key={task.id} width="1-1" noMargin={true}>
                            {this.renderTask(task, taskIndex)}
                        </GridCell>
                    );
                });
                return (
                    <Grid>
                        {cells}
                        <GridCell width="1-1">
                            {this.renderTaskPagination(taskStatus)}
                        </GridCell>
                    </Grid>
                );
            }
        }
    }

    renderTask(task, taskIndex) {

        let taskType = task.taskType;
        let taskStatus = task.taskStatus;

        if (taskType == "SalesBox") {

            let taskLastUpdateDate = null;
            let taskCompletionDate = null;
            let cancelReason = null;

            if (taskStatus == "INPROGRESS") {
                taskLastUpdateDate = this.renderPropertyOfTask(task, "Task Update Date", "lastUpdated");
            } else if (taskStatus == "COMPLETED") {
                taskCompletionDate = this.renderPropertyOfTask(task, "Task Completion Date", "lastUpdated");
                cancelReason = this.renderPropertyOfTask(task, "Cancel Reason", "params.cancelReason.name");
            }

            return (
                <Grid>
                    {this.renderTaskSeparatorIfNecessary(taskIndex)}
                    {this.renderPropertyOfTask(task, "Task Creation Date", "createDate")}
                    {this.renderPropertyOfTask(task, "Task Type", "taskType")}
                    {taskLastUpdateDate}
                    {taskCompletionDate}
                    {this.renderPropertyOfTask(task, "Campaign", "params.campaignDescription")}
                    {this.renderPropertyOfTask(task, "Account", "params.account.name")}
                    {this.renderPropertyOfTask(task, "From - To", "params.fromToDescription")}
                    {this.renderPropertyOfTask(task, "Shipment Loading Types", "params.shipmentLoadingTypes")}
                    {this.renderPropertyOfTask(task, "Load Weight Types", "params.loadWeightTypes")}
                    {cancelReason}
                    <GridCell width="1-1" hidden={taskStatus != "NEW"}>
                        <div className="uk-align-right">
                            <Button label="Start" waves={true} size="small" onclick={() => this.startTask(task)}/>
                        </div>
                    </GridCell>
                    <GridCell width="1-1" hidden={taskStatus != "INPROGRESS"}>
                        <div className="uk-align-right">
                            <Button label="Cancel" waves={true} size="small" style="danger" onclick={() => this.prepareForSalesBoxTaskCancel(task)}/>
                            <Button label="Go To New Spot Quote" waves={true} size="small"
                                    onclick={() => this.goToNewSpotQuote(task.params.account.id, task.params.potentialId, task.id)}/>
                        </div>
                    </GridCell>
                </Grid>
            );
        } else {

            let taskLastUpdateDate = null;
            let taskCompletionDate = null;

            if (taskStatus == "INPROGRESS") {
                taskLastUpdateDate = this.renderPropertyOfTask(task, "Task Update Date", "lastUpdated");
            } else if (taskStatus == "COMPLETED") {
                taskCompletionDate = this.renderPropertyOfTask(task, "Task Completion Date", "lastUpdated");
            }

            return (
                <Grid>
                    {this.renderTaskSeparatorIfNecessary(taskIndex)}
                    {this.renderPropertyOfTask(task, "Task Id", "id")}
                    {this.renderPropertyOfTask(task, "Task Creation Date", "createDate")}
                    {this.renderPropertyOfTask(task, "Task Type", "taskType")}
                    {taskLastUpdateDate}
                    {taskCompletionDate}
                    <GridCell width="1-1" hidden={taskStatus != "NEW"}>
                        <div className="uk-align-right">
                            <Button label="Start" waves={true} size="small" onclick={() => this.startTask(task)}/>
                        </div>
                    </GridCell>
                </Grid>
            );
        }
    }

    renderPropertyOfTask(task, label, propertyPath) {

        let labelClassName = "uk-text-primary";
        let valueClassName = "uk-text-muted";
        let value = null;

        if (propertyPath == "params.campaignDescription") {
            if (_.get(task, "params.campaign") === true) {
                labelClassName = "uk-text-danger";
                valueClassName = "uk-text-danger";
                value = _.get(task, "params.minPrice") + "-" + _.get(task, "params.maxPrice") + " " + _.get(task, "params.currency.code");
            }
        } else if (propertyPath == "params.fromToDescription") {
            let value1 = super.translate(_.get(task, "params.fromCountry.name"));
            let value2 = super.translate(_.get(task, "params.toCountry.name"));
            value = value1 + " " + _.get(task, "params.fromPostalCode.code") + " - " + value2 + " " + _.get(task, "params.toPostalCode.code");
        } else if (propertyPath == "params.shipmentLoadingTypes" || propertyPath == "params.loadWeightTypes") {
            value = this.convertObjectArrayToString(_.get(task, propertyPath), "name", ", ");
        } else {
            value = super.translate(_.get(task, propertyPath));
        }

        if (_.isNil(value)) {
            return null;
        } else {
            return (
                <GridCell width="1-1">
                    <span>
                        <span className={labelClassName}>{super.translate(label)}:</span>&nbsp;<span className={valueClassName}>{value}</span>
                    </span>
                </GridCell>
            );
        }
    }

    convertObjectArrayToString(array, propertyName, separator) {
        if (_.isEmpty(array)) {
            return "";
        } else {
            return array.map((elem) => super.translate(_.get(elem, propertyName))).join(separator);
        }
    }

    goToNewSpotQuote(accountId, potentialId, taskId) {
        window.open("/ui/crm/#/quote/new/SPOT/ROAD/" + accountId + "/" + potentialId + "?referrerTaskId=" + taskId);
    }

    renderTaskSeparatorIfNecessary(taskIndex) {
        if (taskIndex > 0) {
            return (
                <GridCell width="1-1" noMargin={true}>
                    <hr/>
                </GridCell>
            );
        } else {
            return null;
        }
    }

    renderTaskPagination(taskStatus) {
        if (taskStatus == "NEW") {
            return (
                <Pagination page={this.state.newTasksPageNumber}
                            totalPages={this.state.newTasksPageCount}
                            onPageChange={(pageNumber) => this.loadNewTasks(pageNumber)}
                            range={10}/>
            );
        } else if (taskStatus == "INPROGRESS") {
            return (
                <Pagination page={this.state.inProgressTasksPageNumber}
                            totalPages={this.state.inProgressTasksPageCount}
                            onPageChange={(pageNumber) => this.loadInProgressTasks(pageNumber)}
                            range={10}/>
            );
        } else if (taskStatus == "COMPLETED") {
            return (
                <Pagination page={this.state.completedTasksPageNumber}
                            totalPages={this.state.completedTasksPageCount}
                            onPageChange={(pageNumber) => this.loadCompletedTasks(pageNumber)}
                            range={10}/>
            );
        } else {
            return null;
        }
    }

    getClassNameForTabButton(tabNo) {
        if (tabNo == this.state.activeTabNo) {
            return "primary";
        } else {
            return null;
        }
    }

    render() {

        let tasks;
        if (this.state.activeTabNo == 1) {
            tasks = this.renderTasks("NEW");
        } else if (this.state.activeTabNo == 2) {
            tasks = this.renderTasks("INPROGRESS");
        } else if (this.state.activeTabNo == 3) {
            tasks = this.renderTasks("COMPLETED");
        }

        return (
            <Card>
                <Grid divider={true} removeTopMargin={true}>
                    <GridCell width="1-3" noMargin={true} textCenter={true}>
                        <Button flat={true} label="New Tasks" onclick={() => this.loadNewTasks(1)} style={this.getClassNameForTabButton(1)}/>
                    </GridCell>
                    <GridCell width="1-3" noMargin={true} textCenter={true}>
                        <Button flat={true} label="In Progress Tasks" onclick={() => this.loadInProgressTasks(1)} style={this.getClassNameForTabButton(2)}/>
                    </GridCell>
                    <GridCell width="1-3" noMargin={true} textCenter={true}>
                        <Button flat={true} label="Completed Tasks" onclick={() => this.loadCompletedTasks(1)} style={this.getClassNameForTabButton(3)}/>
                    </GridCell>
                    <GridCell width="1-1" noMargin={true}>
                        {tasks}
                    </GridCell>
                    <GridCell width="1-1" noMargin={true}>
                        <SalesBoxCancelModal ref={(c) => this.salesBoxCancelModal = c}
                                             task={this.state.selectedSalesBoxTaskToBeCancelled}
                                             onSave={(data) => this.cancelSalesBoxTask(data)}
                                             onCancel={() => this.quitSalesBoxTaskCancel()}/>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}

Tasks.contextTypes = {
    translator: PropTypes.object
};
