import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Form} from 'susam-components/basic';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';

export class SenderRulesConsignees extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {selectedIndex: -1};
    }
    componentWillReceiveProps(nextProps){
        if(!_.isEqual(this.props.ruleSetId, nextProps.ruleSetId)){
            this.setState({consignee: null});
        }
    }
    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }
    handleDeleteClick(item, index){
        let data = _.cloneDeep(this.props.data);
        data.splice(index, 1);
        this.props.onchange && this.props.onchange(data);
    }
    handleSaveClick(){
        if(!this.form.validate()){
            return;
        }
        let data = _.cloneDeep(this.props.data);
        if(this.state.selectedIndex){
            data[this.state.selectedIndex] = _.cloneDeep(this.state.consignee);
        }
        this.setState({consignee: null, selectedIndex: -1});
        this.props.onchange && this.props.onchange(data);
    }
    handleAddClick(){
        if(!this.form.validate()){
            return;
        }
        let data = _.cloneDeep(this.props.data);
        if(!data){
            data = [];
        }
        data.push(this.state.consignee);
        this.setState({consignee: null});
        this.props.onchange && this.props.onchange(data);
    }
    handleSelectItem(e, item, index){
        e.preventDefault();
        this.setState({consignee: item, selectedIndex: index});
    }

    renderItemList(item, index){
        return (
            <li key = {item.id}>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width="9-10" noMargin = {true}>
                            <div className="md-list-heading">
                                <a href="#" onClick={(e) => this.handleSelectItem(e, item, index)}>{item.name}</a>
                            </div>
                        </GridCell>
                        <GridCell width="1-10" noMargin = {true}>
                            <Button label="delete" flat = {true} style="danger" size="small" waves = {true}
                                    onclick = {(item) => this.handleDeleteClick(item, index)} />
                        </GridCell>
                    </Grid>
                </div>
            </li>
        );
    }

    render(){

        let saveButton = <Button label="add" size="small" style="success" waves = {true} onclick = {() => this.handleAddClick()}/>;
        if(this.state.selectedIndex != -1){
            saveButton = <Button label="save" size="small" style="success" waves = {true} onclick = {() => this.handleSaveClick()}/>;
        }

        let list = <div>{super.translate("There are no Consignees")}</div>;
        if(this.props.data && this.props.data.length > 0){
            list = <ul className="md-list md-list-centered">
                {this.props.data.map((item, index) => this.renderItemList(item, index))}
            </ul>;
        }
        return (
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <Form ref = {(c) => this.form = c}>
                        <Grid>

                            <GridCell width="4-5">
                                <CompanySearchAutoComplete label="Consignee"
                                                    value = {this.state.consignee}
                                                    onchange = {(value) => this.updateState("consignee", value)}
                                                    required = {true}/>
                            </GridCell>
                            <GridCell width="1-5">
                                {saveButton}
                            </GridCell>

                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    {list}
                </GridCell>
            </Grid>
        );
    }
}