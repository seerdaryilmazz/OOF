import React from "react";
import _ from "lodash";
import * as axios from 'axios';
import uuid from 'uuid';

import {Grid, GridCell, CardHeader, Card, Modal} from 'susam-components/layout'
import {Span, Button, Notify, DropDown, Checkbox, Form} from 'susam-components/basic'
import {TranslatingComponent} from 'susam-components/abstract'
import {CompanySearchAutoComplete} from 'susam-components/oneorder'
import * as DataTable from 'susam-components/datatable';

import {LocationService, Kartoteks} from "../services";
import {CompanyLocationList} from "./CompanyLocationList";
import * as Customs from '../Customs';

export class CustomsArrivalTRForm extends TranslatingComponent{

    state = {customsOutput: {}};

    componentDidMount(){
        this.loadInitialState(this.props);
    }

    componentWillReceiveProps(nextProps){
        let dataKey = _.get(this.props, "data._key");
        let nextDataKey = _.get(nextProps, "data._key");
        if(dataKey !== nextDataKey){
            this.loadInitialState(nextProps);
        }
    }

    loadInitialState(props){
        if(props.data && props.data.locations.length > 0){
            this.setState({showCustomsList: true});
            let customsCalls =
                props.data.locations.map(companyLocation => LocationService.getCustomsLocationByLocationId(companyLocation.location.id, _.get(companyLocation,"company.type")));

            axios.all(customsCalls).then((responses) => {
                let readOnlyCustomsOutput;
                responses.forEach(response => {
                    if(response.data){
                        readOnlyCustomsOutput = this.createReadOnlyCustomsOutput(response.data);
                    }
                });
                if(readOnlyCustomsOutput){
                    this.setState({readOnlyCustomsOutput: readOnlyCustomsOutput, customsOutput: this.createNewCustomsOutput(readOnlyCustomsOutput)});
                }
            }).catch(error => Notify.showError(error));
        }else{
            this.setState({showCustomsList: false, readOnlyCustomsOutput: null});
        }
    }

    updateState(key, value){
        let data = _.cloneDeep(this.props.data);
        data[key] = value;
        this.props.onChange(data);
    }
    updateCustomsState(key, value){
        let customsOutput = _.cloneDeep(this.state.customsOutput);
        customsOutput[key] = value;
        this.setState({customsOutput: customsOutput}, () => this.loadCustomsLocations());
    }
    updateCustomsLocation(value){
        let customsOutput = _.cloneDeep(this.state.customsOutput);
        if(value){
            customsOutput.customsLocation = {
                id: value.id,
                name: value.name,
                dangerousGoods: value.usedForDangerousGoods,
                temperatureControlledGoods: value.usedForTempControlledGoods
            };
        }else{
            customsOutput.customsLocation = null;
        }
        this.setState({customsOutput: customsOutput});
    }
    loadCustomsLocations() {
        let {customsOffice, customsType} = this.state.customsOutput;
        if (customsOffice && customsType && !Customs.isCustomsTypeFreeZone(customsType)) {
            LocationService.searchCustomsLocations(
                customsOffice.id, Customs.getCustomsWarehouseType(customsType),
                Customs.isCustomsTypeNeedsLoadTypeCheck(customsType) && this.props.data.dangerousGoods ? true : null,
                Customs.isCustomsTypeNeedsLoadTypeCheck(customsType) && this.props.data.temperatureControlledGoods ? true : null,
                Customs.isCustomsTypeOnBoardClearance(customsType) ? true : null
            ).then(response => {
                this.setState({customsLocations: response.data});
            }).catch(error => Notify.showError(error));
        }
    }

    checkConsigneeDefinition(){
        if(this.state.customsOutput.customsLocation &&
            (this.props.data.dangerousGoods || this.props.data.temperatureControlledGoods)){
            if(this.props.data.dangerousGoods && !this.state.customsOutput.customsLocation.dangerousGoods){
                Notify.showError("This warehouse can not handle dangerous goods");
                return false;
            }
            if(this.props.data.temperatureControlledGoods && !this.state.customsOutput.customsLocation.temperatureControlledGoods){
                Notify.showError("This warehouse can not handle temperature controlled goods");
                return false;
            }
        }
        return true;
    }
    checkLocationExists(){
        return _.find(this.props.data.outputList, item => {
            return this.state.customsOutput.customsLocation.id === item.customsLocation.id &&
                this.state.customsOutput.customsAgent.id === item.customsAgent.id;
        });
    }
    handleSaveCustomsOutput(){
        if(!this.form.validate()){
            return;
        }
        if(!this.checkConsigneeDefinition()){
            return;
        }
        if(this.checkLocationExists()){
            Notify.showError(`Customs location ${this.state.customsOutput.customsLocation.name} already exists in the list`);
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
        this.setState({customsOutput: this.createNewCustomsOutput(this.state.readOnlyCustomsOutput)}, () => this.props.onChange(data));
    }
    handleDeleteCompanyLocation(value){
        let data = _.cloneDeep(this.props.data);
        _.remove(data.locations, {_key: value._key});
        this.props.onChange(data);
    }
    handleSaveCompanyLocation(companyLocation){
        this.checkCustomsDetailsAndSave(companyLocation);
    }
    createNewCustomsOutput(readOnlyCustomsOutput){
        let customsOutput = {};
        if(readOnlyCustomsOutput){
            customsOutput = _.cloneDeep(this.state.customsOutput);
            customsOutput.customsOffice = readOnlyCustomsOutput.customsOffice;
            customsOutput.customsType = readOnlyCustomsOutput.customsType;
            customsOutput.customsLocation = readOnlyCustomsOutput.customsLocation;
            customsOutput._readOnly = true;
        }
        return customsOutput;

    }
    checkCustomsDetailsAndSave(companyLocation){
        LocationService.getCustomsLocationByLocationId(companyLocation.location.id, _.get(companyLocation,"company.type")).then(response => {
            if(!response.data){
                this.saveCompanyLocation(companyLocation);
                return;
            }
            if(this.state.readOnlyCustomsOutput){
                if(response.data.customsOffice && this.state.readOnlyCustomsOutput.customsOffice &&
                    response.data.customsOffice.id !== this.state.readOnlyCustomsOutput.customsOffice.id){
                    Notify.showError(`Selected location's customs office does not match with '${this.state.readOnlyCustomsOutput.customsOffice.name}'`);
                    return;
                }
                if(response.data.customsType && this.state.readOnlyCustomsOutput.customsType &&
                    response.data.customsType.code !== this.state.readOnlyCustomsOutput.customsType.code){
                    Notify.showError(`Selected location's customs type does not match with '${this.state.readOnlyCustomsOutput.customsType.name}'`);
                    return;
                }
                if(response.data.id && this.state.readOnlyCustomsOutput.customsLocation &&
                    response.data.id !== this.state.readOnlyCustomsOutput.customsLocation.id){
                    Notify.showError(`Selected location's customs location does not match with '${this.state.readOnlyCustomsOutput.customsLocation.name}'`);
                    return;
                }
            }else{
                let readOnlyCustomsOutput = this.createReadOnlyCustomsOutput(response.data);
                this.setState({readOnlyCustomsOutput: readOnlyCustomsOutput});
            }
            this.saveCompanyLocation(companyLocation);
        }).catch(error => Notify.showError(error));
    }
    createReadOnlyCustomsOutput(customsDetails){
        return {
            customsOffice: customsDetails.customsOffice,
            customsType: customsDetails.customsType,
            customsLocation: {
                id: customsDetails.id,
                name: customsDetails.name,
                dangerousGoods: customsDetails.usedForDangerousGoods,
                temperatureControlledGoods: customsDetails.usedForTempControlledGoods
            }
        };
    }
    saveCompanyLocation(companyLocation){
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
    handleOutputEditClick(value){
        this.setState({customsOutput: value}, () => this.loadCustomsLocations());
    }

    handleClickAddCustomsOptions() {
        if (this.props.data.locations.length === 0) {
            Notify.showError("Please add locations before adding customs locations");
            return;
        }
        this.setState({
            showCustomsList: true,
            customsOutput: this.createNewCustomsOutput(this.state.readOnlyCustomsOutput)
        }, () => this.loadCustomsLocations());
    }

    handleClickAddLocationOptions(){
        this.setState({showCustomsList: false});
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

    renderCustomsList(){
        if(!this.state.showCustomsList){
            return null;
        }
        let customsLocation = null;
        if(!Customs.isCustomsTypeFreeZone(this.state.customsOutput.customsType)){
            customsLocation =
                <GridCell width = "1-4">
                    <DropDown label = "Customs Location" required = {true}
                              options = {this.state.customsLocations}
                              value = {this.state.customsOutput.customsLocation}
                              onchange = {value => this.updateCustomsLocation(value)} />
                </GridCell>;
        }
        return(
            <Grid>
                <GridCell width = "1-1">
                    <Form ref = {c => this.form = c}>
                        <Grid>
                            <GridCell width = "1-1">
                                <CardHeader title = "Customs" />
                            </GridCell>
                            <GridCell width = "1-4">
                                <DropDown label = "Customs Office" required = {true}
                                          options = {this.props.customsOffices}
                                          value = {this.state.customsOutput.customsOffice}
                                          onchange = {value => this.updateCustomsState("customsOffice", value)} />
                            </GridCell>
                            <GridCell width = "1-4">
                                <DropDown label = "Customs Type" required = {true}
                                          options = {this.props.customsTypes} valueField = "code"
                                          value = {this.state.customsOutput.customsType}
                                          onchange = {value => this.updateCustomsState("customsType", value)} />
                            </GridCell>
                            <GridCell width = "1-2" />
                            {customsLocation}
                            <GridCell width = "1-4">
                                <CompanySearchAutoComplete label = "Customs Agent" required = {true}
                                                           value = {this.state.customsOutput.customsAgent}
                                                           onchange = {(value) => this.updateCustomsState("customsAgent", value)} />
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width = "1-4">
                    <div className = "uk-margin-top">
                        <Button label = "save" style = "success" size = "small" onclick = {() => this.handleSaveCustomsOutput()} />
                    </div>
                </GridCell>
                <GridCell width = "1-1">
                    <DataTable.Table data={this.props.data.outputList}>
                        <DataTable.Truncated wordCount = {2} width="20" header="Customs Office" field = "customsOffice.name"/>
                        <DataTable.Text width="20" header="Customs Type" field = "customsType.name"/>
                        <DataTable.Text width="20" header="Customs Location" field = "customsLocation.name"/>
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
    renderLocationsList(){
        let customsOptionsButton = this.state.showCustomsList ? null : <Button label = "Add customs options" size = "small" style = "success"
                                                                                onclick = {() => this.handleClickAddCustomsOptions()} />;
        return(
            <Grid>
                <GridCell width = "1-1">
                    <CardHeader title = "Locations" />
                </GridCell>
                <GridCell width = "1-1">
                    <CompanyLocationList data = {this.props.data} isSender = {false} readOnly = {this.state.showCustomsList}
                                         onSave = {(value) => this.handleSaveCompanyLocation(value)}
                                         onDelete = {(value) => this.handleDeleteCompanyLocation(value)}/>
                </GridCell>
                <GridCell width = "1-1" noMargin = {true}>
                    <Grid>
                        <GridCell width = "1-4">
                            <Checkbox label = "Use for Dangerous Goods" value = {this.props.data.dangerousGoods}
                                      readOnly = {this.state.showCustomsList}
                                      onchange = {value => this.updateState("dangerousGoods", value)} />
                        </GridCell>
                        <GridCell width = "1-4">
                            <Checkbox label = "Use for Temperature Controlled Goods" value = {this.props.data.temperatureControlledGoods}
                                      readOnly = {this.state.showCustomsList}
                                      onchange = {value => this.updateState("temperatureControlledGoods", value)} />
                        </GridCell>
                        <GridCell width = "1-2">
                            {customsOptionsButton}
                        </GridCell>
                    </Grid>
                </GridCell>
            </Grid>
        );
    }
    render(){
        if(!this.props.data){
            return null;
        }

        return(
            <Grid>
                <GridCell width = "1-1">
                    {this.renderLocationsList()}
                </GridCell>
                <GridCell width = "1-1">
                    {this.renderCustomsList()}
                </GridCell>
            </Grid>
        );
    }
}