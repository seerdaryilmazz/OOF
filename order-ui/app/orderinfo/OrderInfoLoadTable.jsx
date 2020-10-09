import React from 'react';

import {Form, DropDown, TextInput} from 'susam-components/basic';
import {DateTime} from 'susam-components/advanced';
import {Table} from 'susam-components/table';

export default class OrderInfoLoadTable extends React.Component{

    constructor(props){
        super(props);
        this.state = {};
    }
    componentWillMount(){
        this.loadTableDetails();
        this.state.data = this.props.data;

    }

    render(){

        if(!this.state.data) {
            return null;
        }

        return(
           <Table headers={this.state.headers} actions={this.state.actions} insertion={this.state.insertion} data={this.state.data} hover={true}>

           </Table>
        );

    }

    rowClicked = (values) =>{
        this.props.rowClicked(values);
    }


    rowDelete = (values) => {
        return true;
    }

    loadTableDetails = () => {


        let headers = [
            {
                name: "id",
                data: "id",
                hidden: true
            },
            {
                name: "Load Address",
                data: "loadAddress"
            },
            {
                name: "Unload Address",
                data: "unloadAddress"
            },
            {
                name: "Ready Date",
                data: "readyDate",
                width: "12%"
            },
            {
                name: "OG Date",
                data: "ogdate",
                width: "12%"
            },
            {
                name: "Container",
                data: "kap"
            },
            {
                name: "Gross Weight",
                data: "grossweight"
            },
            {
                name: "Dead Weight",
                data: "neatweight"
            },
            {
                name: "Volume",
                data: "volume"
            },
            {
                name: "LDM",
                data: "ldm"
            },
            {
                name: "ADR",
                data: "adr"
            },
            {
                name: "Certificate",
                data: "certificate"
            }
        ];

        this.setState({headers: headers});

        let insertion = {
            loadAddress: [<TextInput required={true}/>],
            unloAdaddress: [<TextInput required={true}/>],
            readydate: [<DateTime label="Select Date" required={true} format = "DD/MM/YYYY"/>],
            ogdate: [<DateTime label="Select Date" required={true} format = "DD/MM/YYYY"/>],
            kap: [<TextInput required={true}/>],
            grossweight: [<TextInput required={true}/>],
            neatweight: [<TextInput required={true}/>],
            volume: [<TextInput required={true}/>],
            ldm: [<TextInput required={true}/>],
            adr: [<TextInput required={true}/>],
            certificate: [<TextInput required={true}/>],

        };

        this.setState({insertion: insertion});


        let actions = {
            actionButtons: [
                {
                    icon: "pencil",
                    action: this.props.specialAction1,
                    title: "edit"
                }
            ],
            rowDelete: {
                icon: "close",
                action: this.rowDelete,
                title: "remove",
                confirmation: "Are you sure you want to delete?"
            },
            rowClick: this.rowClicked
        };

        this.setState({actions: actions});


    }

}