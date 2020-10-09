import React from "react";
import {Grid, GridCell} from "susam-components/layout";
import {CompanySearchAutoComplete} from "susam-components/oneorder";
import {DropDown} from "susam-components/basic";

export class WarehouseLocation extends React.Component {

    constructor(props) {
        super(props);
    }

    onSelectedCompanyChange(company) {
        this.props.onSelectedCompanyChange(company);
    }

    onSelectedCompanyClear() {
        this.props.onSelectedCompanyClear();
    }

    onSelectedCompanyLocationChange(location) {
        this.props.onSelectedCompanyLocationChange(location);
    }

    onSelectedCompanyLocationChange(location) {
        this.props.onSelectedCompanyLocationChange(location);
    }

    render() {
        return (
            <Grid>
                <GridCell noMargin="true" width="1-2">
                    <CompanySearchAutoComplete label="Company"
                                               value={this.props.company}
                                               onchange={(value) => this.onSelectedCompanyChange(value)}
                                               onclear={() => this.onSelectedCompanyClear()}/>
                </GridCell>
                <GridCell noMargin="true" width="1-2">
                    <DropDown label="Location"
                              onchange={(value) => this.onSelectedCompanyLocationChange(value)}
                              options={this.props.companyLocations}
                              valueField="id"
                              labelField="name"
                              value={this.props.companyLocation}/>
                </GridCell>
            </Grid>
        );
    }
}