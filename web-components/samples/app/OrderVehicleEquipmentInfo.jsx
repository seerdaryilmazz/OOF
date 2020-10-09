import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {DropDown,Button} from '../../components/src/basic';
import {Chip,Slider} from '../../components/src/advanced';

import {OrderVehicleTable} from './OrderVehicleTable.jsx';
import {OrderEquipmentTable} from './OrderEquipmentTable.jsx';
import {Card, Grid, GridCell,Modal} from '../../components/src/layout';

export class OrderVehicleEquipmentInfo extends React.Component{
    constructor(props){
        super(props);
        this.state={vehicleEquipment:
        {   list:[],
            vehicleDetails:[],
            selectedVehicleDetail:[],
            equipmentList:[]

        }
        };

    }

    handleAddVehicleInfo(values){
        let state = _.cloneDeep(this.state);
        var vehicleDetailsText ="";
        state.vehicleEquipment.selectedVehicleDetail.forEach((item)=>{
            vehicleDetailsText+= item.name +" / ";

        });
        state.vehicleEquipment.list.push({vehicleType:state.vehicleEquipment.vehicleType,
            addressType:state.vehicleEquipment.addressType,status:state.vehicleEquipment.status,
            vehicleDetails:vehicleDetailsText});

        this.setState(state);

    }

    updateVehicleEquipmentState(field, value){
        this.props.onchange && this.props.onchange(field, value);
        let state = _.cloneDeep(this.state);
        state.vehicleEquipment[field]=value;
        this.setState(state);
    }

    updateVehicleDetailsState(field,value){
        let state = _.cloneDeep(this.state);
        state.vehicleEquipment[field] = value;
        this.setState(state);
        this.props.onchange && this.props.onchange(field, value);
    }

    handleAddEquipmentInfo(values){
        let state = _.cloneDeep(this.state);
        state.vehicleEquipment.equipmentList.push({
            vehicleaddressType:state.vehicleEquipment.vehicleaddressType,numberOfEquipments:state.vehicleEquipment.numberOfEquipments,
            equipment:state.vehicleEquipment.equipment});


        this.setState(state);

    }
    render(){
        return (
            <Card>
                <Grid>
                    <GridCell width="1-4">
                        <DropDown label="Vehicle" value={this.state.vehicleEquipment.vehicleType}
                                  options={[{id:"TRAILER",name:"TRAILER"},{id:"TRUCK",name:"TRUCK"}]}
                         onchange={(value)=> this.updateVehicleEquipmentState("vehicleType",value)}>
                        </DropDown>
                    </GridCell>
                    <GridCell width="1-4">
                        <DropDown label="Address" value={this.state.vehicleEquipment.addressType}
                                  onchange={(value)=> this.updateVehicleEquipmentState("addressType",value)}
                                  options={[{id:"LOAD",name:"LOAD"},{id:"LAND" ,name:"LAND"}]}>
                        </DropDown>
                    </GridCell>
                    <GridCell width="1-4">
                        <DropDown label="Status" value={this.state.vehicleEquipment.status}
                                  options={[{id:"MANDATORY",name:"MANDATORY"},{id:"NONMANDATORY" ,name:"NONMANDATORY"}]}
                                  onchange={(value)=> this.updateVehicleEquipmentState("status",value)}>
                        </DropDown>
                    </GridCell>
                    <GridCell width="1-4">
                     <Chip   valueField="id" labelField="name" options={[
                        {id: 1, name: 'Tenteli Treyler'},
                        {id: 2, name: 'Kapalı Kasa Treyler'},
                        {id: 3, name: 'Konteyner'},
                        {id: 4, name: 'XL Sertifikalı Treyler'}

                    ] }
                             onchange={(value)=> this.updateVehicleDetailsState("selectedVehicleDetail",value)}
                             value={this.state.vehicleEquipment.selectedVehicleDetail}></Chip>
                    </GridCell>

                    <GridCell width="1-1">
                        <Button flat={true} waves={true} style="primary" label="Add Vehicle" onclick={(e)=> this.handleAddVehicleInfo(e)}></Button>


                        <OrderVehicleTable data={this.state.vehicleEquipment.list} addVehicleItem={(values)=>this.handleAddVehicleInfo(values)} ></OrderVehicleTable>

                    </GridCell>

                </Grid>
                <Grid>
                <GridCell width="1-3">
                    <DropDown label="Address" value={this.state.vehicleEquipment.vehicleaddressType}
                              onchange={(value)=> this.updateVehicleEquipmentState("vehicleaddressType",value)}
                              options={[{id:"LOAD",name:"LOAD"},{id:"LAND" ,name:"LAND"}]}>
                    </DropDown>
                </GridCell>
                <GridCell width="1-3">
                    <Slider label="Request Count" id="test" min="1" max="20" from="1"
                            onMove={(data)=> this.updateVehicleEquipmentState("numberOfEquipments",data.to)}
                    />
                </GridCell>

                <GridCell width="1-3">
                    <DropDown label="Equipment" value={this.state.vehicleEquipment.equipment}
                              options={[{id:"SPANZET",name:"SPANZET"},{id:"NONSKID",name:"NONSKID"}]}
                              onchange={(value)=> this.updateVehicleEquipmentState("equipment",value)}>
                    </DropDown>
                </GridCell>

                    <GridCell width="1-1">
                        <Button flat={true} waves={true} style="primary" label="Add Equipment" onclick={(e)=> this.handleAddEquipmentInfo(e)}></Button>


                        <OrderEquipmentTable data={this.state.vehicleEquipment.equipmentList} addVehicleItem={(values)=>this.handleAddEquipmentInfo(values)} >

                        </OrderEquipmentTable>

                    </GridCell>

                </Grid>
            </Card>
        );
    }
}