import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';


import {Card, Grid, GridCell, CardSubHeader} from 'susam-components/layout';
import {TextInput,Button,DropDown} from 'susam-components/basic';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';


export class OrderExportInfo extends React.Component{
    constructor(props){
        super(props);
        this.state = {}
    }
    componentDidMount(){
        this.getExportCustoms();
        this.getImportCustoms();
        this.getCustomsServiceType();
        this.getCustomsProcessType();
    }
    getExportCustoms(){
        axios.get('/order-service/customs/export/TR').then((response)=>{
            let state = _.cloneDeep(this.state);
            state.exportCustoms = response.data;
            this.setState(state);
        }).catch((error) => {

            console.log(error);
        });
    }

    getImportCustoms(){
        axios.get('/order-service/customs/import/TR').then((response)=>{
            let state = _.cloneDeep(this.state);
            state.importCustoms = response.data;
            this.setState(state);
        }).catch((error) => {

            console.log(error);
        });
    }

    getCustomsServiceType(){
        axios.get('/order-service/lookup/customs-service-type').then((response)=>{
            let state = _.cloneDeep(this.state);
            state.customServiceTypes = response.data;
            this.setState(state);
        }).catch((error) => {

            console.log(error);
        });
    }

    getCustomsProcessType(){
        axios.get('/order-service/lookup/customs-process-type').then((response)=>{
            let state = _.cloneDeep(this.state);
            state.customProcessTypes = response.data;
            this.setState(state);
        }).catch((error) => {
            console.log(error);
        });
    }

    handleValueChange(field, value){
        this.props.onchange && this.props.onchange(field, value);
        let state = _.cloneDeep(this.state);
        state[field]=value;
        this.setState(state);
        }

    handleSave(){

        console.log("çıkış gümrüğü-->"+this.state.selectedExportCustom);
    }
    render(){
        return(
            <div>
                <CardSubHeader title="Export" />
                <Grid>
                    <GridCell width="1-1" >
                        <Grid>
                            <GridCell width="1-1">
                                <CompanySearchAutoComplete label="İmalatçı" required={true}
                                                           onchange={(value) => this.handleValueChange("manufacturer",value)}
                                value = {this.state.manufacturer}/>
                            </GridCell>

                            <GridCell width="1-1">
                                <br></br>

                                <DropDown label="Çıkış Gümrüğü" required={true}
                                          onchange={(value) => this.handleValueChange("selectedExportCustom",value)}
                                          value={this.state.selectedExportCustom}
                                          labelField="name"
                                          options={this.state.exportCustoms}/>

                            </GridCell>

                            <GridCell width="1-1">
                                <CompanySearchAutoComplete label="Gümrük Firması" required={true}
                                                           onchange={(value) => this.handleValueChange("customsAgent",value)}
                                                           value = {this.state.customsAgent}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <br></br>
                                <DropDown label="Varış Gümrüğü" required={true}
                                          onchange={(value) => this.handleValueChange("selectedImportCustom" ,value)}
                                          value={this.state.selectedImportCustom}
                                          labelField="name"
                                          options={this.state.importCustoms}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <br></br>
                                <DropDown label="Gümrükleme Şekli" required={true}
                                          onchange={(value) => this.handleValueChange("selectedCustomServiceType", value)}
                                          value={this.state.selectedCustomServiceType}
                                          options={this.state.customServiceTypes}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <br></br>
                                <DropDown label="Gümrükleme İşlem Tipi" required={true}
                                          onchange={(value) => this.handleValueChange("selectedCustomType", value)}
                                          value={this.state.selectedCustomType}
                                          options={this.state.customProcessTypes}/>

                            </GridCell>
                            <GridCell width="1-1">
                                <CompanySearchAutoComplete label="Teslim Acentesi "
                                                           required={true}
                                                           onchange={(value) => this.handleValueChange("deliveryAgent",value)}
                                                           value = {this.state.deliveryAgent}/>
                            </GridCell>
                            <GridCell width="1-2">
                                <TextInput value={this.state.agentNo} label="Acente Sipariş No" onchange={(val)=>{
                                    this.setState({agentNo:val});
                                    console.log(this.state.agentNo);
                                    }} parsley={this.state.parsley}/>
                            </GridCell>

                        </Grid>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}