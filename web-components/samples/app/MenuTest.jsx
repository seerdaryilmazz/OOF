import React from 'react';

import {Menu} from '../../components/src/layout';



export default class MenuTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    };

    render() {
        var currentRouteName = this.props.location;
        
        return (
            <Menu items={this.state.data} location={this.props.location}>
            </Menu>

        );
    }

    componentWillMount() {
        this.retrieveTreeData();
    }

    retrieveTreeData = () => {

        let h = [
            {
                name: "Dashboard",
                url: "#/dashboard"
            },
            {
                name: "MailBox",
                url: "#/mailbox"
            },
            {
                name: "Form",
                children: [
                    {
                        name: "Form1 ",
                        url: "#/form1"
                    },
                    {
                        name: "Form 2",
                        url: "#/form2"
                    }
                ]
            },
            {
                name: "Test",
                url: "#/test"
            },
            {
                name: "Test 2",
                children: [
                    {
                        name: "Test 2.A ",
                        url: "#/TEST2A"
                    },
                    {
                        name: "Test 2.B",
                        children: [
                            {
                                name: "Test 2.B.a ",
                                url: "#/test2Ba"
                            },
                            {
                                name: "Test 2.B.b",
                                url: "#/test2BB"
                            }
                        ]
                    }
                ]
            },
        ];

        this.setState({data: h});

    }
    

}







