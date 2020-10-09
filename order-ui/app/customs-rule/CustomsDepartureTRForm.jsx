import React from "react";
import _ from "lodash";
import * as axios from 'axios';
import uuid from 'uuid';

import {Grid, GridCell, CardHeader, Card, Modal} from 'susam-components/layout'
import {Span, Button, Notify, DropDown, Checkbox} from 'susam-components/basic'
import {TranslatingComponent} from 'susam-components/abstract'
import {CompanySearchAutoComplete} from 'susam-components/oneorder'
import * as DataTable from 'susam-components/datatable';

import {LocationService, Kartoteks} from "../services";
import {CompanyLocationList} from "./CompanyLocationList";

export class CustomsDepartureTRForm extends TranslatingComponent{

    state = {customsOutput: {}}

    updateState(key, value){
        let data = _.cloneDeep(this.props.data);
        data[key] = value;
        this.props.onChange(data);
    }
    updateCustomsState(key, value){
        let customsOutput = _.cloneDeep(this.state.customsOutput);
        customsOutput[key] = value;
        this.setState({customsOutput: customsOutput});
    }
    checkCustomsOfficeAndAgentExists(){
        return _.find(this.props.data.outputList, item => {
            return this.state.customsOutput.customsOffice.id === item.customsOffice.id &&
                this.state.customsOutput.customsAgent.id === item.customsAgent.id;
        });
    }
    handleSaveCustomsOutput(){
        if(this.checkCustomsOfficeAndAgentExists()){
            Notify.showError(`Customs office and agent already exists in the list`);
            return;
        }
        let data = _.cloneDeep(this.props.data);
        let customsOutput = _.cloneDeep(this.state.customsOutput);
        if(!customsOutput._key){
            customsOutput._key = uuid.v4();
            data.outputList.push(customsOutput);
        }else{
            let index = _.findIndex(data.outputList, {_key: customsOutput._key});
            if(index >= 0){
                data.outputList[index] = customsOutput;
            }
        }
        this.setState({customsOutput: {}}, () => this.props.onChange(data));
    }
    handleOutputEditClick(value){
        this.setState({customsOutput: value});
    }
    handleOutputDeleteClick(value){
        Notify.confirm("Are you sure?", () => {
            this.deleteOutput(value);
        });
    }
    deleteOutput(value){
        let data = _.cloneDeep(this.props.data);
        _.remove(data.outputList, {_key: value._key});
        this.props.onChange(data);
    }
    handleDeleteCompanyLocation(value){
        let data = _.cloneDeep(this.props.data);
        _.remove(data.locations, {_key: value._key});
        this.props.onChange(data);
    }
    handleSaveCompanyLocation(companyLocation){
        let data = _.cloneDeep(this.props.data);
        if(companyLocation._key){
            let index = _.findIndex(data.locations, {_key: companyLocation._key});
            if(index >= 0){
                data.locations[index] = companyLocation;
            }
        }else{
            companyLocation._key = uuid.v4();
            data.locations.push(companyLocation);
        }
        this.props.onChange(data);
    }

    render(){
        if(!this.props.data){
            return null;
        }
        return(
            <Grid>
                <GridCell width = "1-1">
                    <CardHeader title = "Locations" />
                </GridCell>
                <GridCell width = "1-1">
                    <CompanyLocationList data = {this.props.data} isSender = {true}
                                         onSave = {(value) => this.handleSaveCompanyLocation(value)}
                                         onDelete = {(value) => this.handleDeleteCompanyLocation(value)}/>
                </GridCell>
                <GridCell width = "1-1">
                    <CardHeader title = "Customs" />
                </GridCell>
                <GridCell width = "1-4">
                    <DropDown label = "Customs Office"
                              options = {this.props.customsOffices}
                              value = {this.state.customsOutput.customsOffice}
                              onchange = {value => this.updateCustomsState("customsOffice", value)} />
                </GridCell>
                <GridCell width = "1-4">
                    <CompanySearchAutoComplete label = "Customs Agent"
                                               value = {this.state.customsOutput.customsAgent}
                                               onchange = {(value) => this.updateCustomsState("customsAgent", value)} />
                </GridCell>
                <GridCell width = "1-4">
                    <div className = "uk-margin-top">
                        <Button label = "save" style = "success" size = "small" onclick = {() => this.handleSaveCustomsOutput()} />
                    </div>
                </GridCell>
                <GridCell width = "1-1">
                    <DataTable.Table data={this.props.data.outputList}>
                        <DataTable.Truncated wordCount = {2} width="20" header="Customs Office" field = "customsOffice.name"/>
                        <DataTable.Truncated wordCount = {3} width="20" header="Customs Agent" field = "customsAgent.name"/>
                        <DataTable.ActionColumn >
                            <DataTable.ActionWrapper track="onclick" onaction={(value) => {this.handleOutputEditClick(value)}}>
                                <Button label="Edit" flat={true} style="success" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper track="onclick" onaction={(value) => {this.handleOutputDeleteClick(value)}}>
                                <Button label="Delete" flat={true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }
}