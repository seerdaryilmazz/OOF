import React from 'react';
import * as axios from 'axios';

import {Grid, GridCell,Modal} from 'susam-components/layout';
import {Button, Notify} from 'susam-components/basic';
import {DateTime} from 'susam-components/advanced';
import {OrderRequestService, TaskService, OrderService, BillingService} from '../services/';

export class CustomerRepTasks extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            tasks: []
        };
    }
    componentDidMount(){
        UIkit.domObserve('#tasksTab', function(element) {});
        this.loadTasks();
    }
    componentDidUpdate(){
        UIkit.domObserve('#tasksTab', function(element) {});
    }

    loadTasks() {
        TaskService.getMyActiveTasks().then(response => {

            let tasks = response.data.filter(task =>
                task.taskType == TaskService.TYPE_CONFIRMORDER &&
                (task.taskStatus === TaskService.NEW || task.taskStatus === TaskService.IN_PROGRESS)
            );

            this.setState({
                tasks: tasks
            });

        }).catch(error => {
            Notify.showError(error);
        });
    }

    refreshTasks(e){
        e && e.preventDefault();
        this.loadTasks();
    };

    render(){
        return (
            <div id="tasksTab" className="md-card">
                <div className="md-card-content" data-uk-observe>
                    <ul className="uk-tab" data-uk-tab="{connect:'#tasks_content', animation:'fade'}" id="tasks_tabs">
                        <li className="uk-width-1-3 uk-active"><a href="#">Confirmation Tasks</a></li>
                    </ul>
                    <ul id="tasks_content" className="uk-switcher uk-margin">
                        <li>
                            <TaskList tasks={this.state.tasks} onupdate={() => this.refreshTasks()}/>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}
export class TaskList extends React.Component{

    handleRowUpdate(){
        this.props.onupdate && this.props.onupdate();
    }

    render(){
        let tasks = "";
        if(this.props.tasks){
            tasks = this.props.tasks.map(task =>
                <TaskRow key={task.id} task={task} onupdate = {() => this.handleRowUpdate()}/>
            );
        }

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


export class TaskRow extends React.Component{

    confirm(event){
        event.preventDefault();
        TaskService.claim(this.props.task.id).then(response => {
            this.dateConfirmationModal.show();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    completeTask(){
        TaskService.completeTask(this.props.task.id).then(response => {
            Notify.showSuccess("Task is completed");
            this.props.onupdate && this.props.onupdate();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updateTaskStatus(){
        TaskService.getNextStates(this.props.task.id).then(response => {
            let nextStateIsInProgress = false;
            response.data.forEach((item) => {
                if(item == TaskService.IN_PROGRESS){
                    nextStateIsInProgress = true;
                }
            });
            if(nextStateIsInProgress){
                TaskService.changeStatusInProgress(this.props.task.id).then((response) => {
                    this.completeTask();
                }).catch((error) => {
                    Notify.showError(error);
                });
            }else{
                this.completeTask();
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render(){
        let taskName = "";
        if(this.props.task.params){
            if(this.props.task.params.customer){
                taskName = taskName + " " + this.props.task.params.customer.name;
            }else{
                taskName = taskName + " " + this.props.task.params.customerId;
            }
        }

        return (
            <li>
                <div className="md-list-addon-element">
                    <i className="md-list-addon-icon uk-icon-check-circle" style={{color:'#2196f3'}}/>
                </div>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width="2-3" noMargin = {true}>
                            <Grid >
                                <GridCell width="1-1" noMargin = {true}>
                                    <span className="md-list-heading">{taskName}</span>
                                </GridCell>
                                <GridCell width="1-1" noMargin = {true}>
                                    Due To: {this.props.task.dueDate}
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-3" noMargin={true}>
                            <span className="uk-text-small uk-text-muted uk-text-truncate">
                                <a className="md-btn md-btn-flat md-btn-small uk-float-right" onClick={(event) => this.confirm(event)}>Confirm Order</a>
                            </span>
                        </GridCell>
                    </Grid>
                    <ReadyDateConfirmationModal ref = {(c) => this.dateConfirmationModal = c}
                                                orderRequestId={this.props.task.params.orderRequest.id}
                                                value = {this.props.task.params.orderRequest.readyAtDate}
                                                onsave = {() => this.updateTaskStatus()} />
                </div>
            </li>
        );
    }
}


export class ReadyDateConfirmationModal extends React.Component{

    constructor(props) {
        super(props);
        this.state = {readyAtDate: this.props.value};
    }

    updateState(value){
        this.setState({readyAtDate: value});
    }
    handleSave() {
        OrderService.confirmOrderRequest(this.props.orderRequestId, this.state.readyAtDate).then(response => {
            Notify.showSuccess("Order ready date confirmed");
            this.props.onsave && this.props.onsave();
            this.modal.close();
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleClose(){
        this.modal.close();

    }
    show(){
        this.modal.open();
    }

    render(){
        return (
            <Modal title="Confirm Ready Date" ref = {(c) => this.modal = c} medium={true}
                   actions = {[{label:"Close", action:() => this.handleClose()},
                       {label:"Save", buttonStyle:"primary", action:() => this.handleSave()}]}>
                <Grid>
                    <GridCell width="1-1">
                        <DateTime label="Ready At Date" onchange={(val)=> this.updateState(val) }
                                  value={this.state.readyAtDate}/>
                    </GridCell>
                </Grid>
            </Modal>
        );

    }

}


