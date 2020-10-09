import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { WorkingHour } from 'susam-components/advanced';
import { Notify } from 'susam-components/basic';
import { CardHeader, Grid, GridCell } from "susam-components/layout";


export class WorkingHours extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            workingHours: []
        }
    }

    componentDidMount() {
        this.initializeState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {
        let state = _.cloneDeep(this.state);
        if (props.workingHours) {
            state.workingHours =  props.workingHours;
        }
        this.setState(state);
    }

    updateData(workingHours) {
        workingHours.forEach(wh => {
            let existingWorkDay = _.find(this.state.workingHours, {day: {code: wh.day.code}});
            wh.id = existingWorkDay ? existingWorkDay.id : null;
        });
        this.setState({workingHours: workingHours});
    }

    next() {
        let isRequired = _.isNil(this.props.isRequired) ? true : this.props.isRequired;
        return new Promise(
            (resolve, reject) => {
                if(isRequired && (!this.state.workingHours || this.state.workingHours.length == 0)) {
                    Notify.showError("Working Hours can not be empty");
                    reject();
                } else {
                    this.props.handleSave && this.props.handleSave(this.state.workingHours);
                    resolve(true);
                }
            });
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Working Hour"/>
                </GridCell>
                <GridCell width="1-1">
                    <WorkingHour startHour="00:00" endHour="23:30" inteval={30}
                                 data={this.state.workingHours}
                                 days={["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]}
                                 ratio={2}
                                 dataUpdateHandler={(data) => this.updateData(data)}/>
                </GridCell>
            </Grid>
        );
    }
}