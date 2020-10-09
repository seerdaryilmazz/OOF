import React from 'react';
import *  as axios from 'axios';
import _ from 'lodash';

import {Table} from '../../components/src/table';
import {Form, DropDown, TextInput} from '../../components/src/basic';

export class OrderVehicleTable extends React.Component{
    constructor(props){
        super(props);
        this.state={};
    }

    componentWillMount(){
        this.retrieveHeaders();
        this.retrieveActions();
    }

    updateState(field,value){
        let state= _.cloneDeep(this.state);
        state[field]=value;
        this.setState(state);
    }

    rowDelete(values){

    }

    render(){
        return(
            <Table headers={this.state.headers} data={this.props.data} footers={this.state.footers}
                   actions={this.state.actions}
                    hover={true} >

            </Table>

        )
    }


    retrieveHeaders = () => {
        this.updateState("headers",
            [
                {
                    name:"Vehicle",
                    data:"vehicleType"
                },
                {
                    name: "Address",
                    data: "addressType"
                },
                {
                    name: "Status",
                    data: "status"
                },
                {
                    name:"Vehicle Type",
                    data:"vehicleDetails",

                }
            ]);
    };

    retrieveActions = () => {
        this.updateState("actions", {
            rowDelete: {
                icon: "close",
                action: (values) => this.rowDelete(values),
                title: "remove"
            },
            rowEdit: {
            icon: "pencil-square",
            action: this.rowEdit,
            title: "edit"}
        }

        );
    }

}