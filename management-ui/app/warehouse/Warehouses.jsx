import React from "react";
import {Card, Grid, GridCell} from "susam-components/layout";
import {List} from "susam-components/list";
import {Button} from "susam-components/basic";

export class Warehouses extends React.Component {

    constructor(props) {
        super(props);

        this.headers = {
            header: "locationName",
            details: "companyName",
            buttonGroup: {
                property: "locationName",
                defaultButton: {
                    label: "Details",
                    action: (values) => this.onSelectWarehouse(values),
                },
                buttons: [
                    {
                        usedBy: [
                            "*"
                        ],
                        label: "Details",
                        action: (values) => this.onSelectWarehouse(values),
                    },
                ]
            },
        };
    }

    onSelectWarehouse(values) {
        this.props.onSelectWarehouse(values);
    }

    onNewWarehouse() {
        this.props.onNewWarehouse();
    }

    render() {
        let warehouses = null;

        if (this.props.warehouses) {
            warehouses = (
                <Card title="Warehouses">
                    <Grid>
                        <GridCell noMargin="true" width="1-1">
                            <List headers={this.headers} data={this.props.warehouses}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <div className="uk-float-right">
                                <Button
                                    label="NEW"
                                    waves={true}
                                    onclick={() => this.onNewWarehouse()}/>
                            </div>
                        </GridCell>
                    </Grid>
                </Card>
            );
        }

        return warehouses;
    }
}