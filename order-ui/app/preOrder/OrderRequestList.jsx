import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';
import { Router } from 'react-router';

import {Table} from 'susam-components/table';
import {Button, DropDown, Checkbox, TextInput, TextArea} from 'susam-components/basic';
import {Card, Grid, GridCell} from 'susam-components/layout';
import OrderRequest from './OrderRequest.jsx';


export class OrderRequestList extends  React.Component{
    constructor(props){
        super(props);
        console.log("props for list-->"+JSON.stringify(props));
        this.state = {};
    }
    componentWillMount(){
    this.loadTableProps();
    }

    componentDidMount(){
        this.getOrderRequests();
    }
    getOrderRequests(){
       axios.get('/order-service/transport-order-req/').then((response)=>{
           let state = _.cloneDeep(this.state);
           state.orderRequests = response.data;
           this.setState(state);}).catch((error)=>{

       });
    }
    specialAction1=(values)=>{
        console.log("Special Action 1 - " + JSON.stringify(values));
        this.context.router.push('/order-request');

    }

    render(){
        return(
            <Card>
                <Grid>
                    <GridCell>
                        <Table headers={this.state.headers} data={this.state.orderRequests} footers={this.state.footers}
                               actions={this.state.actions}
                               hover={true} >

                        </Table>

                    </GridCell>
                </Grid>
            </Card>
        );
    }
    loadTableProps=()=>{

       let headers= [
           {name:"id",
           data:"id",
           hidden:true
           },
           {name:"Customer",
           data:"customer",
           },
           {name:"A/C Customer",
           data:"acCustomer"
           },
           {name:"Order Type",
           data:"orderType"
           },
           {name:"Projet No",
           data:"projectNo"
           },
           {name:"Offer No",
           data:"offerNo"
           },
           {name:"Update",
               data:"update"
           }
       ]
        this.setState({headers:headers});

        let insertion = {
            customer: [
                <TextInput required={true}/>
            ],
            acCustomer: [<TextInput/>],
            orderType: [<TextInput required={true}/>],
            projectNo: [<TextInput required={true}/>],
            offerNo: [<TextInput required={true}/>],


        };

        this.setState({insertion: insertion});
        let actions ={

            actionButtons:[
        {icon: "thumbs-up",
                action: this.specialAction1,
            title: "special 1"}

        ]}
        this.setState({actions: actions});

    }


}

OrderRequestList.contextTypes = {
    router: React.PropTypes.object.isRequired
}


