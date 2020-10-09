import _ from "lodash";
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {Time} from 'susam-components/advanced';
import * as DataTable from 'susam-components/datatable';

import {RouteService, CommonService} from "../../services";

export class RouteLegNonSchedule extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {nonSchedule: {}, durations: []};
        for(let counter = 0; counter <= (7 * 24 * 60); counter+=30){
            let time = convertMinutesToTime(counter);
            this.state.durations.push({id: time, name: time});
        }
    }

    componentDidMount(){

    }
    componentWillReceiveProps(nextProps){

    }

    updateState(key, value){
        let nonSchedule = _.cloneDeep(this.state.nonSchedule);
        nonSchedule[key] = value;
        this.setState({nonSchedule: nonSchedule});
    }

    calculateDurationInMinutes(time){
        let hours = time.split(":")[0];
        let minutes = time.split(":")[1];
        return (parseInt(hours) * 60) + (parseInt(minutes));
    }

    handleSaveScheduleClick() {
        if (!this.form.validate()) {
            return;
        }
        let nonSchedules = _.cloneDeep(this.props.nonSchedules);
        let nonSchedule = _.cloneDeep(this.state.nonSchedule);

        nonSchedule.companyName = _.get(nonSchedule, "company.name");
        nonSchedule.companyId = _.get(nonSchedule, "company.id");
        nonSchedule.duration = this.calculateDurationInMinutes(nonSchedule.time.id);

        if(!nonSchedules){
            nonSchedules = [];
        }
        if(nonSchedule._key){
            let index = _.findIndex(nonSchedules, {_key: nonSchedule._key});
            if(index != -1){
                nonSchedules[index] = nonSchedule;
            }
            this.setState({nonSchedule: {}});
        }else{
            nonSchedule._key = uuid.v4();
            nonSchedules.push(nonSchedule);
        }
        this.props.onchange && this.props.onchange(nonSchedules);

    }

    handleEditScheduleClick(value){
        if(!value.company){
            value.company = {id: value.companyId, name: value.companyName};
        }
        value.time = {id: convertMinutesToTime(value.duration)};
        this.setState({nonSchedule: value});
    }
    handleDeleteScheduleClick(value){
        Notify.confirm("Are you sure?", () => {
            let nonSchedules = _.cloneDeep(this.props.nonSchedules);
            _.remove(nonSchedules, {_key: value._key});
            this.props.onchange && this.props.onchange(nonSchedules);
        });
    }

    render(){

        let saveLabel = "add";
        if(this.state.nonSchedule._key){
            saveLabel = "save";
        }

        return (
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <CardHeader title="Non Scheduled"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-5">
                                <DropDown label="Duration"
                                          options = {this.state.durations}
                                          placeholder = "hh:mm"
                                          value = {this.state.nonSchedule.time}
                                          onchange = {(value) => this.updateState("time", value)}
                                          required = {true}/>
                            </GridCell>
                            <GridCell width="3-5">
                                <CompanySearchAutoComplete label="Company"
                                                           onchange = {(value) => this.updateState("company", value)}
                                                           value={this.state.nonSchedule.company}/>
                            </GridCell>
                            <GridCell width="1-5">
                                <div className="uk-align-right">
                                    <Button label={saveLabel} waves = {true} style="success" size="small"
                                            onclick = {() => {this.handleSaveScheduleClick()}} />
                                </div>
                            </GridCell>

                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    <DataTable.Table data={this.props.nonSchedules} sortable = {true}>
                        <DataTable.Text header="Duration" width="30" sortable = {true} reader = {new DurationReader()}/>
                        <DataTable.Text field="companyName" header="Company" width="50" sortable = {true}/>
                        <DataTable.ActionColumn >
                            <DataTable.ActionWrapper track="onclick"
                                                     onaction={(item) => {this.handleEditScheduleClick(item)}}>
                                <Button label="Edit" flat={true} style="success" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper track="onclick"
                                                     onaction={(item) => {this.handleDeleteScheduleClick(item)}}>
                                <Button label="Delete" flat={true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>

            </Grid>
        );
    }
}

class DurationReader{
    readCellValue(row) {
        if(row.duration){
            return convertMinutesToTime(row.duration);
        }
        return "";
    }
    readSortValue(row) {
        return row.duration;
    }
}

function convertMinutesToTime(value){
    let hours = parseInt(value / 60);
    hours = hours < 10 ? ("0" + hours) : ("" + hours);
    let minutes = parseInt(value % 60);
    minutes = minutes < 10 ? ("0" + minutes) : ("" + minutes);
    return hours + ":" + minutes;

}