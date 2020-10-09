import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';


import {Card, Grid, GridCell, CardSubHeader} from 'susam-components/layout';
import {TextInput,Button,DropDown} from 'susam-components/basic';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';


export  class OrderEuropeanInfo extends React.Component{
    constructor(props){
        super(props);
        this.state = {selectedExportCustom:{},selectedImportCustom:{},selectedCustomType:{},selectedCustomServiceType:{}}
    }
    componentDidMount(){

    }

    handleValueChange(field, value){
        this.props.onchange && this.props.onchange(field, value);
    }

    handleSave(){

    }
    render(){
        return(
            <div>
                <CardSubHeader title="European" />
                <Grid>
                    <GridCell width="1-1" >
                        <Grid>
                            <GridCell width="1-1">
                                <CompanySearchAutoComplete label="Fatura Sahibi "
                                                           required={true}/>

                            </GridCell>


                            <GridCell width="1-1">
                                <CompanySearchAutoComplete label="Acenta "
                                                           required={true}/>
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