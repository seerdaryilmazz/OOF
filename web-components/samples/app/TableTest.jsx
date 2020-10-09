import React from 'react';


import {Table} from '../../components/src/table/Table';
import {Button, DropDown, Checkbox, TextInput, TextArea} from '../../components/src/basic';
import {Card, Grid, GridCell} from '../../components/src/layout';
import {DateTime} from '../../components/src/advanced';


export default class Test extends React.Component {
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
                        <Table headers={this.state.headers} data={this.state.data} footers={this.state.footers}
                               actions={this.state.actions} insertion={this.state.insertion}
                                icons={this.state.icons} hover={true}>
                            <TextArea value="Any Element can be inserted here which will be exist in 2. Body.">
                                </TextArea>
                            <TextArea value="And also as 3. body"></TextArea>
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
        this.retrieveFooter();
    }

    retrieveHeaders = () => {

        let h = [
            {
                name: "id",
                data: "id",
                hidden: true
            },
            {
                name: "İsim",
                data: "name",
                alignment: "center",
                sort: {
                    type: "text"
                }
            },
            {
                name: "Description",
                data: "description"
            },
            {
                name: "Type",
                data: "type"
            },
            {
                name: "Email",
                data: "email"
            },

            {
                name: "Toplam",
                data: "total",
                sort: {
                    type: "numeric"
                }
            },
            {
                name: "Date",
                data: "date",
                width: "15%",
                sort: {
                    type: "date",
                    format: "DD.MM.YYYY"
                }
            }
        ];

        this.setState({headers: h});

    }

    retrieveData = () => {

        let d = [
            {
                id: 1,
                name: "Ali",
                description: "Desc",
                type: "User",
                email: "ali@aa",
                total: 4,
                date: "03.05.2015"

            },
            {
                id: 2,
                name: "Bob",
                description: "Desc 2",
                type: "Admin",
                email: "bob@bobby",
                total: 1,
                date: "09.05.2014"
            },
            {
                id: 3,
                name: "Ayse",
                description: "Desc 3",
                type: "User",
                email: "ayse@aa",
                total: 3,
                date: "03.06.2014"
            },
            {
                id: 4,
                name: "Can",
                description: "Desc 4",
                type: "Sales",
                email: "can@youfly",
                total: 6,
                date: "03.06.2012"
            }
        ];

        this.setState({data: d});


    }

    retrieveFooter = () => {

        let d = [
            {
                id: -1,
                name: "Footer ",
                description: "This is a footer",
                type: "F Type",
                email: "foo@ter",
                total: 4,
                date: "03.05.2015"

            }
        ];

        this.setState({footers: d});


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
            rowEdit: {
                icon: "pencil-square",
                action: this.rowEdit,
                title: "edit"
            },
            rowDelete: {
                icon: "close",
                action: this.rowDelete,
                title: "remove",
                confirmation: "Are you sure you want to delete"
            },
            rowAdd: this.rowAdd,
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

            ],
            email: [
                <TextInput label="required" required={true}/>
            ],
            type: [
                <TextInput label="required" required={true}/>
            ],
            date: [
                <DateTime label="Select Date" required={true} format = "DD.MM.YYYY"/>
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
