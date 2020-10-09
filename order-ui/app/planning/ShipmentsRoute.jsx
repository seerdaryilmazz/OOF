import React from "react";
import {Table} from "susam-components/table";
import {DropDown, Checkbox} from "susam-components/basic";
import {Grid, GridCell} from "susam-components/layout";
import uuid from "uuid";

export class ShipmentsRoute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            headers: this.getHeaders(),
            changeDestinationsOfAllShipments: false,
            changeDestinationsOfAllShipmentsLocation: null,
        }
    }

    getHeaders() {
        return [
            {
                name: "S. #",
                data: "id",
                width: "5%",
                render: (values) => {
                    return (
                        <div key={uuid.v4()} className="whiteSpaceNormal tableCellStyle">
                            {values.code}
                        </div>
                    );
                }
            },
            {
                name: "Cust.",
                data: "customerName",
                width: "10%",
                render: (values) => {
                    return (
                        <div key={uuid.v4()} className="whiteSpaceNormal tableCellStyle">
                            {values.customerName}
                        </div>
                    );
                },
            },
            {
                name: "From",
                data: "currentFrom",
                width: "12%",
                render: (values) => {
                    return (
                        <div key={uuid.v4()} className="whiteSpaceNormal tableCellStyle">
                            {values.currentFrom && values.currentFrom.location ? values.currentFrom.location.name : ""}
                        </div>
                    );
                }
            },
            {
                name: "To",
                data: "currentTo",
                width: "12%",
                render: (values) => {
                    return (
                        <div key={uuid.v4()} className="whiteSpaceNormal tableCellStyle">
                            {values.currentTo && values.currentTo.location ? values.currentTo.location.name : ""}
                        </div>
                    );
                }
            },
            {
                name: "Final Del.",
                data: "receiver",
                width: "10%",
                render: (values) => {
                    return (
                        <div key={uuid.v4()} className="whiteSpaceNormal tableCellStyle">
                            {values.receiver && values.receiver.location ? values.receiver.location.name : ""}
                        </div>
                    );
                }
            },
            {
                name: "Details",
                data: "details",
                width: "20%",
                render: (values) => {
                    return (
                        <div key={uuid.v4()} className="whiteSpaceNormal tableCellStyle">
                            {values.combined}
                        </div>
                    );
                }
            }
        ];
    }

    updateHeaders() {
        this.setState({headers: this.getHeaders()});
    }

    componentWillReceiveProps() {
        this.updateHeaders();
    }
    changeDestinationsOfAllShipments(value) {
        this.setState({changeDestinationsOfAllShipments: value});
    }

    render() {
        let shipmentsRoute = null;
        if (this.props.selectedShipments && this.props.selectedShipments.length > 0) {

            shipmentsRoute = (
                <Grid>
                    <GridCell width="1-1" noMargin="true">
                        <Table headers={this.state.headers}
                               data={this.props.selectedShipments}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Grid>
                            <GridCell width="3-4" noMargin="true">
                                <div className="uk-text-right">
                                    <Checkbox label="Change destinations of all shipments"
                                              onchange={(value) => this.changeDestinationsOfAllShipments(value)}
                                              checked={this.state.changeDestinationsOfAllShipments}/>
                                </div>
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>
            );
        }

        return (
            <div>
                {shipmentsRoute}
            </div>
        );
    }
}
