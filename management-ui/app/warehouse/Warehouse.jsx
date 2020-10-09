import React from "react";
import {Card, Grid, GridCell} from "susam-components/layout";
import {WarehouseLocation} from "./WarehouseLocation";
import {WarehouseZones} from "./WarehouseZones";

export class Warehouse extends React.Component {

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

    onSaveWarehouse() {
        this.props.onSaveWarehouse();
    }

    onDeleteWarehouse() {
        this.props.onDeleteWarehouse();
    }

    onSelectZone(zone) {
        this.props.onSelectZone(zone);
    }

    onAddZone() {
        this.props.onAddZone();
    }

    onDeleteZone(zone) {
        this.props.onDeleteZone(zone);
    }

    render() {
        let toolbarItems = [{icon: "save", action: () => this.onSaveWarehouse()}];
        if (this.props.warehouse && this.props.warehouse.id) {
            toolbarItems.push({icon: "trash-o", action: () => this.onDeleteWarehouse()});
        }

        return (
            <div style={{visibility: this.props.warehouse ? "visible" : "hidden"}}>
                <Card title="Details" toolbarItems={toolbarItems}>
                    <Grid>
                        <GridCell noMargin="true" width="1-1">
                            <WarehouseLocation
                                onSelectedCompanyChange={(company) => this.onSelectedCompanyChange(company)}
                                onSelectedCompanyClear={() => this.onSelectedCompanyClear()}
                                onSelectedCompanyLocationChange={(location)=> this.onSelectedCompanyLocationChange(location)}
                                company={this.props.company}
                                companyLocations={this.props.companyLocations}
                                companyLocation={this.props.companyLocation}/>
                        </GridCell>
                        <GridCell noMargin="true" width="1-1">
                            <WarehouseZones warehouse={this.props.warehouse}
                                            zones={this.props.zones}
                                            zone={this.props.zone}
                                            onSelectZone={(zone) => this.onSelectZone(zone)}
                                            onAddZone={() => this.onAddZone()}
                                            zoneLoading={this.props.zoneLoading}
                                            onDeleteZone={(zone)=> this.onDeleteZone(zone)}/>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}