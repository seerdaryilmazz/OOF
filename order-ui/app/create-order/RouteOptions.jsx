import React from 'react';

import {Grid, GridCell, Card,Modal,CardSubHeader} from 'susam-components/layout';
import {Button} from 'susam-components/basic';
import {OrderRouteConstraint} from '../orderinfo/OrderRouteConstraint.jsx';

export class RouteOptions extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleRouteOptionsOnClick() {

        this.routeForm.open();
    };

    handleClose(){
        this.routeForm.close();
    }

  handleSave(){
      //todo handle the state
  }

    render() {
        return (
            <Card>
                <Grid>
                    <GridCell>
                        <Button label="Route Options" onclick={()=>this.handleRouteOptionsOnClick()}/>
                    </GridCell>
                </Grid>
                <Modal ref={(c)=>this.routeForm=c} large={true} title="Route Options"
                       actions = {[{label:"Close", action:() => this.handleClose()},
                       {label:"Save", buttonStyle:"primary", action:() => this.handleSave()}]}>
                        <div>
                            <CardSubHeader title="Route Options" />
                            <OrderRouteConstraint></OrderRouteConstraint>
                        </div>
                </Modal>
            </Card>
        );
    }
}
