import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { NumericInput } from 'susam-components/advanced';
import { Button, DropDown, Span, TextArea, TextInput } from 'susam-components/basic';
import { Alert, Grid, GridCell } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import uuid from 'uuid';
import { ConsigneeForm } from "./ConsigneeForm";
import { ConsigneeSelection } from "./ConsigneeSelection";
import { CustomsAgentAndLocationForm } from "./CustomsAgentAndLocationForm";
import { CustomsAgentAndLocationSelection } from "./CustomsAgentAndLocationSelection";
import { CustomsArrivalTRForm } from "./CustomsArrivalTRForm";
import { CustomsArrivalTRSelection } from "./CustomsArrivalTRSelection";
import { CustomsDepartureTRForm } from "./CustomsDepartureTRForm";
import { CustomsDepartureTRSelection } from "./CustomsDepartureTRSelection";
import { OptionList } from "./OptionList";
import { OriginalCustomerSelection } from "./OriginalCustomerSelection";
import { PartyForm } from './PartyForm';
import { PartySelection } from './PartySelection';
import { SenderForm } from "./SenderForm";
import { SenderSelection } from "./SenderSelection";
import { ManufacturerSelection } from './ManufacturerSelection';
import { ManufacturerForm } from './ManufacturerForm';

export function withHandlingTabKey(WrappedComponent){
    return class KeyHandlingComponent extends TranslatingComponent {
        componentDidMount(){
            if(this.props.active){
                document.addEventListener('keyup', this.handleKeyPress);
            }
        }
        componentWillUnmount(){
            document.removeEventListener('keyup', this.handleKeyPress);
        }
        handleKeyPress = (e) => {
            handleTabPress(e, () => this.props.onNext(), () => this.props.onPrev());
        };
        render() {
            return <WrappedComponent {...this.props} />;
        }
    }
}
export function handleTabPress(e, onTabPress, onShiftTabPress){
    if(e.key === "Tab"){
        e.stopPropagation();
        e.shiftKey ? onShiftTabPress() : onTabPress();
    }
}

export class DefaultInactiveElement extends TranslatingComponent{
    render(){
        let classNames = ["uk-text-large"];
        if(this.props.showError){
            classNames.push("uk-text-danger");
        }
        return <span className={classNames.join(" ")}>{super.translate(this.props.value)}</span>
    }
}

export class Lookup extends TranslatingComponent{
    state = {};

    handleChange(value){
        this.props.onChange && this.props.onChange(value);
        if(value && this.props.onNext){
            this.props.onNext();
        }
    }
    renderOption(item){
        return(
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate uk-text-bold">{super.translate(item.name)}</span>
                </GridCell>
            </Grid>
        );
    }
    render(){
        return (
            <OptionList options = {this.props.options} columns = {this.props.columns || 4} enableArrowKeys = {this.props.active}
                        value = {this.props.value} keyField = "code"
                        onChange = {(value) => this.handleChange(value)}
                        onRender = {(option) => this.renderOption(option)} />
        );
    }
}

export const LookupStep = withHandlingTabKey(Lookup);


export class Consignee extends TranslatingComponent {

    render(){
        if(!this.props.active){
            return <ConsigneeSelection {...this.props}/>;
        }
        return this.props.options && this.props.options.length > 0 ? <ConsigneeSelection {...this.props}/> : <ConsigneeForm {...this.props}/>;
    }

}

export class Sender extends TranslatingComponent {

    render(){
        if(!this.props.active){
            return <SenderSelection {...this.props}/>;
        }
        return this.props.options && this.props.options.length > 0 ? <SenderSelection {...this.props}/> : <SenderForm {...this.props}/>;
    }

}

export class CustomsAgentAndLocation extends TranslatingComponent {

    render(){
        if(!this.props.active){
            return <CustomsAgentAndLocationSelection {...this.props} />;
        }
        return this.props.options && this.props.options.length > 0 ? <CustomsAgentAndLocationSelection {...this.props} /> : <CustomsAgentAndLocationForm {...this.props}/>;
    }

}

export class CustomsArrivalTR extends TranslatingComponent {

    render(){
        if(!this.props.active){
            return <CustomsArrivalTRSelection {...this.props} />;
        }
        return this.props.options && this.props.options.length > 0 ? <CustomsArrivalTRSelection {...this.props} /> : <CustomsArrivalTRForm {...this.props}/>;
    }

}

export class CustomsDepartureTR extends TranslatingComponent {

    render(){
        if(!this.props.active){
            return <CustomsDepartureTRSelection {...this.props} />;
        }
        return this.props.options && this.props.options.length > 0 ? <CustomsDepartureTRSelection {...this.props} /> : <CustomsDepartureTRForm {...this.props}/>;
    }

}

export class Party extends TranslatingComponent {

    render(){
        if(!this.props.active){
            return <PartySelection {...this.props}/>;
        }
        if(this.props.options && this.props.options.length > 0){
            return <PartySelection {...this.props}/>;
        } else if(this.props.messageForNoParty){
            return <Alert type="warning" message = {this.props.messageForNoParty} />;
        } else{
            return <PartyForm {...this.props}/>;
        }
    }

}

export class ActionButton extends TranslatingComponent{
    handleClick(){
        this.props.onClick && this.props.onClick();
        this.props.onNext && this.props.onNext();
    }
    render(){
        return (
            <Button label="save" style = "primary" size = "large" {...this.props} onclick = {() => this.handleClick()}/>
        );
    }
}

export const ActionButtonStep = withHandlingTabKey(ActionButton);

export class YesNoButton extends TranslatingComponent{
    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keyup', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        if(e.key.toUpperCase() === "Y" || e.key === "Enter"){
            this.handleClickYes();
        }
        if(e.key.toUpperCase() === "N" || e.key === "Escape"){
            this.handleClickNo();
        }
    };
    handleClickYes(){
        this.props.onChange && this.props.onChange(true);
        this.props.onNext && this.props.onNext();
    }
    handleClickNo(){
        this.props.onChange && this.props.onChange(false);
        this.props.onNext && this.props.onNext();
    }
    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }
    renderActive(){
        return (
            <div>
                <Button label = "Yes" style = "primary" size="large" onclick = {() => this.handleClickYes()}/>
                <Button label = "No" style = "danger" size="large" onclick = {() => this.handleClickNo()}/>
            </div>
        );
    }
    renderInactive(){
        return <DefaultInactiveElement value = {this.props.value ? "YES" : "NO"}/>
    }
}

export const YesNoButtonStep = withHandlingTabKey(YesNoButton);

export class YesNoDontKnowButton extends TranslatingComponent{
    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keyup', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        if(e.key.toUpperCase() === "Y" || e.key === "Enter"){
            this.handleClickYes();
        }
        if(e.key.toUpperCase() === "N"){
            this.handleClickNo();
        }
        if(e.key === "Escape"){
            this.handleClickDontKnow();
        }
    };
    handleClickYes(){
        this.props.onChange && this.props.onChange(true);
        this.props.onNext && this.props.onNext();
    }
    handleClickNo(){
        this.props.onChange && this.props.onChange(false);
        this.props.onNext && this.props.onNext();
    }
    handleClickDontKnow(){
        this.props.onChange && this.props.onChange(null);
        this.props.onNext && this.props.onNext();
    }
    renderActive(){
        return (
            <div>
                <Button label = "Yes" style = "primary" size="large" onclick = {() => this.handleClickYes()}/>
                <Button label = "No" style = "danger" size="large" onclick = {() => this.handleClickNo()}/>
                <Button label = "Don't Know"  size="large" onclick = {() => this.handleClickDontKnow()}/>
            </div>
        );
    }
    renderInactive(){
        return <DefaultInactiveElement
            value = {_.isNil(this.props.value) ? "DON'T KNOW" : (this.props.value ? "YES" : "NO")}/>
    }
    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }
}

export const YesNoDontKnowButtonStep = withHandlingTabKey(YesNoDontKnowButton);

export class LoadRequirements extends TranslatingComponent{
    constructor(props){
        super(props);
    }
    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillReceiveProps(nextProps){
        if(this.props.active && !nextProps.active){
            document.removeEventListener('keyup', this.handleKeyPress);
        }
        if(!this.props.active && nextProps.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keyup', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        if(e.key === "Escape"){
            this.handleChange(_.filter(this.options, {id: "NONE"}));
        }
    };
    handleChange(value){
        let newValue = _.differenceBy(value, this.props.value, (item) => item.id);
        if(newValue.length > 0){
            if(newValue[0].id === "NONE"){
                this.props.onChange && this.props.onChange(newValue);
                this.props.onNext && this.props.onNext();
            }else{
                let noneIndex = _.findIndex(value, {id: "NONE"});
                if(noneIndex >= 0){
                    value.splice(noneIndex, 1);
                    this.props.onChange && this.props.onChange(value);
                }else{
                    this.props.onChange && this.props.onChange(value);
                }
            }
        }else{
            this.props.onChange && this.props.onChange(value);
        }

    }
    renderOption(option, selected){
        let classes = ["mdi", "mdi-48px", "mdi-" + option.icon];
        if(selected){
            classes.push("mdi-light");
        }
        return(
            <div style = {{textAlign: "center"}}>
                <div className = {classes.join(" ")} />
                <span className="uk-text-large">{super.translate(option.text)}</span>
            </div>

        );
    }
    render(){
        return (
            <OptionList options = {this.props.options} columns = {4} multiple = {true}
                        enableArrowKeys = {this.props.active}
                        value = {this.props.value} keyField = "id"
                        onChange = {(value) => this.handleChange(value)}
                        onRender = {(option, selected) => this.renderOption(option, selected)} />
        );
    }
}

export const LoadRequirementsStep = withHandlingTabKey(LoadRequirements);

export class CompanySelection extends TranslatingComponent{

    constructor(props){
        super(props);
        this.id = uuid.v4();
        this.state = {};
    }
    componentDidMount(){
        if(this.props.active){
            document.getElementById(this.id) && document.getElementById(this.id).focus();
        }
    }

    handleChange(value){
        this.props.onChange && this.props.onChange(value);
        if(value && this.props.onNext){
            this.props.onNext();
        }
    }
    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }
    renderActive(){
        return (
            <CompanySearchAutoComplete id = {this.id} {...this.props}
                                       onchange = {(value) => this.handleChange(value)} />
        );
    }
    renderInactive(){
        return <DefaultInactiveElement value = {this.props.value ? this.props.value.name : "No selection yet"}/>
    }
}

export const CompanySelectionStep = withHandlingTabKey(CompanySelection);


export class OriginalCustomer extends TranslatingComponent{

    render(){
        if(!this.props.active){
            return <OriginalCustomerSelection {...this.props}/>;
        }
        return this.props.options && this.props.options.length > 0 ? <OriginalCustomerSelection {...this.props}/> : <CompanySelection {...this.props}/>;
    }

}

export const OriginalCustomerStep = withHandlingTabKey(OriginalCustomer);

export class DropDownSelection extends TranslatingComponent{
    constructor(props){
        super(props);
        this.id = uuid.v4();
    }
    componentDidMount(){
        document.getElementById(this.id).focus();
    }

    handleChange(value){
        this.props.onChange && this.props.onChange(value);
        if(value && this.props.onNext){
            this.props.onNext();
        }
    }
    render(){
        return (
            <DropDown id = {this.id} options = {this.props.options} value = {this.props.value}
                                       onchange = {(value) => this.handleChange(value)} />
        );
    }
}

export const DropDownSelectionStep = withHandlingTabKey(DropDownSelection);

export class OrderNumbers extends TranslatingComponent{
    constructor(props){
        super(props);
        this.id = uuid.v4();
    }
    componentDidMount(){
        document.getElementById(this.id) && document.getElementById(this.id).focus();
    }

    handleChange(value){
        this.props.onChange && this.props.onChange(value);
    }
    renderInactive(){
        return <DefaultInactiveElement value = {this.props.value} />;
    }
    renderActive(){
        return (
            <TextArea id = {this.id} {...this.props}
                                       onchange = {(value) => this.handleChange(value)} />
        );
    }
    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }
}

export const OrderNumbersStep = withHandlingTabKey(OrderNumbers);


export class SelectReadyDate extends TranslatingComponent{
    state = {};

    constructor(props){
        super(props);
        this.id = uuid.v4();
    }
    componentDidMount(){
        document.getElementById(this.id + "-date") &&
            document.getElementById(this.id + "-date").focus();

        if(this.props.value && this.props.value.value){
            let readyDate = moment(this.props.value.value, "DD/MM/YYYY HH:mm Z");
            this.setState({showWarning: moment().add(30, 'days').isBefore(readyDate)});
        }
    }

    handleChange(value){

        let withTimezone = value ? value + " " + this.props.timezone : "";
        let readyDate = moment(withTimezone, "DD/MM/YYYY HH:mm Z");

        this.setState({showWarning: moment().add(30, 'days').isBefore(readyDate)}, () => {
            this.props.onChange && this.props.onChange(this.adjustReadyDate(readyDate));
        });


    }

    adjustReadyDate(readyDate){
        let format = "DD/MM/YYYY HH:mm"

        let result = { value: moment(readyDate).format(format) + " " + this.props.timezone, isWorkingHoursExist: false}
        if(this.props.workingHours && !_.isEmpty(this.props.workingHours.flatMap(t=>t.timeWindows))){
            result.isWorkingHoursExist = true;
            let weekDayName = moment(readyDate).format('dddd');
            let latestTime = _.find(this.props.workingHours, i=>_.isEqual(_.lowerCase(i.day.code), _.lowerCase(weekDayName)));
            result.workingHours = latestTime;
            if(latestTime && !_.isEmpty(latestTime.timeWindows)){
                let [hour, minute] = _.max(latestTime.timeWindows.map(i=>i.endTime)).split(":");
                result.latest = moment(_.cloneDeep(readyDate)).set({hour: hour, minute: minute }).format(format) + " " + this.props.timezone;
            }
        }
        return result;
    }
    
    renderAlert(){
        if(this.state.showWarning){
            return (
                <GridCell width = "1-1">
                    <Alert type="warning" message = "You have entered a ready date for more than 30 days" />
                </GridCell>
            );
        }
        return null;
    }
    renderActive(){
        let value = "";
        let split = this.props.value && this.props.value.value ? this.props.value.value.split(" ") : [];
        if(split.length === 3){
            value = split[0] + " " + split[1];
        }
        return (
            <Grid>
                {this.renderAlert()}
                <GridCell width = "1-2">
                    <TextInput mask = "'showMaskOnFocus':'false', 'alias': 'datetime', 'clearIncomplete': 'true'"
                               id={this.id+"-date"}
                               onchange={(value) => this.handleChange(value)}
                               helperText = {this.props.timezone}
                               value = {value}/>
                </GridCell>
            </Grid>
        );
    }
    renderInactive(){
        let value = (this.props.value && this.props.value.value) || "Not entered yet";
        return <Grid>{this.renderAlert()}<GridCell width = "1-1"><DefaultInactiveElement value = {value} /></GridCell></Grid>;
    }
    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }
}

export const SelectReadyDateStep = withHandlingTabKey(SelectReadyDate);


export class NumberRange extends TranslatingComponent{
    constructor(props){
        super(props);
        this.id = uuid.v4();
    }
    componentDidMount(){
        if(this.props.active){
            document.getElementById(this.id + "-min").focus();
        }
    }
    componentDidUpdate(prevProps){
        if(!prevProps.active && this.props.active){
            document.getElementById(this.id + "-min").focus();
        }
    }

    handleMinChange(value){
        let rangeValue = _.cloneDeep(this.props.value) || {};
        rangeValue.min = value;
        this.handleChange(rangeValue);
    }
    handleMaxChange(value){
        let rangeValue = _.cloneDeep(this.props.value) || {};
        rangeValue.max = value;
        this.handleChange(rangeValue);
    }
    handleChange(rangeValue){
        this.props.onChange && this.props.onChange(rangeValue);
        if(!_.isNil(rangeValue.min) && !_.isNil(rangeValue.max)){
            this.props.onNext && this.props.onNext();
        }
    }
    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }
    renderInactive(){
        let value = this.props.value;
        if(!value){
            return <DefaultInactiveElement value = "No selection"/>
        }

        return(
            <Grid>
                <GridCell width = "1-4">
                    <Span label="Fixed or Minimum" value={value.min + " °C"}/>
                </GridCell>
                <GridCell width = "1-4">
                    <Span label="Maximum" value={value.max + " °C"}/>
                </GridCell>
            </Grid>
        );
    }
    renderActive(){
        let value = this.props.value || {};
        return (
            <Grid>
                <GridCell width = "1-4">
                    <NumericInput id = {this.id + "-min"} unit="°C" label="Fixed or Minimum" digitsOptional = {true} digits = {0}
                                  allowMinus = {true}
                                  value={value.min} onchange={(value) => {this.handleMinChange(value)}}/>

                </GridCell>
                <GridCell width = "1-4">
                    <NumericInput id = {this.id + "-max"} unit="°C" label="Maximum" digitsOptional = {true} digits = {0}
                                  allowMinus = {true}
                                  value={value.max} onchange={(value) => {this.handleMaxChange(value)}}/>
                </GridCell>
            </Grid>
        );
    }
}
export const NumberRangeStep = withHandlingTabKey(NumberRange);

export class CertificateDocumentType extends TranslatingComponent{
    constructor(props){
        super(props);
    }
    componentDidMount(){
    }
    componentWillReceiveProps(nextProps){
    }
    componentWillUnmount(){
    }

    handleChange(value){
        let propsValue = _.cloneDeep(this.props.value) || {};
        if(!propsValue.uploadTypes){
            propsValue.uploadTypes = [];
        }
        propsValue.manualTypes = [];
        value.forEach(item => {
            if(!_.find(propsValue.uploadTypes, {id: item.id})){
                propsValue.manualTypes.push(item);
            }
        });
        this.props.onChange && this.props.onChange(propsValue);
    }
    renderOption(item){
        return(
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate uk-text-bold">{super.translate(item.name)}</span>
                </GridCell>
            </Grid>
        );
    }
    render(){
        let value = [];
        if(this.props.value){
            value = this.props.value.manualTypes ?
                this.props.value.manualTypes.concat(this.props.value.uploadTypes) : this.props.value.uploadTypes;
        }

        return (
            <OptionList options = {this.props.options} columns = {3} multiple = {true}
                        enableArrowKeys = {this.props.active}
                        value = {value} keyField = "code"
                        onChange = {(value) => this.handleChange(value)}
                        onRender = {(option) => this.renderOption(option)} />
        );
    }
}

export const CertificateDocumentTypeStep = withHandlingTabKey(CertificateDocumentType);

export class SpecialLoadTypes extends TranslatingComponent{
    constructor(props){
        super(props);
        this.options = [
            {id: "HANGER", icon: "hanger", text: "Hanging Goods"},
            {id: "LONG_LOAD", icon: "arrow-expand", text: "Long Load"},
            {id: "PROJECT", icon: "star-circle", text: "Project Cargo"},
            {id: "NONE", icon: "check-circle", text: "None"},
        ];
    }
    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillReceiveProps(nextProps){
        if(this.props.active && !nextProps.active){
            document.removeEventListener('keyup', this.handleKeyPress);
        }
        if(!this.props.active && nextProps.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keyup', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        if(e.key === "Escape"){
            this.handleChange(_.filter(this.options, {id: "NONE"}));
        }
    };
    handleChange(value){
        let newValue = _.differenceBy(value, this.props.value, (item) => item.id);
        if(newValue.length > 0){
            if(newValue[0].id === "NONE"){
                this.props.onChange && this.props.onChange(newValue);
            }else{
                let noneIndex = _.findIndex(value, {id: "NONE"});
                if(noneIndex >= 0){
                    value.splice(noneIndex, 1);
                    this.props.onChange && this.props.onChange(value);
                }else{
                    this.props.onChange && this.props.onChange(value);
                }
            }
        }else{
            this.props.onChange && this.props.onChange(value);
        }

    }
    renderOption(option, selected){
        let classes = ["mdi", "mdi-48px", "mdi-" + option.icon];
        if(selected){
            classes.push("mdi-light");
        }
        return(
            <div style = {{textAlign: "center"}}>
                <div className = {classes.join(" ")} />
                <span className="uk-text-large">{super.translate(option.text)}</span>
            </div>

        );
    }
    renderActive(){
        return (
            <OptionList options = {this.options} columns = {4} multiple = {true}
                        enableArrowKeys = {this.props.active}
                        value = {this.props.value} keyField = "id"
                        onChange = {(value) => this.handleChange(value)}
                        onRender = {(option, selected) => this.renderOption(option, selected)} />
        );
    }
    renderInactive(){
        return (
            <OptionList options = {this.options} columns = {4} multiple = {true}
                    value = {this.props.value} keyField = "id"
                    onRender = {(option, selected) => this.renderOption(option, selected)} />
        );
    }
    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }
}

export const SpecialLoadTypesStep = withHandlingTabKey(SpecialLoadTypes);

export class Requirements extends TranslatingComponent{
    constructor(props){
        super(props);
        this.options = [
            {id: "VEHICLE", icon: "truck-trailer", text: "Vehicle"},
            {id: "EQUIPMENT", icon: "screwdriver", text: "Equipment"},
            {id: "NONE", icon: "check-circle", text: "Use Defined Requirements"}
        ];
    }
    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillReceiveProps(nextProps){
        if(this.props.active && !nextProps.active){
            document.removeEventListener('keyup', this.handleKeyPress);
        }
        if(!this.props.active && nextProps.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keyup', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        if(e.key === "Escape"){
            this.handleChange(_.filter(this.options, {id: "NONE"}));
        }
    };
    handleChange(value){
        let newValue = _.differenceBy(value, this.props.value, (item) => item.id);
        if(newValue.length > 0){
            if(newValue[0].id === "NONE"){
                this.props.onChange && this.props.onChange(newValue);
                this.props.onNext && this.props.onNext();
            }else{
                let noneIndex = _.findIndex(value, {id: "NONE"});
                if(noneIndex >= 0){
                    value.splice(noneIndex, 1);
                    this.props.onChange && this.props.onChange(value);
                }else{
                    this.props.onChange && this.props.onChange(value);
                }
            }
        }else{
            this.props.onChange && this.props.onChange(value);
        }

    }
    renderOption(option, selected){
        let classes = ["mdi", "mdi-48px", "mdi-" + option.icon];
        if(selected){
            classes.push("mdi-light");
        }
        return(
            <div style = {{textAlign: "center"}}>
                <div className = {classes.join(" ")} />
                <span className="uk-text-large">{super.translate(option.text)}</span>
            </div>
        );
    }
    render(){
        return (
            <div>
            <OptionList options = {this.options} columns = {4} multiple = {true}
                        enableArrowKeys = {this.props.active}
                        value = {this.props.value} keyField = "id"
                        onChange = {(value) => this.handleChange(value)}
                        onRender = {(option, selected) => this.renderOption(option, selected)} />
            </div>
        );
    }
}

export class Manufacturer extends TranslatingComponent {

    render(){
        if(!this.props.active){
            return <ManufacturerSelection {...this.props}/>;
        }
        if(_.isEmpty(this.props.options)){
            return <ManufacturerForm {...this.props}/>;
        } else{
            return <ManufacturerSelection {...this.props}/>;
        }
    }

}

export const RequirementsStep = withHandlingTabKey(Requirements);

DefaultInactiveElement.contextTypes = {
    translator: PropTypes.object
};
Lookup.contextTypes = {
    translator: PropTypes.object
};
LoadRequirements.contextTypes = {
    translator: PropTypes.object
};
CertificateDocumentType.contextTypes = {
    translator: PropTypes.object
};
SpecialLoadTypes.contextTypes = {
    translator: PropTypes.object
};
Requirements.contextTypes = {
    translator: PropTypes.object
};