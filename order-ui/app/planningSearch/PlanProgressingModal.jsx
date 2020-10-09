import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { DateTime } from 'susam-components/advanced';
import { Button, Notify } from "susam-components/basic";
import { Grid, GridCell, Modal } from "susam-components/layout";
import { UserService } from "../services";


export class PlanProgressingModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};

    }

    componentWillMount() {
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    openFor(label, tripPlanId, tripStop, timezone, progressFunction) {

        UserService.getCurrentTime(timezone).then(response => {
            this.setState({
                    label: label,
                    tripPlanId: tripPlanId,
                    tripStop: _.cloneDeep(tripStop),
                    date: response.data,
                    progressFunction: progressFunction
                },
                () => {
                    this.modal.open();
                });
        }).catch(error => {
            Notify.showError(error);
        });

    }

    close() {
        this.setState({label: null, tripPlanId: null, tripStop: null, date: null, progressFunction: null},
            () =>{this.modal.close();
        })
    }

    handleProgressTripPlan() {
        this.state.progressFunction(this.state.tripPlanId, this.state.tripStop, this.state.date);
    }

    render() {

        let label = this.state.label;
        let tripPlanId = this.state.tripPlanId;
        let tripStop = this.state.tripStop;
        let date = this.state.date;

        return (
            <Modal title={this.props.title} ref={(c) => this.modal = c} >
                <Grid>
                    <GridCell>
                        <DateTime label={label} value={date} timeAsTextInput = {true}
                            onchange={(value) => {this.setState({date: value})}} />
                    </GridCell>
                    <GridCell>
                        <Button style="close" label="Close"
                                onclick={() => {
                                    this.close()
                                }}/>
                        <Button style="success" label="Save"
                                onclick={() => {
                                    this.handleProgressTripPlan(tripPlanId, tripStop, date)
                                }}/>
                    </GridCell>
                </Grid>
            </Modal>
        )
    }

}

PlanProgressingModal.contextTypes = {
    translator: React.PropTypes.object
};
