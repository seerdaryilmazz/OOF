import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {TextInput, DropDown} from '../../basic';
import {Modal, Grid, GridCell} from '../../layout';

export class AdvancedTextFilter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {filter: {}}
    };

    componentDidMount(){

    }
    componentDidUpdate(){

    }
    componentWillReceiveProps(){

    }
    handleAdvancedClick(e){
        e.preventDefault();
        this.modal.open();
    }

    handleClose(){
        this.modal.close();
    }
    handleApply(){
        this.apply(this.state.filter);
        this.handleClose();
    }

    apply(filter){
        this.props.onchange && this.props.onchange(filter.text);
    }

    handleChangeAndApply(field, value){
        let filter = this.handleChange(field, value);
        this.apply(filter);
    }
    handleChange(field, value){
        let filter = _.cloneDeep(this.state.filter);
        filter[field] = value;
        this.setState({filter: filter});
        return filter;
    }

    render(){
        return(
            <Grid collapse = {true} noMargin = {true}>
                <GridCell width="3-4" noMargin = {true}>
                    <TextInput onchange = {(value) => this.handleChangeAndApply("text", value)} value = {this.state.filter.text}/>
                </GridCell>
                <GridCell width="1-4" noMargin = {true}>
                    <a href = "#" onClick = {(e) => this.handleAdvancedClick(e)}><i className="uk-icon-external-link"/> </a>
                </GridCell>
                <Modal ref = {(c) => this.modal = c} title = "Text Filter"
                       actions={[{label:"Close", action:() => this.handleClose()}, {label:"Apply", action:() => this.handleApply()}]}>
                    <DropDown options={[{id: "startsWith", name:"Starts With"},{id:"matchAny", name: "Match Any"}]} value = {this.state.filter.type} onchange = {(value) => this.handleChange("type", value)}/>
                    <TextInput onchange = {(value) => this.handleChange("text", value)} value = {this.state.filter.text}/>
                </Modal>
            </Grid>
        );
    }
}