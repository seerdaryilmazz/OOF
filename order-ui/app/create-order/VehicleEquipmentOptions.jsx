import React from 'react';

import {Grid, GridCell, Card,Modal,CardSubHeader} from 'susam-components/layout';
import {Button} from 'susam-components/basic';
import {OrderVehicleEquipmentInfo} from '../orderinfo/OrderVehicleEquipmentInfo.jsx';

export class VehicleEquipmentOptions extends React.Component{
    constructor(props){
        super(props);
        this.state={};

    }

    handleVehicleEquipmentOptionsOnClick() {

        this.vehicleEquipmentForm.open();
    };

    handleClose(){
        this.vehicleEquipmentForm.close();
    }

    handleSave(){
        //todo handle the state
    }

    render(){
        return(
            <Card>
                <Grid>
                    <GridCell>
                        <Button label="Vehicle Equipment Options" onclick={()=>this.handleVehicleEquipmentOptionsOnClick()}/>
                    </GridCell>
                </Grid>
                <Modal ref={(c)=>this.vehicleEquipmentForm=c} large={true} title="Vehicle Options"
                       actions = {[{label:"Close", action:() => this.handleClose()},
                       {label:"Save", buttonStyle:"primary", action:() => this.handleSave()}]}>
                    <div>
                        <CardSubHeader title="Route Options" />
                        <OrderVehicleEquipmentInfo></OrderVehicleEquipmentInfo>
                    </div>
                </Modal>
            </Card>
        );

    }
}