import _ from "lodash";
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {DayAndTimeRange, NumericInput} from 'susam-components/advanced';
import * as DataTable from 'susam-components/datatable';

import {RouteService, CommonService} from "../../services";



export class RouteLegSchedule extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {schedule: this.newSchedule()};
    }

    newSchedule(){
        return {timetable:{start:{timezone: ""}, end:{timezone: ""}}};
    }
    componentDidMount(){
        this.initialize(this.props);
        CommonService.getDaysOfWeek().then(response => {
            this.setState({daysOfWeek: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }
    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }

    initialize(props){
        let schedule = _.cloneDeep(this.state.schedule);
        if(props.from){
            schedule.timetable.start.timezone = props.from.timezone;
        }
        if(props.to){
            schedule.timetable.end.timezone = props.to.timezone;
        }
        this.setState({schedule: schedule});
    }

    updateScheduleState(key, value){
        let schedule = _.cloneDeep(this.state.schedule);
        _.set(schedule, key, value);
        this.setState({schedule: schedule});
    }

    handleSaveScheduleClick(){
        if(!this.form.validate()){
            return;
        }
        let schedules = _.cloneDeep(this.props.schedules);
        let schedule = _.cloneDeep(this.state.schedule);

        schedule.companyName = _.get(schedule, "company.name");
        schedule.companyId = _.get(schedule, "company.id");
        schedule.departureDay = _.get(schedule, "timetable.start.day");
        schedule.departureTime = _.get(schedule, "timetable.start.time");
        schedule.arrivalDay = _.get(schedule, "timetable.end.day");
        schedule.arrivalTime = _.get(schedule, "timetable.end.time");
        schedule.duration = _.get(schedule, "timetable.duration");
        if(schedule.departureTime){
            schedule.departureTime = schedule.departureTime.split(" ")[0];
        }
        if(schedule.arrivalTime){
            schedule.arrivalTime = schedule.arrivalTime.split(" ")[0];
        }

        if(!schedules){
            schedules = [];
        }
        if(schedule._key){
            let index = _.findIndex(schedules, {_key: schedule._key});
            if(index != -1){
                schedules[index] = schedule;
            }
            this.setState({schedule: this.newSchedule()});
        }else{
            schedule._key = uuid.v4();
            schedules.push(schedule);
        }
        this.props.onchange && this.props.onchange(schedules);
    }
    handleEditScheduleClick(value){
        if(!value.company){
            value.company = {id: value.companyId, name: value.companyName};
        }
        if(!value.timetable) {
            value.timetable = {};
            value.timetable.start = {day: value.departureDay, time: value.departureTime, timezone: this.props.from.timezone};
            value.timetable.end = {day: value.arrivalDay, time: value.arrivalTime, timezone: this.props.to.timezone};
            value.timetable.duration = value.duration;
        }
        this.setState({schedule: value});
    }
    handleDeleteScheduleClick(value){
        Notify.confirm("Are you sure?", () => {
            let schedules = _.cloneDeep(this.props.schedules);
            _.remove(schedules, {_key: value._key});
            this.props.onchange && this.props.onchange(schedules);
        });
    }

    renderTableColumns(){
        let columns = [];
        columns.push(<DataTable.Text key="companyName" field="companyName" header="Company" width="30" sortable = {true}/>);
        if(this.props.type.code == RouteService.SEAWAY){
            columns.push(<DataTable.Text key="ferryName" field="ferryName" header="Ferry Name" width="20" sortable = {true}/>);
        }
        columns.push(<DataTable.Text key="capacity" field="capacity" header="Capacity" width="10" sortable = {true}/>);
        columns.push(<DataTable.Text key="departure" header="Departure" width="20" sortable = {true} reader = {new ScheduleReader("departure", this.state.daysOfWeek)}/>);
        columns.push(<DataTable.Text key="arrival" header="Arrival" width="20" sortable = {true} reader = {new ScheduleReader("arrival", this.state.daysOfWeek)}/>);
        return columns;
    }

    render(){
        if(!this.props.type){
            return null;
        }
        if(!this.state.daysOfWeek){
            return null;
        }
        let required = this.props.type.code != RouteService.ROAD;
        let ferry = null;
        if(this.props.type.code == RouteService.SEAWAY){
            ferry = <GridCell width="2-5">
                <TextInput label="Ferry Name" value = {this.state.schedule.ferryName}
                                onchange = {(value) => this.updateScheduleState("ferryName", value)}
                                required = {required}/>
            </GridCell>
        }

        let saveLabel = "add";
        if(this.state.schedule._key){
            saveLabel = "save";
        }

        return (
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <CardHeader title="Scheduled"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="2-5">
                                <CompanySearchAutoComplete label="Company"
                                                       onchange = {(value) => this.updateScheduleState("company", value)}
                                                       value={this.state.schedule.company}
                                                       required = {required}/>
                            </GridCell>
                            {ferry}
                            <GridCell width="1-5">
                                <NumericInput label="Capacity" required={required} value={this.state.schedule.capacity}
                                              onchange = {(value) =>{ value == 0 ? this.updateScheduleState("capacity", null) :  this.updateScheduleState("capacity", value)} }/>
                            </GridCell>
                            <GridCell width="1-1">
                                <Grid>
                                    <GridCell width="5-6">
                                        <DayAndTimeRange days={this.state.daysOfWeek}
                                                         value={this.state.schedule.timetable}
                                                         onchange = {(value) => this.updateScheduleState("timetable", value)}
                                                         startLabel="Departure Day And Hour" endLabel="Arrival Day And Hour"
                                                         required = {required}/>
                                    </GridCell>
                                    <GridCell width="1-6">
                                        <div className="uk-align-right">
                                            <Button label={saveLabel} waves = {true} style="success" size="small"
                                                    onclick = {() => {this.handleSaveScheduleClick()}} />
                                        </div>
                                    </GridCell>
                                </Grid>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    <DataTable.Table key = {this.props.type.code} data={this.props.schedules} sortable = {true}>
                        {this.renderTableColumns()}
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
class ScheduleReader{
    constructor(field, days){
        this.moment = require("moment");
        this.days = days;
        this.start = this.moment("1 00:00", "E HH:mm");
        this.dayField = field + "Day";
        this.timeField = field + "Time";
    }
    readCellValue(row) {
        let day, time = "";
        if(row[this.dayField]){
            day = row[this.dayField].name;
        }
        if(row[this.timeField]){
            time = row[this.timeField];
        }
        return day + " " + time;
    }
    readSortValue(row) {
        let index = _.findIndex(this.days, {id: row[this.dayField].id});
        let end = this.moment((index+1) + " " + row[this.timeField], "E HH:mm");
        return end.diff(this.start, 'seconds');
    }
}