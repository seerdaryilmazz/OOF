import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { DayAndTimeRange, NumberInput, Time, TimelineTable } from 'susam-components/advanced';
import { Button, Checkbox, DropDown, Notify, TextInput } from 'susam-components/basic';
import { Card, CardHeader, Grid, GridCell, Loader, Modal, PageHeader } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import uuid from 'uuid';


export class DeliveryDateRuleEdit extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {rule: this.createEmptyRule(), scheduleToEdit: {}, generateSchedule: {}};
    }

    createEmptyRule(){
        return {
            origin: {},
            destination: {},
            schedules: []
        }
    }

    componentDidMount(){

    }
    componentWillReceiveProps(nextProps){

    }

    updateSchedule(value){
        let scheduleToEdit = _.cloneDeep(this.state.scheduleToEdit);
        if (value && value.start) {
            scheduleToEdit.readyDate = value.start;
        }
        if (value && value.end) {
            scheduleToEdit.deliveryDate = value.end;
        }
        this.setState({scheduleToEdit: scheduleToEdit});
    }

    handleScheduleEdit(scheduleKey){
        this.setState({scheduleToEdit: _.find(this.props.rule.schedules, {_key: scheduleKey})});
    }
    handleScheduleDelete(scheduleKey){
        let rule = _.cloneDeep(this.props.rule);
        _.remove(rule.schedules, {_key: scheduleKey});
        this.setState({scheduleToEdit: {}}, () => this.props.onChange(rule));
    }

    handleSaveSchedule(){
        if(!this.state.scheduleToEdit._key) {
            this.handleAddSchedule();
        } else {
            this.handleUpdateSchedule();
        }
    }
    sortSchedules(rule){
        return _.sortBy(rule.schedules, [(item) => {
            let hours = item.readyDate.day.dayIndex * 24;
            let [hour, min] = item.readyDate.time.split(":");
            hours += parseInt(hour);
            return hours * 60 + min;
        }]);
    }
    handleUpdateSchedule(){
        let rule = _.cloneDeep(this.props.rule);
        let editIndex = rule.schedules.findIndex(e => e._key === this.state.scheduleToEdit._key);
        if (editIndex < 0) return;
        rule.schedules[editIndex] = _.cloneDeep(this.state.scheduleToEdit);
        rule.schedules = this.sortSchedules(rule);
        this.setState({scheduleToEdit: {}}, () => this.props.onChange(rule));
    }
    handleAddSchedule(){
        let rule = _.cloneDeep(this.props.rule);
        let schedule = _.cloneDeep(this.state.scheduleToEdit);
        schedule._key = uuid.v4();
        rule.schedules.push(schedule);
        rule.schedules = this.sortSchedules(rule);
        this.setState({scheduleToEdit: {}}, () => this.props.onChange(rule));
    }
    handleSaveRule(){
        this.props.onSave();
    }
    handleBackClick(){
        this.props.onBack && this.props.onBack();
    }
    handleClickCancel(){
        this.handleBackClick();
    }
    handleChange(key, value){
        let rule = _.cloneDeep(this.props.rule);
        _.set(rule, key, value);
        this.props.onChange && this.props.onChange(rule);
    }
    handleOriginAllPostalCodesChange(key, value){
        this.handleChange(key, value);
        if(value){
            this.handleChange("origin.postalCodes", "");
        }
    }
    handleDestinationAllPostalCodesChange(key, value){
        this.handleChange(key, value);
        if(value){
            this.handleChange("destination.postalCodes", "");
        }
    }
    handleClickGenerate(){
        this.modal.open();
    }
    handleModalClose(){
        this.modal.close();
    }
    handleApplySchedule(exceptDays){
        if(_.isEmpty(this.state.generateSchedule.transitTime)){
            Notify.showError("Transit Time' must be set")
            return;
        }
        if(_.isEmpty(this.state.generateSchedule.readyTime) || _.isEmpty(this.state.generateSchedule.deliveryTime)){
            Notify.showError("'Responsibility Hour' and 'Latest Delivery Hour' must be set")
            return;
        }
        let rule = _.cloneDeep(this.props.rule);
        rule.schedules = [];
        this.props.lookup.days
            .filter(day => !exceptDays.includes(day.id))
            .forEach((day,index) => {
                let deliveryIndex = index + parseInt(this.state.generateSchedule.transitTime);
                let weekOffset = parseInt(deliveryIndex / 7);
                deliveryIndex = deliveryIndex % 7;
                let deliveryDay = this.props.lookup.days[deliveryIndex];
                rule.schedules.push({
                    _key: uuid.v4(),
                    readyDate: {
                        day: {
                            id: day.id,
                            name: day.name,
                            dayIndex: index,
                            weekOffset: 0
                        },
                        dayIndex: index,
                        weekOffset: 0,
                        time: this.state.generateSchedule.readyTime
                    },
                    deliveryDate: {
                        day: {
                            id: deliveryDay.id,
                            name: deliveryDay.name,
                            dayIndex: deliveryIndex,
                            weekOffset: weekOffset
                        },
                        dayIndex: deliveryIndex,
                        weekOffset: weekOffset,
                        time: this.state.generateSchedule.deliveryTime
                    }
                });
            });
        this.props.onChange(rule);
    }
    handleApplyWeekdays(){
        this.handleApplySchedule(["SATURDAY", "SUNDAY"]);
    }
    handleApplyExceptSunday(){
        this.handleApplySchedule(["SUNDAY"]);
    }
    updateGenerateSchedule(key, value){
        let generateSchedule = _.cloneDeep(this.state.generateSchedule);
        _.set(generateSchedule, key, value);
        this.setState({generateSchedule: generateSchedule});
    }

    render(){
        let {rule} = this.props;
        if(!rule){
            return <Loader title="Loading rule" />;
        }
        let customerName = rule.customer ? rule.customer.name : "";
        return(
            <div>
                <PageHeader title = {`${super.translate('Customer')}: ${customerName}`} />
                <Card>
                    <Grid>
                        <GridCell width = "1-1">
                            <Button label="Back to rule list" style = "success" flat = {true} size = "small"
                                    onclick = {() => this.handleBackClick()} />
                        </GridCell>
                        <GridCell width = "1-3">
                            <CompanySearchAutoComplete label = "Customer"
                                                       readOnly={this.props.readOnly}
                                                       value = {rule.customer} required = {true}
                                                       onchange = {(value) => this.handleChange("customer", value)} />
                        </GridCell>
                        <GridCell width = "2-3"/>
                        <GridCell width = "1-2">
                            <Grid>
                                <GridCell width = "1-1" noMargin = {true}>
                                    <CardHeader title = "Origin" />
                                </GridCell>
                                <GridCell width = "1-4">
                                    <DropDown label="Country" value = {rule.origin.country}
                                              options = {this.props.lookup.countries} valueField = "code"
                                              onchange = {value => this.handleChange("origin.country", value)}/>
                                </GridCell>
                                <GridCell width = "1-4">
                                    <div className = "uk-margin-top">
                                        <Checkbox label="All Postal Codes" value = {rule.origin.includeAllPostalCodes}
                                              onchange = {value => this.handleOriginAllPostalCodesChange("origin.includeAllPostalCodes", value)} />
                                    </div>
                                </GridCell>
                                <GridCell width = "1-4">
                                    <TextInput label="Postal Codes" value = {rule.origin.postalCodes}
                                               disabled = {rule.origin.includeAllPostalCodes}
                                               helperText = "List seperated by comma"
                                               onchange = {value => this.handleChange("origin.postalCodes", value)}/>
                                </GridCell>
                                <GridCell width = "1-4">
                                    <div className = "uk-margin-top">
                                        <Checkbox label="Warehouse Delivery" value = {rule.origin.warehouseDelivery}
                                                  onchange = {value => this.handleChange("origin.warehouseDelivery", value)} />
                                    </div>
                                </GridCell>

                            </Grid>
                        </GridCell>
                        <GridCell width = "1-2">
                            <Grid>
                                <GridCell width = "1-1" noMargin = {true}>
                                    <CardHeader title = "Destination" />
                                </GridCell>
                                <GridCell width = "1-4">
                                    <DropDown label="Country" value = {rule.destination.country}
                                              options = {this.props.lookup.countries} valueField = "code"
                                              onchange = {value => this.handleChange("destination.country", value)}/>
                                </GridCell>
                                <GridCell width = "1-4">
                                    <div className = "uk-margin-top">
                                        <Checkbox label="All Postal Codes" value = {rule.destination.includeAllPostalCodes}
                                              onchange = {value => this.handleDestinationAllPostalCodesChange("destination.includeAllPostalCodes", value)} />
                                    </div>
                                </GridCell>
                                <GridCell width = "2-4">
                                    <TextInput label="Postal Codes" value = {rule.destination.postalCodes}
                                               disabled = {rule.destination.includeAllPostalCodes}
                                               helperText = "List seperated by comma"
                                               onchange = {value => this.handleChange("destination.postalCodes", value)}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width = "1-2">
                            <Grid>
                                <GridCell width = "1-1">
                                    <CardHeader title = "Details" />
                                </GridCell>
                                <GridCell width = "1-2">
                                    <DropDown label="Load Type" value = {rule.loadType}
                                              options = {this.props.lookup.loadTypes} valueField = "code"
                                              onchange = {value => this.handleChange("loadType", value)}/>
                                </GridCell>
                                <GridCell width = "1-2">
                                    <DropDown label="Service Type" value = {rule.serviceType}
                                              options = {this.props.lookup.serviceTypes} valueField = "code"
                                              onchange = {value => this.handleChange("serviceType", value)} />
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width = "1-1">
                            <Grid>
                                <GridCell width = "1-1">
                                    <CardHeader title = "Schedule" />
                                </GridCell>
                                <GridCell width="1-2">
                                    <DayAndTimeRange days={this.props.lookup.days}
                                                     showWeeks={true} hideTimezone={true}
                                                     value={{
                                                         start: this.state.scheduleToEdit.readyDate,
                                                         end: this.state.scheduleToEdit.deliveryDate
                                                     }}
                                                     onchange={(value) => this.updateSchedule(value)}
                                                     startLabel="Responsibility Start Date" endLabel="Delivery Date"
                                                     required={true}/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <div className="uk-margin-medium-top">
                                        <Button label="save" style="success" size = "small"
                                                onclick={ () => this.handleSaveSchedule() }/>
                                    </div>
                                </GridCell>
                                <GridCell width="1-4">
                                    <div className="uk-margin-medium-top">
                                        <Button label="generate schedule" style="primary" size = "small" flat = {true}
                                                onclick={ () => this.handleClickGenerate() }/>
                                    </div>
                                </GridCell>
                                <GridCell width = "1-1">
                                    <TimelineTable value={rule.schedules}
                                                   keyField="_key"
                                                   editHandler={(schedule) => this.handleScheduleEdit(schedule)}
                                                   deleteHandler={(schedule) => this.handleScheduleDelete(schedule)}
                                                   fillWeek={true}
                                                   inverted={true}
                                                   baseField="readyDate"
                                                   fields={[{id: "deliveryDate", description: "Delivery Date"}]}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width = "1-1">
                            <div className = "uk-align-right">
                                <Button label = "Cancel" flat = {true} size = "small" onclick = {() => this.handleClickCancel()} />
                                <Button label="save" style="primary" size = "small" onclick={ () => this.handleSaveRule() }/>
                            </div>
                        </GridCell>
                    </Grid>
                </Card>

                <Modal ref={(c) => this.modal = c} title="Generate Schedule"
                       closeOtherOpenModals = {false}
                       actions = {[{label:"Close", action:() => this.handleModalClose()},
                           {label:"apply for weekdays", buttonStyle:"primary", action:() => this.handleApplyWeekdays()},
                           {label:"apply except sunday", buttonStyle:"primary", action:() => this.handleApplyExceptSunday()}]}>
                    <Grid>
                        <GridCell width = "1-2">
                            <Time label = "Responsibility Hour" hideIcon = {true} hideTimezone = {true}
                                  value = {this.state.generateSchedule.readyTime} required={true}
                                  onchange = {(value) => this.updateGenerateSchedule("readyTime", value) }/>
                        </GridCell>
                        <GridCell width = "1-2">
                            <NumberInput label="Transit Time (Calendar Day)" value = {this.state.generateSchedule.transitTime}
                                        onchange = {value => this.updateGenerateSchedule("transitTime", value)} required={true}/>
                        </GridCell>
                        <GridCell width = "1-2">
                            <Time label = "Latest Delivery Hour" hideIcon = {true} hideTimezone = {true}
                                  value = {this.state.generateSchedule.deliveryTime} required={true}
                                  onchange = {(value) => this.updateGenerateSchedule("deliveryTime", value) }/>
                        </GridCell>
                    </Grid>
                </Modal>
            </div>
        );
    }
}
DeliveryDateRuleEdit.contextTypes = {
    router: React.PropTypes.object.isRequired,
    translator: PropTypes.object
};