import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell } from "susam-components/layout";




export class OrderList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }


    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    handleSelectItem(item){
        this.props.onselect && this.props.onselect(item);
    }

    render() {
        if (!this.props.shipments || this.props.shipments.length == 0) {
            return <div>{super.translate("There are no shipments to be displayed")}</div>
        }
        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <h3 className="full_width_in_card heading_c">Assignment List</h3>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    <DataTable.Table data={this.props.shipments} filterable={false} sortable={true}
                                     insertable={false} editable={false} centerText={true}>
                        <DataTable.ActionColumn width="5">
                            <DataTable.ActionWrapper track="onclick" onaction = {(data) => {this.handleSelectItem(data)}}>
                                <Button label="Edit" flat = {true} style="primary" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                        <DataTable.Text field="id" header="Shipment" sortable={true} filterable={true}
                                        printer={new ShipmentPrinter()}
                                        reader={new ShipmentReader()}/>
                        <DataTable.Text field="zones" header="Customer" sortable={true} filterable={true}
                                        reader={new CustomerReader()} printer={new CustomerPrinter()}/>
                        <DataTable.Text field="sender" header="From" sortable={true} filterable={true}
                                        reader={new FromReader()} printer={new FromPrinter()}/>
                        <DataTable.Text field="receiver" header="To" sortable={true} filterable={true}
                                        reader={new ToReader()} printer={new ToPrinter()}/>
                        <DataTable.Text field="" header="Service" sortable={true} filterable={true}
                                        reader={new ServiceReader()} printer={new ServicePrinter()}/>
                        <DataTable.Text field="zones" header="Properties" sortable={true} filterable={true}
                                        reader={new PropertyReader()} printer={new PropertyPrinter()}/>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }
}

class ShipmentReader {
    readCellValue(row){
        return row;
    }
    readSortValue(row){
        return row.id;
    }
}
class ShipmentPrinter {
    print(data) {
        let shipmentCode = "";
        let transportOrderId = "";
        if(data.code) {
            shipmentCode = data.code;
        }
        if(data.transportOrderId) {
            transportOrderId = data.transportOrderId;
        }

        return(
            <ul>
                <li className="uk-text-bold">{shipmentCode}</li>
                <li><span className="md-color-grey-600">Order No:</span> {transportOrderId}</li>
            </ul>
        );
    }
}

class CustomerReader {
    readCellValue(row){
        return row;
    }
    readSortValue(row){
        return !row.customerName;
    }
}


class CustomerPrinter {
    print(data) {

        let customerName = "";
        let senderCompanyName = "";
        let receiverCompanyName = "";

        if (data.customerName) {
            customerName = this.truncate(data.customerName);
        }
        if (data.sender && data.sender.companyName) {
            senderCompanyName = this.truncate(data.sender.companyName);
        }
        if (data.receiver && data.receiver.companyName) {
            receiverCompanyName = this.truncate(data.receiver.companyName);
        }

        return (
            <ul>
                <li className="uk-text-bold">{customerName}</li>
                <li>{senderCompanyName}</li>
                <li>{receiverCompanyName}</li>
            </ul>
        );
    }

    truncate(str){
        let split = str.split(" ");
        return split.splice(0,3).join(" ") + (split.length > 3 ? "..." : "");
    }
}

class FromReader {
    readCellValue(row){
        return row.sender;
    }
    readSortValue(row){
        return row.sender && row.sender.locationOwnerCompanyName ? row.sender.locationOwnerCompanyName : "";
    }
}

class FromPrinter {
    print(data) {
        let iso = "";
        let postalCode = "";
        let locationOwnerCompanyName = this.truncate(data.locationOwnerCompanyName);
        if(data.location) {
            postalCode = data.location.postalCode;
            iso = data.location.countryIsoCode;
        }

        return(
            <ul>
                <li className="uk-text-bold">{iso + "-" + postalCode}</li>
                <li>{locationOwnerCompanyName}</li>
            </ul>
        );
    }
    truncate(str){
        let split = str.split(" ");
        return split.splice(0,3).join(" ") + (split.length > 3 ? "..." : "");
    }
}

class ToReader {
    readCellValue(row){
        return row.receiver;
    }
    readSortValue(row){
        return row.receiver && row.receiver.companyName ? row.receiver.companyName : "";
    }
}

class ToPrinter {
    print(data) {
        let iso = "";
        let postalCode = "";
        let locationOwnerCompanyName = this.truncate(data.locationOwnerCompanyName);
        if(data.location) {
            postalCode = data.location.postalCode;
            iso = data.location.countryIsoCode;
        }

        return(
            <ul>
                <li className="uk-text-bold">{iso + "-" + postalCode}</li>
                <li>{locationOwnerCompanyName}</li>
            </ul>
        );
    }
    truncate(str){
        let split = str.split(" ");
        return split.splice(0,3).join(" ") + (split.length > 3 ? "..." : "");
    }
}

class ServiceReader {
    readCellValue(row){
        return row;
    }
    readSortValue(row){
        return row.serviceType ? row.serviceType : "";
    }
}

class ServicePrinter {

    shipmentType(shipmentTypeName) {
        switch (shipmentTypeName) {
            case "STANDARD":
                return <span className="uk-text-success">Standard</span>;
                break;
            case "EXPRESS":
                return <span className="uk-text-warning">Express</span>;
                break;
            case "SUPER_EXPRESS":
                return <span className="uk-text-danger">S.Express</span>;
                break;
            case "SPEEDY":
                return <span className="uk-text-danger">Speedy</span>;
                break;
            case "SPEEDYXL":
                return <span className="uk-text-danger">SpeedyXL</span>;
                break;
        }
    }
    print(data) {
        console.log(data);

        let shipmentTypeName = data.serviceType;
        let readyAtDate = "";
        if(data.readyAtDate) {
            readyAtDate = data.readyAtDate.localDateTime + " " + data.readyAtDate.timezone;
        }
        let requestedDeliveryDate = "N/A";
        if(data.requestedDeliveryDate) {
            requestedDeliveryDate = data.requestedDeliveryDate.localDateTime + " " + data.requestedDeliveryDate.timezone;
        }

        return(
            <ul>
                <li className="uk-text-bold">{this.shipmentType(shipmentTypeName)}</li>
                <li><span className="md-color-grey-600">Ready:</span> {readyAtDate}</li>
                <li><span className="md-color-grey-600">RDD:</span> {requestedDeliveryDate}</li>
            </ul>
        );
    }
}

class PropertyReader {
    readCellValue(row){
        return row;
    }
    readSortValue(row){
        return row.truckLoadType ? row.truckLoadType : "";
    }
}

class PropertyPrinter {
    print(data) {
        let truckLoadTypeName = data.truckLoadType;
        let shipmentUnitPackages = data.packageCount;
        let shipmentUnitsName = "";
        let totalGrossWeightInKilograms = data.grossWeight;
        let totalVolumeInCubicMeters = data.volume;
        let totalLdm = data.ldm;

        let shipmentUnits = data.units;
        if (shipmentUnits && shipmentUnits.length > 0) {
            if (shipmentUnits[0].type) {
                shipmentUnitsName = shipmentUnits[0].type;
            }
        }

        return (
            <div>
                <div className="property-container-table-alt">
                    <div className="property-container-table-item-alt">
                        <span className="uk-text-bold">
                            {truckLoadTypeName}
                        </span>
                    </div>
                </div>
                <div className="property-container-table-alt md-color-grey-600">
                    <div className="property-container-table-item-alt">
                        <p>
                            {shipmentUnitPackages + " " + shipmentUnitsName}
                        </p>
                        <p>
                            {totalVolumeInCubicMeters ? totalVolumeInCubicMeters + " m³" : ""}
                        </p>
                    </div>
                    <div className="property-container-table-item-alt">
                        <p>
                            {totalGrossWeightInKilograms ? totalGrossWeightInKilograms + " kg" : ""}
                        </p>
                        <p>
                            {totalLdm ? totalLdm + " ldm" : ""}
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}