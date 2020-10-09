import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {DropDown,Button} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';


import {OrderRouteTable} from './OrderRouteTable.jsx';
import {Card, Grid, GridCell,Modal} from 'susam-components/layout';

export class OrderRouteConstraint extends React.Component{
    constructor(props){
        super(props);
        this.state = {routeInfo:
        {   list:[],
            routes:[]


        }
        };
    }
    updateRouteInfoState(field, value){
        this.props.onchange && this.props.onchange(field, value);
        let state = _.cloneDeep(this.state);
        state.routeInfo[field]=value;
        this.setState(state);
    }

    updateRouteDetailsState(field,value){
        let state = _.cloneDeep(this.state);
        state.routeInfo[field] = value;
        this.setState(state);
        this.props.onchange && this.props.onchange(field, value);
    }

    handleAddRouteInfo(values){
        let state = _.cloneDeep(this.state);
        var routeDetailsText ="";
        state.routeInfo.routes.forEach((item)=>{
            routeDetailsText+= item.name +" / ";

        });
        state.routeInfo.list.push({transportType:state.routeInfo.transportType,
            status:state.routeInfo.status,
            routeDetails:routeDetailsText});

        this.setState(state);

    }
    render(){
        return(
            <Card>
                <Grid>
                    <GridCell width="1-4">
                        <DropDown label="Status" value={this.state.routeInfo.status}
                                  options={[{id:"MANDATORY",name:"MANDATORY"},{id:"NONMANDATORY" ,name:"NONMANDATORY"}]}
                                  onchange={(value)=> this.updateRouteInfoState("status",value)}>
                        </DropDown>
                    </GridCell>
                    <GridCell width="1-4">
                        <DropDown label="Transport Type" value={this.state.routeInfo.transportType}
                                  options={[{id:"LAND",name:"Karayolu Taşımacılığı"},{id:"SEA",name:"Denizyolu Taşımacılığı"},
                                  {id:"TRAIN",name:"Demiryoolu Taşımacılığı"},{id:"BROAD",name:"Sınır Kapısı"}
                                  ]}
                                  onchange={(value)=> this.updateRouteInfoState("transportType",value)}>
                        </DropDown>
                    </GridCell>


                    <GridCell width="1-4">
                        <Chip   valueField="id" labelField="name" options={[
                        {id: 1, name: 'Haydarpaşa-Treiste'},
                        {id: 2, name: 'Pendik-Treiste'},
                        {id: 3, name: 'Çeşme-Treiste'},
                        {id: 4, name: 'Mersin-Treiste'}

                    ] }
                                onchange={(value)=> this.updateRouteDetailsState("routes",value)}
                                value={this.state.routeInfo.routes}></Chip>
                    </GridCell>

                    <GridCell width="1-1">
                        <Button flat={true} waves={true} style="primary" label="Add Route" onclick={(e)=> this.handleAddRouteInfo(e)}></Button>


                        <OrderRouteTable data={this.state.routeInfo.list} addVehicleItem={(values)=>this.handleAddRouteInfo(values)} ></OrderRouteTable>

                    </GridCell>

                </Grid>

            </Card>
        );
    }
}