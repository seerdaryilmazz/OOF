import _ from "lodash";
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, CardHeader} from "susam-components/layout";
import {Button, Notify, Form} from "susam-components/basic";
import {TimelineTable} from "susam-components/advanced";

import {TimeSelections} from "./TimeSelections";

export class DistributionScheduleDetails extends TranslatingComponent {

    constructor(props) {
        super(props);

        this.moment = require("moment");
        this.state = {
            rules: [],
            linehaulArrivalDate: null,
            planCompletionDate: null,
            shipmentLeaveDate: null,
            shipmentDeliveryDate: null,
            ruleKeyToBeEdit: null
        }

    }

    componentDidMount(){
        this.loadRules(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.loadRules(nextProps);
    }

    loadRules(props) {
        let data = _.cloneDeep(props.data);
        if (data) {
            data.forEach( d => {if(!d._guiKey) { d._guiKey = uuid.v4();}});
            this.setState({data: data});
        } else {
            this.setState({data: []});
        }
    }

    updateState(field, value) {
        this.setState({field: value});

    }

    handleSave() {
        if(!this.state.ruleKeyToBeEdit) {
            this.handleAdd();
        } else {

            let data = this.state.data;
            let dataBackUp = _.cloneDeep(data);

            let elemIndex = data.findIndex(e => e._guiKey == this.state.ruleKeyToBeEdit);
            if (elemIndex < 0) return false;

            data.splice(elemIndex, 1);

            this.setState({data: data}, () => {
                if(!this.handleAdd()) {
                    this.setState({data: dataBackUp});
                }
            })

        }
    }

    handleAdd() {
        if (!this.form.validate()) {
            return;
        }
        let ruleElem = {};

        ruleElem._guiKey = uuid.v4();
        ruleElem.linehaulArrivalDate = this.state.linehaulArrivalDate;
        ruleElem.planCompletionDate = this.state.planCompletionDate;
        ruleElem.shipmentLeaveDate = this.state.shipmentLeaveDate;
        ruleElem.shipmentDeliveryDate = this.state.shipmentDeliveryDate;

        let data = this.state.data;

        let index = 0;
        let skip = false;
        let error = false;
        data.forEach(d => {
            let result = this.compareReadyDates(ruleElem, d);

            if (!skip) {
                if (result > 0) {
                    index++;
                } else if (result < 0) {
                    skip = true;
                } else if (result == 0) {
                    Notify.showError("Entry for given Ready Date/Time already exist.");
                    error = true;
                }
            }
        });

        if (error) {
            return false;
        }

        data.splice(index, 0, ruleElem);
        this.setState({
            data: data,
            ruleKeyToBeEdit: null,
            linehaulArrivalDate: null,
            planCompletionDate: null,
            shipmentLeaveDate: null,
            shipmentDeliveryDate: null
        }, () => {
            this.props.onchange(this.state.data)
        });

        return true;
    }

    handleDeleteRule(key) {
        Notify.confirm("This will delete the entry, Are you sure?", () => {

            let data = this.state.data;
            let elemIndex = data.findIndex(e => e._guiKey == key);
            if (elemIndex < 0) return false;

            data.splice(elemIndex, 1);

            this.setState({data: data, ruleKeyToBeEdit: null}, () => {
                this.props.onchange(this.state.data)
            });
        });
    }

    prepareForAdd() {
        this.setState({
            ruleKeyToBeEdit: null,
            linehaulArrivalDate: null,
            planCompletionDate: null,
            shipmentLeaveDate: null,
            shipmentDeliveryDate: null
        });
    }

    prepareForEdit(key) {
        let data = this.state.data;
        let elemIndex = data.findIndex(e => e._guiKey == key);
        if (elemIndex < 0) return false;
        let rule = data[elemIndex];

        this.setState({
            ruleKeyToBeEdit: key,
            linehaulArrivalDate: rule.linehaulArrivalDate,
            planCompletionDate: rule.planCompletionDate,
            shipmentLeaveDate: rule.shipmentLeaveDate,
            shipmentDeliveryDate: rule.shipmentDeliveryDate

        });
    }

    compareReadyDates(date1, date2) {

        let weekDiff = date1.linehaulArrivalDate.weekOffset - date2.linehaulArrivalDate.weekOffset;
        let dayDiff = date1.linehaulArrivalDate.dayIndex - date2.linehaulArrivalDate.dayIndex;


        if (weekDiff > 0) {
            return 1;
        } else if (weekDiff < 0) {
            return -1
        } else if (dayDiff > 0) {
            return 1;
        } else if (dayDiff < 0) {
            return -1;
        } else {

            let date1Time = this.moment(date1.linehaulArrivalDate.time.split(" ")[0], 'HH:mm');
            let date2Time = this.moment(date2.linehaulArrivalDate.time.split(" ")[0], 'HH:mm');
            let timeDiff = this.moment.duration(date1Time.diff(date2Time));

            if (timeDiff > 0) {
                return 1;
            } else if (timeDiff < 0) {
                return -1
            } else {
                return 0;
            }
        }
    }

    updateDayTimeRange(value) {

        let linehaulArrivalDate = null;
        let planCompletionDate = null;
        let shipmentLeaveDate = null;
        let shipmentDeliveryDate = null;

        if (value && value.linehaulArrivalDate) {
            linehaulArrivalDate = value.linehaulArrivalDate;
        }

        if (value && value.planCompletionDate) {
            planCompletionDate = value.planCompletionDate;
        }

        if (value && value.shipmentLeaveDate) {
            shipmentLeaveDate = value.shipmentLeaveDate;
        }


        if (value && value.shipmentDeliveryDate) {
            shipmentDeliveryDate = value.shipmentDeliveryDate;
        }

        this.setState({
            "linehaulArrivalDate": linehaulArrivalDate,
            "planCompletionDate": planCompletionDate,
            "shipmentLeaveDate": shipmentLeaveDate,
            "shipmentDeliveryDate": shipmentDeliveryDate
        });
    }

    render(){
        let data = this.state.data;

        if (!data || !this.props.lookups) {
            return null;
        }

        console.log()

        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Schedule"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-2">
                                <TimeSelections days={this.props.lookups.days}
                                                showWeeks={true} hideTimezone={true}
                                                value={
                                                    {
                                                        linehaulArrivalDate: this.state.linehaulArrivalDate,
                                                        planCompletionDate: this.state.planCompletionDate,
                                                        shipmentLeaveDate: this.state.shipmentLeaveDate,
                                                        shipmentDeliveryDate: this.state.shipmentDeliveryDate
                                                    }
                                                }
                                                onchange = {(value) => this.updateDayTimeRange(value)}
                                                required = {true}/>
                            </GridCell>
                            <GridCell width="1-2"/>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-left">
                        <Button label={this.state.ruleKeyToBeEdit ? "save" : "add"} waves={true} style="success"
                                onclick={() => {
                                    this.handleSave()
                                }}/>
                    </div>
                    <div className="uk-align-left" hidden="true">
                        <Button label="new" waves={true}
                                onclick={() => {
                                    this.prepareForAdd()
                                }}/>
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    <TimelineTable value={data}
                                  keyField="_guiKey"
                                  editHandler={(rule) => this.prepareForEdit(rule)}
                                  deleteHandler={(rule) => this.handleDeleteRule(rule)}
                                  baseField="linehaulArrivalDate"
                                  fillWeek={true}
                                  inverted={true}
                                  fields={[{id: "planCompletionDate", color: "blue", description: "Distribution plan should be completed until"},
                                      {id: "shipmentLeaveDate", color: "orange", description: "Shipment should be left related terminal until"},
                                      {id: "shipmentDeliveryDate", color: "red", description: "Shipment should be delivered until"}]}/>
                </GridCell>
            </Grid>
        );
    }
}
