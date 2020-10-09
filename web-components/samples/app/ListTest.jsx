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

    render() {
        return (

            <div className="md-card">
                <div className="md-card-content">
                    <List headers={this.state.headers} data={this.state.data}>
                    </List>
                </div>
            </div>

        );
    }

    componentWillMount(){
        this.retrieveHeaders();
        this.retrieveData();

    }

    retrieveHeaders = () => {

        let d =  {
            header: "name",
            details: "description",
            iconGroup:
            {
                property: "type",
                defaultIcon:
                {
                    icon:"pencil-square"
                },
                icons:
                    [
                        {
                            usedBy: [
                                "admin",
                                "user"
                                ],
                            icon:"pencil-square"
                        },
                        {
                            usedBy: [
                               "sales"
                            ],
                            icon:"avatar"
                        }
                    ]
            },
            buttonGroup: {
                property: "type",
                defaultButton:
                {
                    label: "action 1",
                    action: this.action1
                },
                buttons:
                    [
                        {
                            usedBy: [
                                "admin",
                                "sales"
                            ],
                            label: "action 2",
                            action: this.action2
                            
                        },
                        {
                            usedBy: [
                                "user"
                            ],
                            label: "action 3",
                            action: this.action3

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
                description: "Desc",
                type: "user"
            },
            {
                id: 2,
                name: "Bob",
                description: "Desc 2",
                type: "admin"
            },
            {
                id: 3,
                name: "Ayse",
                description: "Desc 3",
                type: "user"
            },
            {
                id: 4,
                name: "Can",
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

