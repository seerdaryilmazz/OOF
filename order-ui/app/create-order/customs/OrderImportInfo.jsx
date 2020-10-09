import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {Card, Grid, GridCell, CardSubHeader} from 'susam-components/layout';
import {TextInput,Button,DropDown} from 'susam-components/basic';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';

export class OrderImportInfo extends React.Component{
    constructor(props){
        super(props);
        this.state = {};
    }
    componentDidMount(){
        this.getExportCustoms();
        this.getImportCustoms();
        this.getCustomsType();
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

    getCustomsType(){
        axios.get('/order-service/lookup/customs-type').then((response)=>{
            let state = _.cloneDeep(this.state);
            state.customTypes = response.data;
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
                <CardSubHeader title="Import" />
                <Grid>
                    <GridCell width="1-1" >
                        <Grid>

                            <GridCell width="1-1">

                                <DropDown label="Varış Gümrüğü" required={true}
                                          onchange={(value) => this.handleValueChange("selectedImportCustom" ,value)}
                                          value={this.state.selectedImportCustom}
                                          labelField="name"
                                          options={this.state.exportCustoms}/>


                            </GridCell>
                            <GridCell width="1-1">

                                <DropDown label="Gümrük Tipi" required={true}
                                          onchange={(value) => this.handleValueChange("selectedCustomType", value)}
                                          value={this.state.selectedCustomType}
                                          options={this.state.customTypes}/>
                            </GridCell>

                            <GridCell width="1-1">
                                <CompanySearchAutoComplete label="Varış Gümrük Lokasyonu" required={true} />
                            </GridCell>
                            <GridCell width="1-1">
                                <CompanySearchAutoComplete label="Gümrük Firması "
                                                           required={true}/>
                            </GridCell>
                            <GridCell width="1-1">

                                <DropDown label="Çıkış Gümrüğü" required={true}
                                          onchange={(value) => this.handleValueChange( "selectedExportCustom",value)}
                                          value={this.state.selectedExportCustom}
                                          labelField="name"
                                          options={this.state.importCustoms}/>
                            </GridCell>


                            <GridCell width="1-1">
                                <CompanySearchAutoComplete label="Ön Taşıma Acentesı "
                                                           required={true}/>
                            </GridCell>
                            <GridCell width="1-2">
                                <TextInput value={this.state.agentNo} label="Acente Sipariş No" onchange={(val)=>{
                                    this.setState({agentNo:val});
                                    }} parsley={this.state.parsley}/>
                            </GridCell>

                        </Grid>
                    </GridCell>
                </Grid>
            </div>

        );
    }
}