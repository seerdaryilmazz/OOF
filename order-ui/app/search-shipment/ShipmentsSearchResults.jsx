import React from "react";
import { Button } from "susam-components/basic";
import * as DataTable from "susam-components/datatable";
import { Card, Grid, GridCell } from "susam-components/layout";
import uuid from "uuid";
import ShipmentViewModal from "./ShipmentViewModal";

export class ShipmentsSearchResults extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        let resultTable = $("div.uk-overflow-container");
        resultTable.scroll(() => {
            if ($(resultTable).scrollTop() + $(resultTable).innerHeight() >= $(resultTable)[0].scrollHeight) {
                this.props.onScrollEnd && this.props.onScrollEnd();
            }
        });
        setTimeout(() => {
            $("div.tablesorter-header-inner").css({ "position": "absolute", "top": "20px" });
        }, 1000)
        if (this.props.shipmentNo) {
            this.openShipment(this.props.shipmentNo);
        }
    }

    componentDidUpdate(prevProps) {
        $("div.uk-overflow-container").css("height", this.props.height);
        $("table.uk-table").css({ "margin-top": "-12px" });
        if (!_.isEqual(this.props.shipmentNo, prevProps.shipmentNo) && this.props.shipmentNo) {
            this.openShipment(this.props.shipmentNo);
        }
    }

    openShipment(shipmentNo) {
        setTimeout(()=>this.openShipmentModal({shipmentCode: shipmentNo}), 0);
    }

    handleShipmentViewClick(shipment){
        this.context.router.push(`/ui/order/shipment-search/${shipment.shipmentCode}`);
    }

    openShipmentModal(shipment) {
        this.shipmentViewModel.openFor(shipment);
        this.setState({
            isOrderViewOpen: true
        });
    }
    handleShipmentViewModalClose() {
        this.context.router.push(`/ui/order/shipment-search`);
    }

    render() {
        return (
            <Card>
                <div className="dataContent" style={{ paddingTop: "38px" }}>
                    <DataTable.Table
                        data={this.props.data}
                        filterable={false}
                        sortable={false}
                        insertable={false}
                        editable={false}
                        sortBy={this.props.sortBy}
                        groupBy={this.props.groupBy}
                        groupByLabelHolder={this.props.groupByLabelHolder}
                        hideGroupContents={true}>
                        <DataTable.Text header="Customer"
                            sortable={true}
                            filterable={true}
                            reader={new CustomerReader()}
                            printer={new CustomerPrinter()} />
                        <DataTable.Text header="Sender"
                            sortable={true}
                            filterable={true}
                            reader={new SenderReader()}
                            printer={new SenderPrinter()}
                            width="20" />
                        <DataTable.Text header="Consignee"
                            sortable={true}
                            filterable={true}
                            reader={new ConsigneeReader()}
                            printer={new ConsigneePrinter()} />
                        <DataTable.Text header="Special"
                            width="5"
                            sortable={true}
                            filterable={true}
                            reader={new SpecialReader()}
                            printer={new SpecialPrinter()} />
                        <DataTable.Text header="Packaging"
                            width="5"
                            sortable={true}
                            filterable={true}
                            reader={new PackageTypeReader()}
                            printer={new PackageTypePrinter()} />
                        <DataTable.Text header="Size"
                            sortable={true}
                            filterable={true}
                            reader={new SizeReader()}
                            printer={new SizePrinter()}
                            center={true} />
                        <DataTable.ActionColumn>
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => { this.handleShipmentViewClick(data) }}>
                                <Button label="View" flat={true} style="success" size="small" />
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </div>
                <div>
                    <ShipmentViewModal ref={(c) => this.shipmentViewModel = c}
                        fullscreen={true}
                        isOrderViewOpen={this.state.isOrderViewOpen}
                        onClose={() => this.handleShipmentViewModalClose()} />
                </div>
            </Card>
        );
    }
}

ShipmentsSearchResults.contextTypes = {
    router: React.PropTypes.object.isRequired
};

function renderParty(party, date, appointment) {
    let dateTimeWithTimezone;
    if (date) {
        dateTimeWithTimezone = date.localDateTime;
    }
    let appointmentIcon = <i className="material-icons">date_range</i>;
    if (!_.isNil(appointment)) {
        appointmentIcon = <i style={{ color: "red" }} className="material-icons" data-uk-tooltip="{pos:'bottom'}" title="Has Appointment">alarm</i>;
    }
    return (
        <div>
            <div className="uk-text-bold uk-text-truncate">{truncate(party.companyName, 4)}</div>
            <div className="uk-text-weight-500"><i className="material-icons">location_on</i>{party.handlingLocationName}</div>
            <div className="uk-text-weight-500">{appointmentIcon} {dateTimeWithTimezone}</div>
        </div>
    );
}

function truncate(str, wordCount) {
    let wc = _.isNil(wordCount) ? 3 : wordCount;
    let split = str.split(" ");
    return split.splice(0, wc).join(" ") + (split.length > wc ? "..." : "");
}

class CustomerReader {
    readCellValue(row) {
        return row;
    }
    readSortValue(row) {
        return row.customerName;
    }
}

class CustomerPrinter {
    print(data) {
        let { shipmentCode, orderCode, customerName, applicationIds }  = data;
        let ids = "";
        applicationIds && applicationIds.forEach(i=>{
            ids = ids + i.name + ": " + i.code + "<br />"
        })

        return (
            <div style={this.renderStatus(data.status)}>
                <Grid>
                    <GridCell width="1-1" verticalAlign="middle" center={true} noMargin={true}>
                        <div className="uk-text-bold uk-text-truncate">{truncate(customerName, 4)}</div>
                    </GridCell>
                    <GridCell width="1-3" verticalAlign="middle" center={true} noMargin={true} style={{ margin: "auto" }}>
                        <div>
                            <div className="uk-text-weight-500">Shipment No: <b>{shipmentCode}</b></div>
                            <div className="uk-text-weight-500">
                                Order No: <b>{orderCode}</b> 
                                <i className="uk-icon-exchange" style={{ padding: "0 24px", fontSize: "20px", color: _.isEmpty(applicationIds)?"silver":"#1976d2" }} data-uk-tooltip="{pos:'bottom'}" title={ids}/>
                            </div>
                        </div>
                    </GridCell>
                    <GridCell width="2-3" verticalAlign="middle" center={true} noMargin={true} style={{ margin: "auto" }}>
                        <ul style={{ listStyleType: "none", margin: "0 48px", padding: "0", overflow: "hidden" }}>
                            <li style={{ float: "left", padding: "0.2em" }}>
                                {this.renderServiceType(data.serviceType)}
                            </li>
                            <li style={{ float: "left", padding: "0.6em 0.2em" }}>
                                {this.renderTruckLoadType(data.truckLoadType)}
                            </li>
                        </ul>
                    </GridCell>
                </Grid>
            </div>
        );
    }

    renderStatus(status) {
        let statusStyles = {
            "CREATED": { borderLeft: "4px solid red" },
            "CONFIRMED": { borderLeft: "4px solid green" },
            "CANCELLED": { borderLeft: "4px solid gray" }
        }

        let style = statusStyles[status];
        if (!_.isNil(style)) {
            style.padding = "0 8px";
        }

        return style;
    }

    renderTruckLoadType(truckLoadType) {
        let value = "";

        let classes = {
            FTL: "md-bg-light-blue-600", LTL: "md-bg-light-blue-300"
        };
        let classNames = ["uk-badge"];

        if (truckLoadType) {
            value = truckLoadType;
            classNames.push(classes[value]);
        }

        return (
            <div className={classNames.join(" ")}>{value}</div>
        )
    }

    renderServiceType(serviceType) {
        let value = "";
        let initials = {
            STANDARD: "STD", EXPRESS: "EXP", SUPER_EXPRESS: "SE", SPEEDY: "SP", SPEEDYXL: "SPX"
        };
        let classes = {
            STD: "md-bg-grey-400", EXP: "md-bg-red-300", SE: "md-bg-red-500", SP: "md-bg-red-700", SPX: "md-bg-red-900"
        };
        let classNames = ["round-initial-icon"];

        if (serviceType) {
            value = initials[serviceType];
            classNames.push(classes[value]);
        }

        return (
            <div className={classNames.join(" ")}>{value}</div>
        )
    }
}

class SenderReader {
    readCellValue(row) {
        return row;
    }
    readSortValue(row) {
        return row.sender.companyName;
    }
}

class SenderPrinter {
    print(data) {
        return renderParty(data.sender, data.readyDateOrLoadingAppointment, data.loadingAppointment);
    }
}

class ConsigneeReader {
    readCellValue(row) {
        return row;
    }
    readSortValue(row) {
        return row.consignee.companyName;
    }
}

class ConsigneePrinter {
    print(data) {
        return renderParty(data.consignee, data.deliveryDateOrUnloadingAppointment, data.unloadingAppointment);
    }
}

class SpecialReader {
    readCellValue(row) {
        return row;
    }
    readSortValue(row) {
        return row.id;
    }
}

class SpecialPrinter {
    print(data) {
        const className = "mdi mdi-24px ";
        const maxRowCount = 2;

        let icons = [];
        icons.push(data.special.includes("adr") ? { "className": className + "mdi-alert-octagon", "tooltip": "Dangerous (ADR)" } : null);
        icons.push(data.special.includes("certificated") ? { "className": className + "mdi-certificate", "tooltip": "Certificated" } : null);
        icons.push(data.special.includes("temperature") ? { "className": className + "mdi-thermometer", "tooltip": "Temperature Controlled" } : null);
        icons.push(data.special.includes("hangingLoad") ? { "className": className + "mdi-hanger", "tooltip": "Hanging Load" } : null);
        icons.push(data.special.includes("longLoad") ? { "className": className + "mdi-arrow-expand", "tooltip": "Long Load" } : null);
        icons.push(data.special.includes("oversizeLoad") ? { "className": className + "mdi-star-circle", "tooltip": "Oversized Load" } : null);
        icons.push(data.special.includes("heavyLoad") ? { "className": className + "mdi-weight-kilogram", "tooltip": "Heavy Load" } : null);
        icons.push(data.special.includes("valuableLoad") ? { "className": className + "mdi-currency-usd", "tooltip": "Valuable Load" } : null);
        icons = icons.filter(i => !_.isNil(i))

        const columnCount = icons.length > maxRowCount ? Math.floor(icons.length / maxRowCount) + icons.length % maxRowCount : 2;
        const rowCount = Math.floor(icons.length / columnCount) + 1;

        let rows = []
        for (let r = 0; r < rowCount; r++) {
            rows.push(<div key={uuid.v4()}>{this.renderColumns(icons, columnCount, r)}</div>);
        }

        return (
            <div>{rows}</div>
        )
    }

    renderColumns(data, totalColumn, rowNo) {
        let columns = [];
        for (var c = 0; c < totalColumn; c++) {
            var index = rowNo * totalColumn + c;
            if (index < data.length) {
                columns.push(<i key={index} className={_.get(data[index], "className")} data-uk-tooltip="{pos:'bottom'}" title={_.get(data[index], "tooltip")} />);
            }
        }
        return columns;
    }
}

class PackageTypeReader {
    readCellValue(row) {
        return row;
    }
    readSortValue(row) {
        return row.id;
    }
}

class PackageTypePrinter {
    print(data) {
        const tdStyle = {
            borderBottomColor: "transparent",
            padding: "2px"
        }
        return (
            <table>
                <tbody>
                    <tr>
                        <td style={tdStyle}>
                            <div className="uk-text-large">
                                <b>{data.packageCount}</b>
                            </div>
                        </td>
                        <td style={tdStyle}>
                            <div className="uk-text-weight-500">
                                {data.packageType ? data.packageType : "Unknown"}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

class SizeReader {
    readCellValue(row) {
        return row;
    }
    readSortValue(row) {
        return row.id;
    }
}

class SizePrinter {
    formatter = new Intl.NumberFormat('tr-TR', {
        maximumFractionDigits: 0, minimumFractionDigits: 0
    });

    formatter2 = new Intl.NumberFormat('tr-TR', {
        maximumFractionDigits: 2, minimumFractionDigits: 2
    });

    print(data) {
        return (
            <div>
                <div className="uk-text-weight-500">
                    <b>{this.formatter.format(data.grossWeight)}</b>{" kg"}
                </div>
                <div className="uk-text-weight-500" >
                    <b>{this.formatter2.format(data.volume)}</b>{" m³"}
                </div>
                <div className="uk-text-weight-500" >
                    <b>{this.formatter2.format(data.ldm)}</b> {" ldm"}
                </div>
            </div>
        );
    }
}