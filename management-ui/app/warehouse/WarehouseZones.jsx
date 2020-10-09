import React from "react";
import {Grid, GridCell} from "susam-components/layout";
import {DropDown, Button} from "susam-components/basic";
import {ZoneMap} from "../zone/ZoneMap";
import {Table} from "susam-components/table";

export class WarehouseZones extends React.Component {

    constructor(props) {
        super(props);

        this.headers = [
            {
                name: "Zone Name",
                data: "zoneName",
                width: "100%",
            },
        ];

        this.tableActions = {
            actionButtons: [
                {
                    icon: "trash-o",
                    action: (elem) => this.onDeleteZone(elem),
                    title: "Delete"
                },
            ]
        };
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
        let button = !this.props.zoneLoading ?
            <Button
                label="ADD"
                waves={true}
                onclick={() => this.onAddZone()}/> :
            null;

        let zones = this.props.warehouse && this.props.warehouse.zones && this.props.warehouse.zones.length > 0 ?
            <Table headers={this.headers} data={this.props.warehouse.zones} actions={this.tableActions}/> :
            null;

        return (
            <Grid>
                <GridCell width="3-4">
                    <ZoneMap zone={this.props.zone}/>
                </GridCell>
                <GridCell width="1-4">
                    <Grid>
                        <GridCell width="1-2">
                            <DropDown label="Zones"
                                      onchange={(value) => this.onSelectZone(value)}
                                      options={this.props.zones}
                                      valueField="id"
                                      labelField="name"
                                      value={this.props.zone}/>
                        </GridCell>
                        <GridCell width="1-2">
                            {button}
                        </GridCell>
                        <GridCell width="1-1">
                            {zones}
                        </GridCell>
                    </Grid>
                </GridCell>
            </Grid>
        );
    }
}