import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {Grid, GridCell} from 'susam-components/layout'
import {Span, TextInput, DropDown, Button, Notify} from 'susam-components/basic'
import {NumberInput, NumericInput, Chip} from 'susam-components/advanced'
import {AdrDetails} from './AdrDetails';
import {AdrDetailsValidator} from "./validation/AdrDetailsValidator";

export class AdrDetailsList extends React.Component {

    constructor(props){
        super(props);
        this.state = {validationResults: []};
    }

    componentDidMount(){
        if(this.props.active){
            this.setState({activeIndex: 0});
        }
    }
    componentWillReceiveProps(nextProps){
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
            let validationResult = AdrDetailsValidator.validate(item);
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

        let {value, validationResult} = this.props;
        if(value.length === 0){
            value.push({});
        }
        let addNewButton = null;
        if(this.props.active){
            addNewButton = <Button label="Add New" size = "small" style = "success" onclick = {() => this.handleAddNew()} />;
        }
        let details = value.map((item, index) => {
            let itemValidation = validationResult ? validationResult.getItemResult(index) : this.state.validationResults[index];
            return (
                <div key = {index} style = {style}>
                    <AdrDetails  value = {item} options = {this.props.options}
                                 adrPackageTypes = {this.props.adrPackageTypes}
                                 onNext = {() => this.handleNextFocus()} onPrev = {() => this.handlePrev()}
                                 validationResult = {itemValidation}
                                 active = {index === this.state.activeIndex}
                                 parentActive = {this.props.active}
                                 onChange = {(details) => this.handleChange(index, details)}
                                 onDelete = {() => this.handleDelete(index)}
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