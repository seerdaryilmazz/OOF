import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {Grid, GridCell} from 'susam-components/layout'
import {Span, TextInput, DropDown, Button, Notify} from 'susam-components/basic'
import {NumberInput, NumericInput, Chip} from 'susam-components/advanced'
import {EquipmentRequirement} from './EquipmentRequirement';
import {EquipmentRequirementValidator} from "./validation/EquipmentRequirementValidator";
import {StepValidationResult} from "./validation/StepValidationResult";

export class EquipmentRequirementList extends React.Component {

    constructor(props){
        super(props);
        this.state = {validationResults:[]};
    }

    componentDidMount(){
        this.validateEquipments(this.props.value);
        if(this.props.active){
            this.setState({activeIndex: 0});
        }

    }
    componentWillReceiveProps(nextProps){
        this.validateEquipments(nextProps.value);
        if(nextProps.active !== this.props.active){
            if(nextProps.active){
                this.setState({activeIndex: 0});
            }else{
                this.setState({activeIndex: null});
            }
        }
    }
    componentDidUpdate(){
        if(this.state.activeIndex === null && this.props.active){
            document.addEventListener('keydown', this.handleKeyPress);
        }else{
            document.removeEventListener('keydown', this.handleKeyPress);
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        if(e.key === "Tab" && this.state.activeIndex == null){
            this.props.onNext();
        }
    };
    handleNext(){
        this.setState({activeIndex: null}, () => this.props.onNext());
    }

    handlePrev(){
        this.setState({activeIndex: null}, () => this.props.onPrev());
    }

    handleNextFocus(){
        this.setState({activeIndex: null});
    }

    handleAddNew(){
        let value = _.cloneDeep(this.props.value);
        let state = _.cloneDeep(this.state);
        let errorIndex = -1;
        value.forEach((item, index) => {
            let validationResult = EquipmentRequirementValidator.validate(item);
            state.validationResults[index] = validationResult;
            if(validationResult.hasError()){
                errorIndex = index;
            }
        });
        if(errorIndex === -1){
            value.push({});
            state.activeIndex = value.length - 1;
        }else{
            state.activeIndex = errorIndex;
        }
        this.setState(state, () => this.props.onChange && this.props.onChange(value));
    }
    validateEquipments(value){
        let state = _.cloneDeep(this.state);
        value.forEach((item,index) => {
            state.validationResults[index] = this.validateEquipment(index, item);
        });
        this.setState(state);
    }
    validateEquipment(index, equipment){
        let result = new StepValidationResult();
        if(!equipment.equipmentCount || parseInt(equipment.equipmentCount) === 0){
            result.addMessage("Equipment count should be greater than '0'");
        }
        if(equipment.equipmentCountRequiredByWarehouse){
            if(parseInt(equipment.equipmentCountRequiredByWarehouse) > parseInt(equipment.equipmentCount)){
                result.addMessage("Equipment count should be greater than warehouse requirement");
            }
        }
        return result;
    }
    handleChange(index, details){
        let value = _.cloneDeep(this.props.value);
        value[index] = details;
        this.props.onChange && this.props.onChange(value);
    }
    handleDelete(index){
        let value = _.cloneDeep(this.props.value);
        value.splice(index, 1);
        if(value.length === 0){
            value.push({});
        }
        this.props.onChange && this.props.onChange(value);
        if(index < this.state.activeIndex){
            this.setState({activeIndex: this.state.activeIndex - 1});
        }else if(index === this.state.activeIndex){
            this.setState({activeIndex: 0});
        }
    }
    handleEdit(index){
        this.setState({activeIndex: index});
    }
    handleCancel(index){
        this.setState({activeIndex: null});
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    render(){
        let style = {
            border: "1px solid #e0e0e0",
            borderRadius: "3px",
            padding: "12px",
            marginBottom: "12px"
        };

        let {value} = this.props;
        if(value.length === 0){
            value.push({});
        }
        let addNewButton = null;
        if(this.props.active){
            addNewButton = <Button label="Add New" size = "small" style = "success" onclick = {() => this.handleAddNew()} />;
        }
        let types = _.cloneDeep(this.props.types);
        value.forEach((item, index) => {
            if(this.state.activeIndex !== index && item.equipmentType){
                _.remove(types, {id: item.equipmentType.id});
            }
        });
        let details = value.map((item, index) => {
            return (
                <div key = {index} style = {style}>
                    <EquipmentRequirement  types = {types}
                                           value = {item}
                                           onNext = {() => this.handleNextFocus()} onPrev = {() => this.handlePrev()}
                                           validationResult = {this.state.validationResults[index]}
                                           active = {index === this.state.activeIndex}
                                           parentActive = {this.props.active}
                                           onChange = {(details) => this.handleChange(index, details)}
                                           onDelete = {() => this.handleDelete(index)}
                                           requiredByWarehouse = {item.equipmentCountRequiredByWarehouse}
                                           onEdit = {() => this.handleEdit(index)}/>
                </div>
            );
        });
        return (
            <div>
                {details}
                {addNewButton}
            </div>
        );
    }


}