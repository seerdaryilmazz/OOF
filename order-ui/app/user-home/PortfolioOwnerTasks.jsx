import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {Grid, GridCell} from 'susam-components/layout';
import {Button, Notify} from 'susam-components/basic';

import {TaskService, BillingService} from '../services';

export class PortfolioOwnerTasks extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            provisionTasks: []
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
            let provisionTasks = [];

            tasks.forEach((task) => {
                if (task.taskType == TaskService.TYPE_HANDLE_PROVISION_CREATION_FAILURE &&
                        (task.taskStatus === TaskService.NEW || task.taskStatus === TaskService.IN_PROGRESS)) {
                    provisionTasks.push(task);
                }
            });

            this.setState({
                provisionTasks: provisionTasks
            });

        }).catch(error => {
            Notify.showError(error);
        });
    }

    refreshTasks(e) {
        e && e.preventDefault();
        this.loadTasks();
    };

    render() {
        return (
            <div id="tasksTab" className="md-card">
                <div className="md-card-content" data-uk-observe>
                    <ul className="uk-tab" data-uk-tab="{connect:'#tasks_content', animation:'fade'}" id="tasks_tabs">
                        <li className="uk-width-1-3"><a href="#">Provision Tasks</a></li>
                    </ul>
                    <ul id="tasks_content" className="uk-switcher uk-margin">
                        <li><ProvisionTaskList tasks={this.state.provisionTasks} onupdate={() => this.refreshTasks()}/></li>
                    </ul>
                </div>
            </div>
        );
    }
}

export class ProvisionTaskList extends React.Component {

    render() {

        let tasks = this.props.tasks.map(task =>
            <ProvisionTaskRow key={task.id} task={task} onupdate={this.props.onupdate}/>
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

export class ProvisionTaskRow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            task: _.cloneDeep(props.task)
        };
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

    complete() {

        let data = {
            orderId: this.state.task.params.orderId
        };

        // TODO: Bu iki işlem beraber yapılsa ve atomic olsa daha sağlam olur.
        BillingService.produceProvisionsOfOrderCanBeCreatedEvent(data).then(response => {
            TaskService.completeTask(this.state.task.id).then(responseInner => {
                this.props.onupdate();
            }).catch(error => {
                Notify.showError(error);
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    goToOrder(orderId) {
        window.open("/ui/order/order-page?orderId=" + orderId);
    }

    goToContract(contractId) {
        window.open("/ui/billing/#/contract/" + contractId);
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
                            Provision Creation Failure
                        </GridCell>
                        <GridCell width="1-1" noMargin={true}>
                            Task Creation Date: {task.createDate}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={_.isNil(params.customerName)}>
                            Customer: {params.customerName}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={_.isNil(params.orderId)}>
                            Order Id: {params.orderId}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={_.isNil(params.contractName)}>
                            Contract: {params.contractName}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={_.isNil(params.shipmentCode)}>
                            Shipment: {params.shipmentCode}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={!params.message}>
                            Message: {params.message}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={task.taskStatus == "INPROGRESS"}>
                            <div className="uk-align-right">
                                <Button label="Start" waves={true} flat={true} size="small" onclick={() => this.start()}/>
                            </div>
                        </GridCell>
                        <GridCell width="1-1" noMargin={true} hidden={task.taskStatus == "NEW"}>
                            <div className="uk-align-right">
                                <Button label="Go To Order" waves={true} flat={true} size="small" onclick={() => this.goToOrder(params.orderId)}/>
                                <Button label="Go To Contract" waves={true} flat={true} size="small" onclick={() => this.goToContract(params.contractId)} disabled={!params.contractId}/>
                                <Button label="Complete" waves={true} flat={true} size="small" onclick={() => this.complete()}/>
                            </div>
                        </GridCell>
                    </Grid>
                </div>
            </li>
        );
    }
}


