import React from "react";


import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell} from "susam-components/layout";
import {DropDown, Notify} from "susam-components/basic";
import {NumericInput, DateRange} from "susam-components/advanced";
import {CompanySearchAutoComplete} from "susam-components/oneorder";

import {ProjectService} from '../../services';

export class OrderQuota extends TranslatingComponent {

    constructor(props) {
        super(props);
    }

    handleDataUpdate(field, value) {
        let data = this.props.data;
        if (!data) {
            data = {};
        }
        data[field] = value;
        this.props.updateHandler(data);
    }

    retrieveUnit() {

        let unit = this.props.data ? this.props.data.unit : null;

        let result = "";

        if(!unit) {
            // do nothing
        } else if(unit.code == ProjectService.ORDER_QUOTA_UNIT_TYPE_GROSS_WEIGHT_CODE) {
            result = " kg";
        } else if(unit.code == ProjectService.ORDER_QUOTA_UNIT_TYPE_VOLUME_CODE) {
            result = " m3";
        } else if(unit.code == ProjectService.ORDER_QUOTA_UNIT_TYPE_LDM_CODE) {
            result = " ldm";
        }

       return result;
    }


    render() {

        let data = this.props.data;
        let lookup = this.props.lookup;

        if (!data) {
            data = {};
        }


        return (

            <Grid>
                <GridCell width="2-10">
                    <DropDown label="Unit" options={lookup.orderQuotaUnit}
                              value={data.unit}
                              onchange={(data) => {
                                  this.handleDataUpdate("unit", data)
                              }}/>
                </GridCell>
                <GridCell width="1-10">
                    <NumericInput label="Total Amount"
                                  value={data.amount}
                                  unit={this.retrieveUnit()}
                                  onchange={(data) => {
                                      this.handleDataUpdate("amount", data)
                                  }}/>
                </GridCell>
                <GridCell width="1-10">
                    <NumericInput label="Tolerance(+/-)"
                                  value={data.tolerance}
                                  unit={this.retrieveUnit()}
                                  onchange={(data) => {
                                      this.handleDataUpdate("tolerance", data)
                                  }}/>
                </GridCell>
                <GridCell width="1-10">
                    <DropDown label="Unit of Time" options={lookup.orderQuotaTime}
                              value={data.timeUnit}
                              onchange={(data) => {
                                  this.handleDataUpdate("timeUnit", data)
                              }}/>
                </GridCell>
            </Grid>
        );
    }
}