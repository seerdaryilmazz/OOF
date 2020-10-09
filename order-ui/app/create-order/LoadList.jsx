import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';
import {Button,Form, DropDown, TextInput} from 'susam-components/basic';
import {DateTime, NumericInput} from 'susam-components/advanced';
import {Table} from 'susam-components/table';

import {NewLoadForm} from './NewLoadForm';

export class LoadList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {loadData: {}, loadList: this.props.data};
        this.state.headers = this.getHeaders();
        this.state.inlineEditForm = this.getInlineEditForm();
        this.state.actions = this.getActions();
    }
    getActions() {
        return {
            actionButtons: [
                {
                    icon: "pencil",
                    action: this.handleRowEdit,
                    title: "edit"
                }
            ],
            rowDelete: {
                icon: "close",
                action: this.handleRowDelete,
                title: "remove",
                confirmation: "Are you sure you want to delete?"
            },
            rowClick: this.handleRowClick
        };
    }
    getInlineEditForm() {
        return {
            loadAddress: [<TextInput required={true}/>],
            unloAdaddress: [<TextInput required={true}/>],
            readydate: [<DateTime label="Select Date" required={true} format="DD/MM/YYYY"/>],
            ogdate: [<DateTime label="Select Date" required={true} format="DD/MM/YYYY"/>],
            kap: [<NumericInput required={true} digits="0" digitsOptional={false} unit=""/>],
            grossweight: [<NumericInput required={true} digits="2" digitsOptional={true} unit="kg."/>],
            neatweight: [<NumericInput required={true} digits="2" digitsOptional={true} unit="kg."/>],
            volume: [<NumericInput required={true} digits="2" digitsOptional={true} unit="m3."/>],
            ldm: [<NumericInput required={true} digits="2" digitsOptional={true} unit="m3."/>],
            adr: [<TextInput required={true}/>],
            certificate: [<TextInput required={true}/>]
        };
    }
    getHeaders() {
       return [
            {
                name: "id",
                data: "id",
                hidden: true
            },
            {
                name: "Load Address",
                data: "loadAddress",
                width: "10%"
            },
            {
                name: "Unload Address",
                data: "unloadAddress",
                width: "10%"
            },
            {
                name: "Ready Date",
                data: "readyDate",
                width: "10%"
            },
            {
                name: "OG Date",
                data: "ogDate",
                width: "10%"
            },
            {
                name: "Amount",
                data: "kap",
                width: "10%"
            },
            {
                name: "Gross Weight",
                data: "grossweight",
                width: "10%"
            },
            {
                name: "Dead Weight",
                data: "neatweight",
                width: "10%"
            },
            {
                name: "Volume",
                data: "volume",
                width: "10%"
            },
            {
                name: "LDM",
                data: "ldm",
                width: "10%"
            },
            {
                name: "ADR Class",
                data: "adrClass",
                width: "10%"
            },
            {
                name: "Certificate",
                data: "certificate",
                width: "10%"
            }
        ];
    }
    
    handleAddLoadOnClick() {
        let state = _.cloneDeep(this.state);
        state.loadData = {};
        state.loadData._id = null;
        this.setState(state);
        this.newLoadForm.show();
    }
    handleNewLoadClose(){
        this.newLoadForm.hide();
    }

    handleRowEdit = (values) => {
        let state = _.cloneDeep(this.state);
        state.loadData = values;
        this.setState(state);
        this.newLoadForm.show();
    }

    handleRowClick = (values) =>{
        this.props.onLoadSelect && this.props.onLoadSelect(values);
    }


    handleRowDelete = (values) => {
        this.props.onLoadDelete && this.props.onLoadDelete(values);
        return true;
    }


    handleNewLoadSave(load){
        if(load._id == null){
            load._id = uuid.v4();
            this.props.onLoadAdd && this.props.onLoadAdd(load);
        }else{
            this.props.onLoadEdit && this.props.onLoadEdit(load);
        }
    }
    render(){
        return(
            <Card title = "Loads" toolbarItems = {[{icon:"plus", action: () => this.handleAddLoadOnClick()}]}>
                <Grid>
                    <GridCell width="1-1">
                        <Table headers={this.state.headers} actions={this.state.actions}
                               insertion={this.state.insertion} data={this.props.data}
                               hover={true}>
                        </Table>
                    </GridCell>
                </Grid>
                <NewLoadForm ref = {(c) => this.newLoadForm = c}
                                 onsave = {(load) => this.handleNewLoadSave(load)}
                                 onclose = {() => this.handleNewLoadClose()}
                                 load = {this.state.loadData}/>

            </Card>
        );
    }
}
LoadList.contextTypes = {
    translator: React.PropTypes.object
};
