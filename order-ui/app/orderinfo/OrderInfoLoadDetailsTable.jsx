import React from 'react';

import {Form, DropDown, TextInput} from 'susam-components/basic';
import {DateTime} from 'susam-components/advanced';
import {Table} from 'susam-components/table';

export default class OrderInfoLoadDetailsTable extends React.Component{

    constructor(props){
        super(props);
        this.state = {};
    }
    componentWillMount(){
        this.loadTableDetails();
    }

    render(){

        return(
            <Table headers={this.state.headers} actions={this.state.actions} insertion={this.state.insertion} data={this.props.data}>
            </Table>
        );

    }


    rowAdd = (values) => {
        return this.props.updateLoadData("add", values, null);
    }

    rowEdit = (values, oldValues) => {
        return this.props.updateLoadData("edit", values, oldValues);
    }

    rowDelete = (values) => {
        return this.props.updateLoadData("remove", values, null);
    }

    loadTableDetails = () => {


        let headers = [
            {
                name: "id",
                data: "id",
                hidden: true
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
                name: "HS Code",
                data: "hscode"
            },
            {
                name: "Load Definition",
                data: "loaddefinition"
            },
            {
                name: "Recipient Order No",
                data: "buyerorderno"
            }
        ];

        this.setState({headers: headers});

        let insertion = {
            kap: [<TextInput required={true}/>],
            grossweight: [<TextInput required={true}/>],
            neatweight: [<TextInput required={true}/>],
            volume: [<TextInput required={true}/>],
            ldm: [<TextInput required={true}/>],
            hscode: [<TextInput required={true}/>],
            loaddefinition: [<TextInput required={true}/>],
            buyerorderno: [<TextInput required={true}/>]
        };

        this.setState({insertion: insertion});


        let actions = {
            actionButtons: [
                {
                    icon: "gear",
                    action: this.props.specialAction1,
                    title: "dimension details"
                }
            ],
            rowEdit: {
                icon: "pencil-square",
                action: this.rowEdit,
                title: "edit"
            },
            rowDelete: {
                icon: "close",
                action: this.rowDelete,
                title: "remove",
                confirmation: "Are you sure you want to delete?"
            },
            rowAdd: this.rowAdd
        };

        this.setState({actions: actions});


    }

}