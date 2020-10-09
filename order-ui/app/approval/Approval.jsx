import React from "react";
import {TaskService} from "../services";
import {Notify} from "susam-components/basic";
import {Grid, GridCell, PageHeader, Card} from "susam-components/layout";

export class Approval extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            tasks: []
        };
    }

    componentWillMount() {
        this.loadTasks();
    }

    loadTasks() {
        TaskService.getMyActiveTasks().then(response => {
            let tasks = response.data.filter(task => {
                return task.taskStatus != "COMPLETED";
            });

            this.setState({tasks: tasks});
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    goToOrder(transportOrderId) {
        window.open("/ui/order/order-page?orderId=" + transportOrderId);
    }

    respondHelper(task, approvalResult) {
        TaskService.respond(task.id, approvalResult).then(response => {
            this.loadTasks();
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    respond(task, approvalResult) {
        TaskService.getNextStates(task.id).then(response => {
            let nextStateIsInProgress = false;
            response.data.forEach((item) => {
                if (item == TaskService.IN_PROGRESS) {
                    nextStateIsInProgress = true;
                }
            });

            if (nextStateIsInProgress) {
                TaskService.changeStatusInProgress(task.id).then((response) => {
                    this.respondHelper(task, approvalResult);
                }).catch((error) => {
                    Notify.showError(error);
                });
            } else {
                this.respondHelper(task, approvalResult);
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }

    renderTask(task) {
        return (
            <li>
                <div className="md-list-addon-element" style={{width: "80px"}}>
                    <a href="javascript:void(0)" onClick={() => this.respond(task, true)}>
                        <i className="md-list-addon-icon material-icons uk-text-success md-36">check_circle</i>
                    </a>
                    <a href="javascript:void(0)" onClick={() => this.respond(task, false)}>
                        <i className="md-list-addon-icon material-icons uk-text-danger md-36">cancel</i>
                    </a>
                </div>
                <div className="md-list-content">
                    <span className="md-list-heading">Order Approval</span>
                    <span className="uk-text-small uk-text-muted">Approval reason will appear here</span>
                    <span className="uk-text-small uk-text-muted">
                        <a href="javascript:void(0)" onClick={() => this.goToOrder(task.params.transportOrder.id)}>Go to Order</a>
                    </span>
                </div>
            </li>
        );
    }

    render() {
        let tasks = [];

        if (this.state.tasks && this.state.tasks.length > 0) {
            tasks = this.state.tasks.map(task => {
                return this.renderTask(task);
            });
        } else {
            tasks.push(
                <div>There are no awaiting approvals</div>
            );
        }

        return (
            <div>
                <PageHeader title="Approvals" translate={true}/>
                <Grid>
                    <GridCell width="1-2">
                        <Card>
                            <ul className="md-list md-list-addon md-list-right">
                                {tasks}
                            </ul>
                        </Card>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}