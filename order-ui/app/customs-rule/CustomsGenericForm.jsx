import * as axios from 'axios';
import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Form, Notify } from 'susam-components/basic';
import { RadioGroup } from "susam-components/basic/RadioGroup";
import * as DataTable from 'susam-components/datatable';
import { CardHeader, Grid, GridCell } from 'susam-components/layout';
import uuid from 'uuid';
import { LocationService, ProjectService } from "../services";
import { CompanyLocationList } from "./CompanyLocationList";

export class CustomsGenericForm extends TranslatingComponent{

    state = {customsOutput: {}};

    componentDidMount(){
        this.loadCustomsCompanies();
        this.loadLookups();
    }

    loadLookups(){
        let calls = [ProjectService.listCustomsInfo()];
        axios.all(calls).then(axios.spread((customsInfo)=>{
            this.setState({customsInfo: customsInfo.data.map(i=>this.mapCustomsInfo(i))});
        }));
    }

    mapCustomsInfo(item){
        if(item.code === "NEVER") {
            return _.set(item, "name", "Never Ask") 
        } else if(item.code === "ASK") {
            return _.set(item, "name", "Should be Ask") 
        } else {
            return item
        }
    }

    updateState(key, value){
        let data = _.cloneDeep(this.props.data);
        data[key] = value;
        this.props.onChange(data);
    }
    updateCustomsAgent(value){
        let customsOutput = _.cloneDeep(this.state.customsOutput);
        customsOutput.customsAgent= value;
        this.setState({customsOutput: customsOutput}, () => this.loadCustomsAgentLocations());
    }
    updateCustomsAgentLocation(value){
        let customsOutput = _.cloneDeep(this.state.customsOutput);
        customsOutput.customsAgentLocation = value;
        this.setState({customsOutput: customsOutput});
    }
    loadCustomsCompanies(){
        LocationService.listCompaniesWithEuropeanCustomsLocations().then(response => {
            this.setState({customsAgents: response.data});
        }).catch(error => Notify.showError(error));
    }
    loadCustomsAgentLocations() {
        let {customsOutput} = this.state;
        if (customsOutput.customsAgent) {
            LocationService.findEuropeanCustomsLocations(customsOutput.customsAgent.id, customsOutput.customsAgent.type).then(response => {
                if(response.data.length === 0){
                    Notify.showError("Selected company does not have customer warehouse definition");
                }
                this.setState({customsAgentLocations: response.data});
            }).catch(error => Notify.showError(error));
        }
    }

    checkWarehouseHasCustomsCode(){
        if(this.state.customsOutput.customsAgentLocation){
            if(!this.state.customsOutput.customsAgentLocation.europeanCustomsCode){
                Notify.showError("Customs agent location does not have customs code");
                return false;
            }
        }
        return true;
    }

    checkAgentLocationExists() {
        let customsAgentLocation = _.get(this.state, 'customsOutput.customsAgentLocation');
        return _.find(this.props.data.outputList, item => {
            return customsAgentLocation.id === item.customsAgentLocation.id;
        });
    }

    handleSaveCustomsOutput(){
        if(!this.form.validate()){
            return;
        }
        if(!this.checkWarehouseHasCustomsCode()){
            return;
        }
        if(this.checkAgentLocationExists()){
            let customsAgentLocation = _.get(this.state, 'customsOutput.customsAgentLocation');
            Notify.showError(`Customs agent location ${customsAgentLocation.name} already exists in the list`);
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

    renderCustomsOption(){
        if(this.props.isSender){
            return (
                <GridCell width = "1-1">
                    <RadioGroup inline={true} name="customs-option"
                                options={this.state.customsInfo} 
                                value = {this.props.data.option} 
                                onchange = {(value) => this.updateState("option", value)}/>
                </GridCell>
                );
        }
    }

    renderAgentForm(){
        if(!this.props.data.option || this.props.data.option.code === 'ASK'){
            return[
                <GridCell width = "1-1" key={uuid.v4()}>
                    <Form ref = {c => this.form = c}>
                        <Grid>
                            <GridCell width = "1-4">
                                <DropDown label = "Customs Agent" options = {this.state.customsAgents} required = {true}
                                        value = {this.state.customsOutput.customsAgent}
                                        onchange = {(value) => this.updateCustomsAgent(value)} />
                            </GridCell>
                            <GridCell width = "1-4">
                                <DropDown label = "Customs Agent Location" required = {true}
                                        options = {this.state.customsAgentLocations}
                                        value = {this.state.customsOutput.customsAgentLocation}
                                        onchange = {value => this.updateCustomsAgentLocation(value)} />
                            </GridCell>
                            <GridCell width = "1-4">
                                <div className = "uk-margin-top">
                                    <Button label = "save" style = "success" size = "small" onclick = {() => this.handleSaveCustomsOutput()} />
                                </div>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                ,
                <GridCell width = "1-1" key={uuid.v4()}>
                    <DataTable.Table data={this.props.data.outputList}>
                        <DataTable.Truncated wordCount = {3} width="20" header="Customs Agent" field = "customsAgent.name"/>
                        <DataTable.Truncated wordCount = {3} width="20" header="Customs Agent Location" field = "customsAgentLocation.name"/>
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
            ];
        }
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
                    <CompanyLocationList data = {this.props.data} isSender = {this.props.isSender}
                                         onSave = {(value) => this.handleSaveCompanyLocation(value)}
                                         onDelete = {(value) => this.handleDeleteCompanyLocation(value)}/>
                </GridCell>
                <GridCell width = "1-1">
                    <CardHeader title = "Customs" />
                </GridCell>
                {this.renderCustomsOption()}
                {this.renderAgentForm()}
            </Grid>
        );
    }
}