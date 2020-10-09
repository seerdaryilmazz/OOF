import React from 'react';


import {Table} from '../../components/src/table/Table';
import {Button, DropDown, Checkbox, TextInput, TextArea} from '../../components/src/basic';
import {Card, Grid, GridCell} from '../../components/src/layout';
import {DateTime} from '../../components/src/advanced';


export default class OrderDocumentTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    };

    submit = (e) => {
        e.preventDefault();
        $('#testForm').submit();
    };


    specialAction1(values) {
        console.log("Special Action 1 - " + JSON.stringify(values));
    }

    specialAction2(values) {
        console.log("Special Aciton 2 - " + JSON.stringify(values));
    }

    rowClicked(values) {
        console.log("Row Clicked - values: " + JSON.stringify(values));
        return true;
    }

    rowAdd(values) {
        console.log("Row Add clicked - values: " + JSON.stringify(values));
        return true;
    }

    rowEdit(values, oldValues) {
        console.log("Row Save clicked - values: " + JSON.stringify(values) + "  Old Values: " + JSON.stringify(oldValues));
        return true;
    }

    rowDelete(values) {
        console.log("Row Delete clicked - values: " + JSON.stringify(values));
        return true;
    }

    render() {
        return (
            <Card>
                <Grid>
                    <GridCell width="1-1">
                        <Table headers={this.state.headers} data={this.props.data} footers={this.state.footers}
                               actions={this.state.actions} insertion={this.state.insertion}

                               icons={this.state.icons} hover={true} >

                        </Table>
                    </GridCell>
                </Grid>
            </Card>

        );
    }

    componentWillMount() {
        this.retrieveHeaders();
        this.retrieveData();
        this.retrieveActions();
        this.retrieveInsertion();
        this.retrieveIcons();

    }

    retrieveHeaders = () => {

        let h = [
            {
                name: "id",
                data: "id",
                hidden: true
            },
            {
                name: "Döküman İsmi",
                data: "name",
                alignment: "center",
                sort: {
                    type: "text"
                }
            },
            {
                name: "Açıklama",
                data: "description"
            }
        ];

        this.setState({headers: h});

    }

    retrieveData = (data) => {

        let d = [
            {
                id: 1,
                name: "Ali",
                description: "Desc",


            },
            {
                id: 2,
                name: "Bob",
                description: "Desc 2",

            },
            {
                id: 3,
                name: "Ayse",
                description: "Desc 3",

            }
        ];

        data=d;

        this.setState({data: data});


    }



    retrieveActions = () => {

        let a = {
            actionButtons: [
                {
                    icon: "thumbs-up",
                    action: this.specialAction1,
                    title: "special 1"
                },
                {
                    icon: "thumbs-down",
                    action: this.specialAction2,
                    title: "special 2"
                }
            ],
            /* rowEdit: {
             icon: "pencil-square",
             action: this.rowEdit,
             title: "edit"
             },*/
            rowDelete: {
                icon: "close",
                action: this.rowDelete,
                title: "remove"
            },
            //rowAdd: this.rowAdd,
            rowClick: this.rowClicked
        };

        this.setState({actions: a});


    }

    retrieveInsertion = () => {

        let a = {
            name: [
                <TextInput label="required" required={true}/>
            ],
            description: [
                <TextInput label="required" required={true}/>

            ]
        };

        this.setState({insertion: a});

    }

    retrieveIcons = () => {

        let a = {
            type: {
                displayValue: true,
                align: "left",
                default: "user",
                data: [
                    {
                        value: "Sales",
                        icon: "users",
                    },
                    {
                        value: "Admin",
                        icon: "user-secret"
                    }
                ]
            }
        };

        this.setState({icons: a});

    }
}
