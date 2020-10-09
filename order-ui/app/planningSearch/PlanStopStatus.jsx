import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";


export class PlanStopStatus extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};

    }

    componentWillMount() {
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    renderButtons(data) {
        if(data._arriveButton) {
            return <Button style="success" size="small" label="Arrive" onclick={() => {this.props.handleArrive()}}/>
        } else if(data._departButton) {
            return <Button style="primary" size="small" label="Depart" onclick={() => {this.props.handleDepart()}}/>
        } else if(data._startUnloadButton) {
            return <Button style="primary" size="small" label="Start Unload" onclick={() => {this.props.handleStartUnloadJob()}}/>
        } else if(data._completeUnloadButton) {
            return <Button style="primary" size="small" label="Complete Unload" onclick={() => {this.props.handleCompleteUnloadJob()}}/>
        } else if(data._startLoadButton) {
            return <Button style="primary" size="small" label="Start Load" onclick={() => {this.props.handleStartLoadJob()}}/>
        } else if(data._completeLoadButton) {
            return <Button style="primary" size="small" label="Complete Load" onclick={() => {this.props.handleCompleteLoadJob()}}/>
        }
        return null;
    }

    renderDetailsButton(data) {
        return <Button flat="true" style="success" size="small" label="details" onclick={() => {this.props.handleDetailsClick()}}/>
    }

    renderStatus(data) {

        let status = data._status;
        let subStatus = data._subStatus;

        if(!status) {
            status = {};
        }

        if(subStatus) {
            return <span className={"uk-badge uk-badge-" + subStatus.class}>{subStatus.name}</span>
        } else {
            return <span className={"uk-badge uk-badge-" + status.class}>{status.name}</span>
        }
    }

    render() {

        let data = this.props.data;
        if(!data) {
            return;
        }

        return(
           <Grid>
               <GridCell width="1-3">
                   {data.locationName}
               </GridCell>
               <GridCell width="1-3">
                   {this.renderStatus(data)}
               </GridCell>
               <GridCell width="1-3">
                   {this.renderButtons(data)}
               </GridCell>
               <GridCell noMargin="true">
                   {this.renderDetailsButton(data)}
               </GridCell>
           </Grid>
        )
    }

}

PlanStopStatus.contextTypes = {
    translator: React.PropTypes.object
};
