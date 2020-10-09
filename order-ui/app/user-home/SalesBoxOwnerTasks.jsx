import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {Grid, GridCell} from 'susam-components/layout';
import {Button, Notify} from 'susam-components/basic';

import {TaskService, CrmAccountService} from '../services';
import {SalesBoxCancelModal} from './SalesBoxCancelModal';

const PURPOSE_OF_SELECTION_CANCEL = "cancel";

export class SalesBoxOwnerTasks extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            salesBoxTasks: []
        };
    }

    componentDidMount() {
        UIkit.domObserve('#tasksTab', function(element) {});
        this.loadTasks();
    }

    componentDidUpdate() {
        UIkit.domObserve('#tasksTab', function(element) {});
    }

    loadTasks() {

        TaskService.getMyActiveTasks().then(response => {

            let tasks = response.data;
            let salesBoxTasks = [];

            tasks.forEach((task) => {
                if (task.taskType == TaskService.TYPE_SALES_BOX &&
                        (task.taskStatus === TaskService.NEW || task.taskStatus === TaskService.IN_PROGRESS)) {
                    salesBoxTasks.push(task);
                }
            });

            this.setState({
                salesBoxTasks: salesBoxTasks
            });

        }).catch(error => {
            Notify.showError(error);
        });
    }

    refreshTasks(e) {
        e && e.preventDefault();
        this.loadTasks();
    };

    setSelectedTask(task, key, purposeOfSelection) {
        this.setState({selectedTask: task, keyForSelectedTask: key, purposeOfSelection: purposeOfSelection});
    }

    findPotential(potentialId, callback) {
        CrmAccountService.findPotential(potentialId).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updatePotential(potential, callback) {
        CrmAccountService.updatePotential(potential).then(response => {
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

    doCancelTask(data) {

        let taskId = data.task.id;
        let potentialId = data.task.params.potentialId;
        let cancelReason = data.reason;
        let cancelDescription = data.description;

        // TODO: Aşağıdaki işlemler atomic olsa daha sağlam olur.
        this.findPotential(potentialId, (response1) => {

            let potential = response1.data;
            potential.status = {code: "PASSIVE"};

            this.updatePotential(potential, (response2) => {

                this.findTask(taskId, (response3) => {

                    let params = response3.data.params;
                    params.cancelReason = {id: cancelReason.id, name: cancelReason.name};
                    params.cancelDescription = cancelDescription;

                    this.completeTaskWithNewParams(taskId, params, (response4) => {
                        this.setSelectedTask(null, null, null);
                        this.refreshTasks();
                    });
                });
            });
        });
    }

    renderCancelModal() {
        if (!_.isNil(this.state.selectedTask) && this.state.purposeOfSelection == PURPOSE_OF_SELECTION_CANCEL) {
            return (
                <SalesBoxCancelModal key={this.state.keyForSelectedTask}
                                     task={this.state.selectedTask}
                                     onSave={(data) => this.doCancelTask(data)}
                                     onCancel={() => this.setSelectedTask(null, null, null)}/>
            );
        } else {
            return null;
        }
    }

    render() {
        return (
            <div id="tasksTab" className="md-card">
                <div className="md-card-content" data-uk-observe>
                    <ul className="uk-tab" data-uk-tab="{connect:'#tasks_content', animation:'fade'}" id="tasks_tabs">
                        <li className="uk-width-1-3"><a href="#">Sales Box Tasks</a></li>
                    </ul>
                    <ul id="tasks_content" className="uk-switcher uk-margin">
                        <li>
                            <TaskList tasks={this.state.salesBoxTasks}
                                      onupdate={() => this.refreshTasks()}
                                      oncancel={(task) => this.setSelectedTask(task, uuid.v4(), PURPOSE_OF_SELECTION_CANCEL)}/>
                        </li>
                    </ul>
                </div>
                {this.renderCancelModal()}
            </div>
        );
    }
}

export class TaskList extends React.Component {

    render() {

        let tasks = this.props.tasks.map(task =>
            <TaskRow key={task.id} task={task} onupdate={this.props.onupdate} oncancel={this.props.oncancel}/>
        );

        return (
            <div className="uk-margin-medium-bottom">
                <a className="md-btn md-btn-small md-btn-flat md-btn-flat-primary md-btn-wave waves-effect waves-button"
                   href="" onClick={this.props.refresh}><i className="uk-icon-refresh" style={{color:'#2196f3'}}/> Refresh</a>
                <ul className="md-list md-list-addon">
                    {tasks}
                </ul>
            </div>
        );
    }
}

export class TaskRow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            task: _.cloneDeep(props.task)
        };
    }

    cancel() {
        this.props.oncancel(this.state.task);
    }

    start() {
        // TODO: Bu iki işlem beraber yapılsa ve atomic olsa daha sağlam olur.
        TaskService.claim(this.state.task.id).then(response => {
            TaskService.changeStatusInProgress(this.state.task.id).then(responseInner => {
                this.setState({task: responseInner.data});
            }).catch(error => {
                Notify.showError(error);
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    goToNewSpotQuote(accountId, potentialId, taskId) {
        window.open("/ui/crm/#/quote/new/SPOT/" + accountId + "/" + potentialId + "?referrerTaskId=" + taskId);
    }

    convertObjectArrayToString(array, propertyName, separator) {
        if (_.isEmpty(array)) {
            return "";
        } else {
            return array.map((elem) => _.get(elem, propertyName)).join(separator);
        }
    }

    render() {

        let task = this.state.task;
        let params = task.params;

        return (
            <li>
                <div className="md-list-addon-element">
                    <i className="md-list-addon-icon uk-icon-tasks" style={{color:'#2196f3'}}/>
                </div>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            Sales Box Task: {task.id}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true}>
                            Task Creation Date: {task.createDate}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={_.isNil(params.account)}>
                            Account: {params.account.name}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={_.isNil(params.fromCountry)}>
                            From Country: {params.fromCountry.iso} - {params.fromCountry.name}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={_.isNil(params.fromPostalCodes)}>
                            From Postal Codes: {params.fromPostalCodes}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={_.isNil(params.toCountry)}>
                            To Country: {params.toCountry.iso} - {params.toCountry.name}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={_.isNil(params.toPostalCodes)}>
                            To Postal Codes: {params.toPostalCodes}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={_.isEmpty(params.payWeights)}>
                            Pay Weights: {this.convertObjectArrayToString(params.payWeights, "name", ", ")}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={_.isEmpty(params.loadWeightTypes)}>
                            Load Weight Types: {this.convertObjectArrayToString(params.loadWeightTypes, "name", ", ")}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={task.taskStatus == "INPROGRESS"}>
                            <div className="uk-align-right">
                                <Button label="Start" waves={true} flat={true} size="small" onclick={() => this.start()}/>
                            </div>
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={task.taskStatus == "NEW"}>
                            <div className="uk-align-right">
                                <Button label="Cancel" waves={true} flat={true} size="small" style="danger" onclick={() => this.cancel()}/>
                                <Button label="Go To New Spot Quote" waves={true} flat={true} size="small"
                                        onclick={() => this.goToNewSpotQuote(params.account.id, params.potentialId, task.id)}/>
                            </div>
                        </GridCell>
                    </Grid>
                </div>
            </li>
        );
    }
}


