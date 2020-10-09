import React from 'react';

import {Form, DropDown, TextInput} from 'susam-components/basic';
import {DateTime} from 'susam-components/advanced';
import {Table} from 'susam-components/table';

export default class OrderInfoDocumentTable extends React.Component{

    constructor(props){
        super(props);
        this.state = {};
    }
    componentWillMount(){
        this.loadTableDetails();
    }

    render(){

        return(
            <Table headers={this.state.headers} actions={this.state.actions} insertion={this.state.insertion} data={this.state.data}>

            </Table>
        );

    }

    specialAction1(values) {
    }

    rowClicked(values) {
    }

    rowAdd(values) {
        return true;
    }

    rowEdit(values) {
        return true;
    }

    rowDelete(values) {
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
                name: "Document Type",
                data: "doctype"
            },
            {
                name: "Document Name",
                data: "docname"
            }
        ];

        this.setState({headers: headers});

        let insertion = {
            doctype: [
                <DropDown label="Please Select" options={[{id:"1",name:"PDF"},{id:"2",name:"Image"},{id:"3",name:"Word"}]}/>
            ],
            docname: [<TextInput required={true}/>]
        };

        this.setState({insertion: insertion});


        let actions = {
            actionButtons: [
                {
                    icon: "thumbs-up",
                    action: this.specialAction1,
                    title: "edit"
                }
            ],
            rowDelete: {
                icon: "close",
                action: this.rowDelete,
                title: "remove"
            },
        };

        this.setState({actions: actions});


    }

}