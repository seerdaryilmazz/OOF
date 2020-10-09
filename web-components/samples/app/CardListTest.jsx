import React from 'react';


import {List} from '../../components/src/list/list/List';
import {CardList} from '../../components/src/list/cardlist/CardList';

import {Card, Grid, GridCell} from '../../components/src/layout';



export default class Test extends React.Component{
    constructor(props){
        super(props);
        this.state = {};
    };

    submit = (e) => {
        e.preventDefault();
        $('#testForm').submit();
    };


    action1(values){
        alert("action1 - " + JSON.stringify(values));
    }
    action2(values){
        alert("action2 - " + JSON.stringify(values));
    }
    action3(values){
        alert("action3 - " + JSON.stringify(values));
    }
    action4(values){
        alert("action4 - " + JSON.stringify(values));
    }
    action5(values){
        alert("action5 - " + JSON.stringify(values));
    }
    render() {
        return (

            <CardList headers={this.state.headers} data={this.state.data}>
            </CardList>

        );
    }

    componentWillMount(){
        this.retrieveHeaders();
        this.retrieveData();

    }

    retrieveHeaders = () => {

        let d =  {
            headerList: [
                {
                    field: "name",
                    bold: true
                },
                {
                    field: "surname",
                },
                {
                    field: "description",
                    muted: true
                }
            ],
            iconGroup: {
                property: "type",
                defaultIcon: {
                    color: "grey",
                    label: "Go"
                },
                icons: [
                    {
                        usedBy: [
                            "admin",
                            "user"
                        ],
                        color: "grey",
                        label: "Go"
                    },
                    {
                        usedBy: [
                            "sales"
                        ],
                        color: "red",
                        label: "Yo"
                    }
                ]
            },
            actionGroup: {
                property: "type",
                defaultActions: [
                    {
                        icon:"pencil",
                        label: "action 4",
                        action: this.action4
                    },
                    {
                        icon:"pencil",
                        label: "action 5",
                        action: this.action5
                    }
                ],
                actions:
                    [
                        {
                            usedBy: [
                                "admin",
                                "sales"
                            ],
                            list: [
                                {
                                    icon:"pencil",
                                    label: "action 1",
                                    action: this.action1
                                },{
                                    icon:"home",
                                    label: "action 2",
                                    action: this.action2
                                }
                            ]
                        },
                        {
                            usedBy: [
                                "user"
                            ],
                            list: [
                                {
                                    icon:"home",
                                    label: "action 3",
                                    action: this.action3
                                }
                            ]
                        },
                    ]
            },
        };

        this.setState({headers: d});


    }


    retrieveData = () => {

        let d =  [
            {
                id: 1,
                name: "Ali",
                surname: "AtaBak",
                description: "Desc",
                type: "user"
            },
            {
                id: 2,
                name: "Bob",
                surname: "Marley",
                description: "Desc 2",
                type: "admin"
            },
            {
                id: 3,
                name: "Ayşe",
                surname: "Ilıksütiç",
                description: "Desc 3",
                type: "user"
            },
            {
                id: 4,
                name: "Can",
                surname: "youdothis",
                description: "Desc 4",
                type: "sales"
            },
            {
                id: 5,
                name: "Default",
                description: "Desc Default",
                type: "anything"
            }
        ];

        this.setState({data: d});


    }

}

