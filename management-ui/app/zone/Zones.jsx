import React from "react";
import {Card, Grid, GridCell} from "susam-components/layout";
import {List} from "susam-components/list";
import {Button} from "susam-components/basic";

export class Zones extends React.Component {

    constructor(props) {
        super(props);

        this.headers = {
            header: "name",
            details: "description",
            buttonGroup: {
                property: "name",
                defaultButton: {
                    label: "Details",
                    action: (values) => this.onZoneSelected(values),
                },
                buttons: [
                    {
                        usedBy: [
                            "*"
                        ],
                        label: "Details",
                        action: (values) => this.onZoneSelected(values),
                    },
                ]
            },
        };
    }

    onZoneSelected(values) {
        this.props.onZoneSelected(values);
    }

    onAddZone() {
        this.props.onAddZone();
    }

    render() {
        if (this.props.zones) {
            return (
                <Card title="Zones">
                    <Grid>
                        <GridCell noMargin="true" width="1-1">
                            <List headers={this.headers} data={this.props.zones}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <div className="uk-float-right">
                                <Button
                                    label="NEW"
                                    waves={true}
                                    onclick={() => this.onAddZone()}/>
                            </div>
                        </GridCell>
                    </Grid>
                </Card>
            );
        }

        return null;
    }
}