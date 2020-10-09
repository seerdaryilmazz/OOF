import _ from "lodash";
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Span} from "susam-components/basic";
import {Chip, DayAndTimeRange, TimelineTable} from 'susam-components/advanced';

import {RouteService} from '../../services';

export class ProductSchedules extends TranslatingComponent {

    constructor(props){
        super(props);

        this.moment = require("moment");
        this.state = { rules: [], readyDate: null, deliveryDate: null, ruleKeyToBeEdit: null}


    }

    componentDidMount(){
        this.loadRules(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.loadRules(nextProps);

    }

    loadRules(props) {
        let rules = _.cloneDeep(props.rules);
        if (rules) {
            rules.forEach( rule => {if(!rule._guiKey) { rule._guiKey = uuid.v4();}});
            this.setState({rules: rules});
        } else {
            this.setState({rules: []});
        }
    }

    updateState(field, value) {
       this.setState({field: value});

    }

    handleSave() {
        if(!this.state.ruleKeyToBeEdit) {
            this.handleAdd();
        } else {

            let rules = this.state.rules;
            let rulesBackUp = _.cloneDeep(rules);

            let elemIndex = rules.findIndex(e => e._guiKey == this.state.ruleKeyToBeEdit);
            if (elemIndex < 0) return false;

            rules.splice(elemIndex, 1);

            this.setState({rules: rules}, () => {
                if(!this.handleAdd()) {
                    this.setState({rules: rulesBackUp});
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
        ruleElem.readyDate = this.state.readyDate;
        ruleElem.deliveryDate = this.state.deliveryDate;

        let rules = this.state.rules;

        let index = 0;
        let skip = false;
        let error = false;
        rules.forEach(r => {
            let result = this.compareReadyDates(ruleElem, r);

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

        if(error) {
            return false;
        }


        rules.splice(index, 0, ruleElem);
        this.setState({rules: rules, ruleKeyToBeEdit: null, readyDate: null, deliveryDate: null}, () => {
            this.props.onchange(this.state.rules)
        });

        return true;
    }

    handleDeleteRule(key) {
        Notify.confirm("This will delete the entry, Are you sure?", () => {

            let rules = this.state.rules;
            let elemIndex = rules.findIndex(e => e._guiKey == key);
            if (elemIndex < 0) return false;

            rules.splice(elemIndex, 1);

            this.setState({rules: rules, ruleKeyToBeEdit: null}, () => {
                this.props.onchange(this.state.rules)
            });
        });
    }

    prepareForAdd() {
        this.setState({ruleKeyToBeEdit: null, readyDate: null, deliveryDate: null});
    }

    prepareForEdit(key) {
        let rules = this.state.rules;
        let elemIndex = rules.findIndex(e => e._guiKey == key);
        if (elemIndex < 0) return false;
        let rule = rules[elemIndex];

        this.setState({ruleKeyToBeEdit: key, readyDate: rule.readyDate, deliveryDate: rule.deliveryDate});
    }


    compareReadyDates(date1, date2) {

        let weekDiff = date1.readyDate.weekOffset - date2.readyDate.weekOffset;
        let dayDiff = date1.readyDate.dayIndex - date2.readyDate.dayIndex;


        if (weekDiff > 0) {
            return 1;
        } else if (weekDiff < 0) {
            return -1
        } else if (dayDiff > 0) {
            return 1;
        } else if (dayDiff < 0) {
            return -1;
        } else {

            let date1Time = this.moment(date1.readyDate.time.split(" ")[0], 'HH:mm');
            let date2Time = this.moment(date2.readyDate.time.split(" ")[0], 'HH:mm');
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

        let start = null;
        let end = null;

        if (value && value.start) {
            start = value.start;
        }

        if (value && value.end) {
            end = value.end;
        }

        this.setState({"readyDate": start, "deliveryDate": end});
    }

    render() {
        let rules = this.state.rules;
        if (!rules || !this.props.lookups) {
            return null;
        }

        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Schedules"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref={(c) => this.form = c}>
                        <Grid>
                            <GridCell width="3-4">
                                <DayAndTimeRange days={this.props.lookups.days}
                                                 showWeeks={true} hideTimezone={true}
                                                 value={{
                                                     start: this.state.readyDate,
                                                     end: this.state.deliveryDate
                                                 }}
                                                 onchange={(value) => this.updateDayTimeRange(value)}
                                                 startLabel="Responsibility Start Date" endLabel="Latest Delivery Date"
                                                 required={true}/>
                            </GridCell>
                            <GridCell width="1-4">
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
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                </GridCell>
                <GridCell>
                    <TimelineTable value={rules}
                                  keyField="_guiKey"
                                  editHandler={(rule) => this.prepareForEdit(rule)}
                                  deleteHandler={(rule) => this.handleDeleteRule(rule)}
                                  fillWeek={true}
                                  inverted={true}
                                  baseField="readyDate"
                                  fields={[{id: "deliveryDate", description: "Latest Delivery Date"}]}/>
                </GridCell>
            </Grid>
        );
    }
}