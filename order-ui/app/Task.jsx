import React from 'react';
import * as axios from 'axios';

import {Grid, GridCell,Modal} from 'susam-components/layout';
import {Button, Notify} from 'susam-components/basic';
import {DateTime} from 'susam-components/advanced';
import {OrderRequestService, TaskService, OrderService} from './services/';

export class TaskCard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            todoTasks:[],
            inProgressTasks:[],
            completedTasks:[]
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
            this.setState({
                todoTasks: response.data.filter(task => task.taskStatus === TaskService.NEW),
                inProgressTasks: response.data.filter(task => task.taskStatus === TaskService.IN_PROGRESS),
                completedTasks: response.data.filter(task => task.taskStatus === TaskService.COMPLETED)
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    refreshTasks = (e) => {
        e.preventDefault();
        this.loadTasks();
    };

    render(){
        return (
            <div id="tasksTab" className="md-card">
                <div className="md-card-content" data-uk-observe>
                    <ul className="uk-tab" data-uk-tab="{connect:'#tasks_content', animation:'fade'}" id="tasks_tabs">
                        <li className="uk-width-1-3 uk-active"><a href="#">New</a></li>
                        <li className="uk-width-1-3"><a href="#">In Progress</a></li>
                        <li className="uk-width-1-3"><a href="#">Completed</a></li>
                    </ul>
                    <ul id="tasks_content" className="uk-switcher uk-margin">
                        <li>
                            <TaskList tasks={this.state.todoTasks} status={TaskService.NEW} refresh={() => this.refreshTasks()}/>
                        </li>
                        <li>
                            <TaskList tasks={this.state.inProgressTasks} status={TaskService.IN_PROGRESS} refresh={() => this.refreshTasks()}/>
                        </li>
                        <li>
                            <TaskList tasks={this.state.completedTasks} status={TaskService.COMPLETED} refresh={() => this.refreshTasks()}/>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}
export class TaskList extends React.Component{

    render(){
        let tasks = "";
        if(this.props.tasks){
            tasks = this.props.tasks.map(task =>
                <TaskRow key={task.id} task={task}/>
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
        this.dateConfirmationModal.show();


    }

    updateTaskStatusIfNecessary(taskId){

        TaskService.getNextStates(taskId).then(response => {
            let nextStateIsInProgress = false;
            response.data.forEach((item) => {
                if(item == TaskService.IN_PROGRESS){
                    nextStateIsInProgress = true;
                }
            });
            if(nextStateIsInProgress){
                TaskService.changeStatusInProgress(taskId).then((response) => {
                    Notify.showSuccess("Task status updated to In Progress");
                }).catch((error) => {
                    Notify.showError(error);
                });
            }
        }).catch(error => {
            Notify.showError(error);
        });

    }

    completeTask(task){
        this.updateTaskStatusIfNecessary(task.id);
        if(task.taskStatus == TaskService.IN_PROGRESS){
            TaskService.completeTask(task.id).then(response => {
                Notify.showSuccess("Task is completed");
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    openTask() {
        if (!this.props.task.assignedTo) {
            TaskService.claim(this.props.task.id).then(response => {
                window.location.href = this.props.task.taskUrl;
            }).catch(error => {
                Notify.showError(error);
            });
        } else {
            window.location.href = this.props.task.taskUrl;
        }
    }

    decideActionAccordingToTaskType(){
        let taskType = this.props.task.taskType;
        let taskUrl = this.props.task.taskUrl;
        let taskId = this.props.task.id;
        if(taskType == TaskService.TYPE_CONFIRMORDER) {
            return ( <GridCell width="1-2" noMargin={true}>
                    <span className="uk-text-small uk-text-muted uk-text-truncate">
                    <a className="md-btn md-btn-flat md-btn-small uk-float-right" onClick={(event) => this.confirm(event)}>Confirm Task</a>
                    </span>
            </GridCell>

            );
        }
    else
        return (<GridCell width="1-2" noMargin = {true}>
                            <span className="uk-text-small uk-text-muted uk-text-truncate">
                                <a className="md-btn md-btn-flat md-btn-small uk-float-right" onClick={() => this.openTask()}>Start Task</a>
                            </span>
        </GridCell>);


    }


    render(){
        let taskUrl = this.props.task.taskUrl;
        let taskName = "";
        let priorityBadge = "";
        if(this.props.task.priority && this.props.task.priority != -1){
            priorityBadge = <span className="uk-badge uk-badge-notification">{this.props.task.priority}</span>
        }
        let typeBadge = "";
        if(this.props.task.params){
            if(this.props.task.params.orderType){
                typeBadge = <span className="uk-badge uk-badge-outline">{this.props.task.params.orderType.name}</span>;
            }
            if(this.props.task.params.customer){
                taskName = taskName + " " + this.props.task.params.customer.name;
            }else{
                taskName = taskName + " " + this.props.task.params.customerId;
            }
            if (this.props.task.params.orderRequest && this.props.task.params.orderRequest.id) {
                taskName = taskName + " (Order Request: " + this.props.task.params.orderRequest.id + ")";
            }
        }
        let taskTypeButton = this.decideActionAccordingToTaskType();

        return (
            <li>
                <div className="md-list-addon-element">
                    <i className="md-list-addon-icon uk-icon-tasks" style={{color:'#2196f3'}}/>
                </div>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width="9-10" noMargin = {true}>
                            <span className="md-list-heading">{this.props.task.name} - {taskName}</span>
                        </GridCell>
                        <GridCell width="1-10" noMargin = {true}>
                            {priorityBadge}
                        </GridCell>
                        <GridCell width="1-1" noMargin = {true}>
                            Due To: {this.props.task.dueDate}
                        </GridCell>
                        <GridCell width="1-2" noMargin = {true}>
                            {typeBadge}
                        </GridCell>

                        {taskTypeButton}

                    </Grid>
                    <ReadyDateConfirmationModal ref = {(c) => this.dateConfirmationModal = c}
                                                onsave = {(task) => this.completeTask(task)} />
                </div>
            </li>
        );
    }
}

export class ReadyDateConfirmationModal extends React.Component{

    constructor(props) {
        super(props);
        this.state = {readyAtDate: ""};
    }

    updateState(value){
        this.setState({readyAtDate: value});
    }
    handleSave() {
        OrderService.confirmReadyDate().then(response => {
            Notify.showSuccess("Order ready date confirmed");
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


