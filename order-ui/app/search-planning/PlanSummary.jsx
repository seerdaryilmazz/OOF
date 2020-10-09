import React from "react";

import {TranslatingComponent} from "susam-components/abstract";
import * as DataTable from 'susam-components/datatable';

export class PlanSummary extends TranslatingComponent{

    constructor(props){
        super(props);

    }

    render(){
        if(!this.props.selectedPlan){
            return null;
        }

        let details = {};
        if(this.props.selectedPlan.details) {
            details.packages = this.props.selectedPlan.details.details;
            details.grossWeight = this.props.selectedPlan.details.grossWeight + " kg";
            details.volume = this.props.selectedPlan.details.volume + "m³";
            details.ldm = this.props.selectedPlan.details.ldm;
            details.payWeight = this.props.selectedPlan.details.payWeight;
        }

        return(
            <DataTable.Table data={[details]}>

                <DataTable.Text field="packages" header="Packages" />
                <DataTable.Text field="grossWeight" header="Gross Weight"/>
                <DataTable.Text field="volume" header="Volume" />
                <DataTable.Text field="ldm" header="LDM" />
                <DataTable.Text field="payWeight" header="Pay Weight" />

            </DataTable.Table>
        );
    }

}