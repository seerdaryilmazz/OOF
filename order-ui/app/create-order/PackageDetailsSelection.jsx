import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {Grid, GridCell} from 'susam-components/layout'
import {Span, TextInput, DropDown, Button, Notify} from 'susam-components/basic'
import {NumberInput} from 'susam-components/advanced'
import {CompanySearchAutoComplete} from 'susam-components/oneorder';

import {Kartoteks, OrderService} from '../services';

export class PackageDetailsSelection extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        OrderService.getPackageTypes().then(response => {
            this.setState({types: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }

    updateState(key, value) {
        let state = _.cloneDeep(this.state);
        state[key] = value;


        this.setState(state, () => this.checkDataAndCallChange());
    }

    checkDataAndCallChange(){
        if(this.state.packageType && this.state.width && this.state.length && this.state.height){
            let data = this.state;
            data._key = uuid.v4();
            this.props.onChange && this.props.onChange(data);
        }
    }


    handleSelect(option){
        this.props.onChange && this.props.onChange(option);
    }
    focus(){
        this.packageType && this.packageType.focus();
    }
    render(){
        if(this.props.active){
            return this.renderActive();
        }else{
            return this.renderInactive();
        }
    }

    renderBox(option){
        let style = {
            border: "1px solid #e0e0e0",
            cursor: "pointer",
            borderRadius: "3px",
            padding: "12px"
        };
        let check = null;
        if(this.props.value && this.props.value._key === option._key){
            style.backgroundColor = "#64b5f6";
            style.color = "#FFFFFF";
            style.border = "1px solid #2196f3";
            check = <i className="uk-icon uk-icon-check uk-icon-medium uk-text-contrast" />;

        }
        return(
            <GridCell key = {option._key} width = "1-3">
                <div style = {style} onClick = {() => this.handleSelect(option)}>
                    <Grid>
                        <GridCell width = "4-5" noMargin = {true}>
                            <Grid>
                                <GridCell width="1-1" noMargin = {true}>
                                    <span className = "uk-text-bold">{option.packageType.name}</span>
                                </GridCell>
                                <GridCell width="1-3" noMargin = {true}>
                                    <span style = {{opacity: .8}}>{option.width ? option.width + " cm" : ""}</span>
                                </GridCell>
                                <GridCell width="1-3" noMargin = {true}>
                                    <span style = {{opacity: .8}}>{option.length ? option.length + " cm" : ""}</span>
                                </GridCell>
                                <GridCell width="1-3" noMargin = {true}>
                                    <span style = {{opacity: .8}}>{option.height ? option.height + " cm" : ""}</span>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width = "1-5" noMargin = {true}>
                            {check}
                        </GridCell>
                    </Grid>
                </div>
            </GridCell>
        );
    }
    renderInactive(){
        if(!this.props.value){
            return <span>No selection</span>;
        }
        let options = this.props.options && this.props.options.length > 0 ?  this.props.options : [this.props.value];
        return this.renderActiveWithOptions(options);

    }
    renderActive(){
        if(this.props.options && this.props.options.length > 0){
            return this.renderActiveWithOptions(this.props.options);
        }else{
            return this.renderActiveWithoutOptions();
        }
    }
    renderActiveWithoutOptions(){
        return(
            <Grid>
                <GridCell width = "1-4">
                    <DropDown options = {this.state.types} ref = {c => this.packageType = c}
                              value = {this.state.packageType} required = {true}
                              onchange = {(value) => this.updateState("packageType", value)} />
                </GridCell>
                <GridCell width = "1-4">
                    <NumberInput label="Width" value = {this.state.width} unit = "cm"
                                 onchange = {(value) => this.updateState("width", value)} />
                </GridCell>
                <GridCell width = "1-4">
                    <NumberInput label="Length" value = {this.state.length} unit = "cm"
                                 onchange = {(value) => this.updateState("length", value)} />
                </GridCell>
                <GridCell width = "1-4">
                    <NumberInput label="Height" value = {this.state.height} unit = "cm"
                                 onchange = {(value) => this.updateState("height", value)} />
                </GridCell>
            </Grid>
        );
    }
    renderActiveWithOptions(options){
        let optionBoxes = options.map(option => this.renderBox(option));
        return <div tabIndex = "0" style = {{outline: "none"}}><Grid>{optionBoxes}</Grid></div>;
    }

}