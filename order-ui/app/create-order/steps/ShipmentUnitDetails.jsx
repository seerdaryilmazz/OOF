import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { AutoComplete, NumberInput, NumericInput } from 'susam-components/advanced';
import { Button, DropDown, Notify, Span } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { OrderService } from '../../services';
import { DefaultInactiveElement } from './OrderSteps';

const MAX_STACK = 20;

export class ShipmentUnitDetails extends TranslatingComponent {


    constructor(props){
        super(props);
        this.firstElementId = "quantity";
        this.lastElementId = "stack";
        this.focusedElementId = null;
        this.state = {stackOptions: []};
        this.truckHeight = 300;
    }
    
    populateStackOptions(max){
        this.maxStackOption = {id: 0, name: super.translate("Maximum")};
        this.noStackOption = {id: 1, name: super.translate("Not Stackable")};

        let stackOptions = [...Array(_.clamp(max, 1, MAX_STACK) - 1).keys()].map(item => {
            return {id: item + 2, name: "" + (item + 2)}
        });
        stackOptions.splice(0, 0, this.noStackOption);
        if(_.get(this.props.value,'packageType.packageGroup.code') === 'BULK'){
            stackOptions.push(this.maxStackOption);
        }
        return stackOptions;
    }


    componentDidMount(){
        if(this.props.active){
            this.addKeyDownEventListener();
            this.focusOn(this.firstElementId);
            this.findLastElementId();
            this.setState({stackOptions: this.populateStackOptions(MAX_STACK)})
        }
    }

    componentWillUnmount(){
        this.removeKeyDownEventListener();
    }
    removeKeyDownEventListener(){
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    addKeyDownEventListener(){
        document.addEventListener('keydown', this.handleKeyPress);
    }
    componentDidUpdate(prevProps, prevState){
        if(this.props.active){
            this.findLastElementId();
        }
        if(!this.props.active && prevProps.active){
            this.removeKeyDownEventListener();
        }

        if(this.props.active && !prevProps.active){
            this.focusOn(this.firstElementId);
            this.addKeyDownEventListener();
            this.populateStackOptionsByMaxStack();
        }

    }
    findLastElementId(){
        if(this.props.value && this.props.value.template){
            if(this.props.value.template.stack){
                this.lastElementId = "height";
            }
            if(this.lastElementId === "height" && this.props.value.template.height){
                this.lastElementId = "length";
            }
            if(this.lastElementId === "length" && this.props.value.template.length){
                this.lastElementId = "width";
            }
            if(this.lastElementId === "width" && this.props.value.template.width){
                this.lastElementId = "packageType";
            }
            if(this.lastElementId === "packageType" && this.props.value.template.type){
                this.lastElementId = "quantity";
            }
        }else{
            this.lastElementId = "stack";
        }
    }
    handleKeyPress = (e) => {
        if(e.key === "Tab"){
            e.shiftKey ? this.handleShiftTab(e) : this.handleTab(e);
        }
    };

    handleTab(e){
        this.focusedElementId = e.target.id;
        if (this.focusedElementId === this.lastElementId) {
            setTimeout(() => this.handleNext(), 200);
        }
    }
    handleShiftTab(e) {
        this.focusedElementId = e.target.id;
        if (this.focusedElementId === this.firstElementId) {
            setTimeout(() => this.handlePrev(), 200);
        }
    }

    handleNext(){
        this.props.onNext(this.props.value);
    }
    handlePrev(){
        this.props.onPrev(this.props.value);
    }
    focusOn(elementId){
        document.getElementById(elementId).focus();
        this.focusedElementId = elementId;
    }
    updateState(key, value){
        let details = _.cloneDeep(this.props.value);
        details[key] = value;
        if(details.stackability){
            if(!_.find(this.state.stackOptions, {id: details.stackability.id})){
                details.stackability = null;
            }
        }
        if(details.packageType){
            details.isHangingLoad = details.packageType.code === "Stange";
        }
        if(details.width && details.length && (details.stackability || details.height) && details.quantity){
            let stack = null;
            if(details.stackability){
                stack = details.stackability.id !== 0 ? details.stackability.id : (details.height ? this.findMaxStack(details.height) : null);
            }
            OrderService.calculateLoadingMeterAndVolume(details.width, details.length, details.height,
                stack, details.quantity)
                .then(response => {
                    details.ldm = response.data.ldm;
                    details.volume = response.data.volume;
                    this.props.onChange && this.props.onChange(details);
                })
                .catch(error => Notify.showError(error));
        }else{
            this.props.onChange && this.props.onChange(details);
        }
    }
    updatePackageType(value){
        this.updateState("packageType", value);
        this.populateStackOptionsByMaxStack()
        if(value){
            OrderService.getPackageTypeRestrictions(value.id).then(response => {
                this.setState({restrictions: response.data}, () => {
                    let details = _.cloneDeep(this.props.value);
                    details.restrictions = response.data;
                    this.props.onChange && this.props.onChange(details);
                });
            }).catch(error => Notify.showError(error));
        }else{
            let details = _.cloneDeep(this.props.value);
            details.restrictions = null;
            this.props.onChange && this.props.onChange(details);
        }
    }

    populateStackOptionsByMaxStack(){
        let maxStack = MAX_STACK;
        if(this.props.value && this.props.value.height){
            maxStack = this.findMaxStack(this.props.value.height);
        }
        this.setState({stackOptions: this.populateStackOptions(maxStack)})
    }

    findMaxStack(height){
        return Math.floor(this.truckHeight / parseFloat(height));
    }
    updateHeight(key, value){
        if(value){
            let maxStack = this.findMaxStack(value);
            let stackOptions = this.populateStackOptions(maxStack);
            this.setState({stackOptions: stackOptions}, () => {
                this.updateState(key, value);
            });
        }else{
            this.updateState(key, value);
        }
    }

    handleDelete(){
        this.props.onDelete && this.props.onDelete();
    }
    handleEdit(){
        this.props.onEdit && this.props.onEdit();
    }

    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }

    renderValidation(){
        let validationResult = null;
        if(this.props.validationResult && this.props.validationResult.hasError()){
            validationResult = this.props.validationResult.messages.map(item => {
                return(
                    <GridCell key = {item} width = "1-1">
                        <span className="uk-text-danger" >{super.translate(item)}</span>
                    </GridCell>
                );
            });
        }
        return <GridCell width = "1-1" noMargin = {true}><Grid>{validationResult}</Grid></GridCell>;
    }
    renderInactive(){
        if(!this.props.value){
            return <DefaultInactiveElement value="No selection" />;
        }
        let notProvidedText = super.translate("Not Provided");
        let dimensionsText = "";
        let {packageType, width, length, height, stackability} = this.props.value;
        let widthText = width ? width + " cm." : notProvidedText;
        dimensionsText += ` ${super.translate("Width")}: ${widthText}`;
        let lengthText = length ? length + " cm." : notProvidedText;
        dimensionsText += ` ${super.translate("Length")}: ${lengthText}`;
        let heightText = height ? height + " cm." : notProvidedText;
        dimensionsText += ` ${super.translate("Height")}: ${heightText}`;
        let dimensions = <span className = "heading_a_thin" style = {{marginLeft: "12px"}}>{dimensionsText}</span>;
        let stackabilityText = stackability ? _.isNumber(stackability.name) ? stackability.name : super.translate(stackability.name) : notProvidedText;
        let stackInfo = <span className = "heading_a_thin" style = {{marginLeft: "12px"}}>{`${super.translate("Stackability")}:${stackabilityText}`}</span>
        let buttons = null;
        if(this.props.parentActive){
            buttons =
                <GridCell width = "1-1">
                    <Button label = "Edit" style = "success" flat = {true} size = "small" onclick = {() => this.handleEdit()}/>
                    <Button label = "Delete" style = "danger" flat = {true} size = "small" onclick = {() => this.handleDelete()}/>
                </GridCell>
        }

        return (
            <Grid>
                {this.renderValidation()}
                <GridCell width = "1-1">
                    <span className = "heading_a_thin">{this.props.value.quantity} {packageType ? super.translate(packageType.name) : ""}</span>
                    {dimensions}
                    {stackInfo}
                </GridCell>
                {buttons}
            </Grid>
        );
    }
    renderActive(){
        let {template} = this.props.value;
        let packageTypeInput = <DropDown id="packageType" label="Package Type" options = {this.props.packageTypes}
                                             value = {this.props.value.packageType} required = {true} translate={true}
                                             onchange = {(value) => this.updatePackageType(value)} />;
        let widthInput = <NumericInput id = "width" unit="cm" label="Width" digitsOptional = {true} digits = {2}
                                       value={this.props.value.width} onchange={(value) => {this.updateState("width", value)}}/>;
        let lengthInput = <NumericInput id = "length" unit="cm" label="Length" digitsOptional = {true} digits = {2}
                                        value={this.props.value.length} onchange={(value) => {this.updateState("length", value)}}/>;
        let heightInput = <NumericInput id = "height" unit="cm" label="Height" digitsOptional = {true} digits = {2}
                                        value={this.props.value.height} onchange={(value) => {this.updateHeight("height", value)}}/>;
        let stackInput = <AutoComplete id = "stack" label="Stackability" source = {this.state.stackOptions}
                                       value={this.props.value.stackability} minLength = "0" placeholder="..."
                                       onchange={(value) => {this.updateState("stackability", value)}}
                                       required = {true} onclear = {() => this.updateState("stackability", null)}/>;
        if(template){
            if(template.packageType){
                packageTypeInput = <Span label = "Package Type" value = {template.packageType.name} translate={true}/>;
            }
            if(template.width){
                widthInput = <Span label = "Width" value = {template.width + " cm."} />;
            }
            if(template.length){
                lengthInput = <Span label = "Length" value = {template.length + " cm."} />;
            }
            if(template.height){
                heightInput = <Span label = "Height" value = {template.height + " cm."} />;
            }
            if(template.stackSize){
                stackInput = <Span label = "Stackability" value = {template.stackSize.name} translate={true}/>;
            }
        }
        return(
            <Grid>
                {this.renderValidation()}
                <GridCell width = "1-6">
                    <NumberInput id = "quantity" label = "Quantity" value = {this.props.value.quantity} required = {true}
                                 onchange = {(value) => this.updateState("quantity", value)} />
                </GridCell>
                <GridCell width = "1-6">
                    {packageTypeInput}
                </GridCell>
                <GridCell width = "1-6">
                    {widthInput}
                </GridCell>
                <GridCell width = "1-6">
                    {lengthInput}
                </GridCell>
                <GridCell width = "1-6">
                    {heightInput}
                </GridCell>
                <GridCell width = "1-6">
                    {stackInput}
                </GridCell>
                <GridCell width = "1-1">
                    <div className = "uk-align-center">
                        <Button label="Delete" size = "small" flat = {true} style = "danger" onclick = {() => this.handleDelete()} />
                    </div>
                </GridCell>
            </Grid>
        );
    }
}

ShipmentUnitDetails.contextTypes = {
    translator: PropTypes.object
};