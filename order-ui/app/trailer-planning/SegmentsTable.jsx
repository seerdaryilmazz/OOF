import React from "react";
import _ from "lodash";
import * as axios from 'axios';

import {TranslatingComponent} from "susam-components/abstract";
import {Page, Grid, GridCell, CardSubHeader, Card} from "susam-components/layout";
import {Notify, Button} from "susam-components/basic";
import {Chip} from "susam-components/advanced";
import * as DataTable from 'susam-components/datatable';

import {DivideModal} from './DivideModal';
import {MergeModal} from './MergeModal';

import {Storage} from './storage/Storage';
import {StorageDataUpdater} from './updater/StorageDataUpdater';

import {Planner} from './plan/Planner';
import {VehicleFeature} from './VehicleFeature';

export class SegmentsTable extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {};
        this.groupByOptions = [
            {id:"shipment.transportOrderId", name:"Order Number"},
            {id:"shipment.code", name:"Shipment Code"},
            {id:"shipment.customerName", name:"Customer"},
            {id:"shipment.sender.companyName", name:"Sender"},
            {id:"shipment.receiver.companyName", name:"Consignee"},
            {id:"fromLocation.countryIsoCode", name:"From Country Code"},
            {id:"fromLocation.postalCode", name:"From Zip Code"},
            {id:"fromLocation.name", name:"From Location"},
            {id:"toLocation.countryIsoCode", name:"To Country Code"},
            {id:"toLocation.postalCode", name:"To Zip Code"},
            {id:"toLocation.name", name:"To Location"},
            {id:"shipment.readyAtDate", name:"Ready At Date",
                groupBy:(row) => {
                    return row.readyAtDate.split(" ")[0];
                }
            }
        ];

        this.sortByOptions = [
            {id:"shipment.transportOrderId", name:"Order Number", sortBy: (row) => {
                return parseInt(row.shipment.transportOrderId);
            }},
            {id:"shipment.code", name:"Shipment Code", sortBy: (row) => {
                return parseInt(row.shipment.code);
            }},
            {id:"shipment.customerName", name:"Customer"},
            {id:"shipment.sender.companyName", name:"Sender"},
            {id:"shipment.receiver.companyName", name:"Consignee"},
            {id:"fromLocation.countryIsoCode", name:"From Country Code"},
            {id:"fromLocation.postalCode", name:"From Zip Code"},
            {id:"fromLocation.name", name:"From Location"},
            {id:"toLocation.countryIsoCode", name:"To Country Code"},
            {id:"toLocation.postalCode", name:"To Zip Code"},
            {id:"toLocation.name", name:"To Location"},
            {id:"shipment.readyAtDate", name:"Ready At Date", sortBy: (row) => {
                return this.moment(row.shipment.readyAtDate, "DD/MM/YYYY HH:mm").format("X");
            }},
            {id:"shipment.packageTypes", name:"Quantity", sortBy: (row) => {
                let counter=0;
                row.shipment.packageTypes.forEach(item => {
                    counter+=item.count;
                });
                return counter;
            }},
            {id:"shipment.grossWeight", name:"Gross Weight", sortBy: (row) => {
                return parseFloat(row.shipment.grossWeight);
            }},
            {id:"shipment.volume", name:"Volume", sortBy: (row) => {
                return parseFloat(row.shipment.volume);
            }},
            {id:"shipment.ldm", name:"LDM", sortBy: (row) => {
                return parseFloat(row.shipment.ldm);
            }}
        ];
    }

    handleSegmentSelect(row){
        let selectedSegments = JSON.parse(this.storage.readStorage("trailer-planning.selected-segments"));
        if(!selectedSegments){
            selectedSegments = [];
        }
        let segmentIndex = _.findIndex(selectedSegments, {_key: row._key});
        if(segmentIndex < 0){
            selectedSegments.push(row);
        }else{
            selectedSegments.splice(segmentIndex, 1);
        }
        this.storage.writeStorage("trailer-planning.selected-segments", selectedSegments);

        this.setState({selectedSegments: selectedSegments});
    }

    componentDidMount(){
        this.storage = new Storage(this.context);
        this.startSegmentPolling();
    }
    componentWillUnmount(){
        this.segmentUpdater.clearInterval();
        this.selectedSegmentUpdater.clearInterval();
    }

    startSegmentPolling(){
        this.segmentUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.all-segments", (prevData, nextData) => {
                    this.setState({segments: nextData});
                });
        this.segmentUpdater.startPolling(5000);

        this.selectedSegmentUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.selected-segments", (prevData, nextData) => {
                    this.setState({selectedSegments: nextData});
                });
        this.selectedSegmentUpdater.startPolling(300);
    }

    handleArrowDownClick(){
        this.props.onNarrowList && this.props.onNarrowList();
    }
    handleArrowUpClick(){
        this.props.onEnlargeList && this.props.onEnlargeList();
    }
    handleCompressListClick(){
        this.props.onCompressList && this.props.onCompressList();
    }
    handleExpandListClick(){
        this.props.onExpandList && this.props.onExpandList();
    }
    handleMouseOver(data){
        let loadId, unloadId = "";
        if(data.fromLocation && data.fromLocation.type == Planner.LOCATION_TYPE_CUSTOMER){
            loadId = Planner.OP_TYPE_LOAD + ":" + data.fromLocation.id;
        }
        if(data.toLocation && data.toLocation.type == Planner.LOCATION_TYPE_CUSTOMER){
            unloadId = Planner.OP_TYPE_UNLOAD + ":" + data.toLocation.id;
        }
        if(loadId || unloadId){
            this.storage.writeStorage("trailer-planning.bounce-segment", {loadId: loadId, unloadId: unloadId});
        }
    }

    handleDivideClick(segment) {
        this.segmentDivideModal.openFor(segment);
    }

    handleMergeClick(segment) {
        this.segmentMergeModal.openFor(segment);
    }

    isSegmentSelected(segment){
        return _.find(this.state.selectedSegments, {id: segment.id});
    }

    render(){
        if(this.props.hide){
            return null;
        }

        let groups = this.state.groupBy ? this.state.groupBy.map(item => item.groupBy ? item.groupBy : item.id) : null;
        let sorts = this.state.sortBy ? this.state.sortBy.map(item => item.sortBy ? item.sortBy : item.id) : null;

        let enlargeButton = null;
        let narrowButton = null;
        let expandButton = null;
        let compressButton = null;
        if(this.props.settings.showCompressButton){
            compressButton = <Button icon="compress" flat = {true} onclick = {() => this.handleCompressListClick()} />;
        }
        if(this.props.settings.showExpandButton){
            expandButton = <Button icon="expand" flat = {true} onclick = {() => this.handleExpandListClick()} />;
        }
        if(this.props.settings.showEnlargeButton){
            enlargeButton = <Button icon="arrow-up" flat = {true} onclick = {() => this.handleArrowUpClick()} />;
        }
        if(this.props.settings.showNarrowButton){
            narrowButton = <Button icon="arrow-down" flat = {true} onclick = {() => this.handleArrowDownClick()} />;
        }

        return (
            <div>
                <Grid>

                    <GridCell width="3-10" id="groupControls">
                        <Chip label="Group By" options={this.groupByOptions}
                              valueField="name" labelField="name"
                              onchange={(value) => {this.setState({groupBy: value})}}
                              value={this.state.groupBy}
                              hideSelectAll = {true}/>
                    </GridCell>

                    <GridCell width="3-10">
                        <Chip label="Sort By" options={this.sortByOptions}
                              valueField="name" labelField="name"
                              onchange={(value) => this.setState({sortBy: value})}
                              value={this.state.sortBy}
                              hideSelectAll = {true}/>
                    </GridCell>
                    <GridCell width="4-10">
                        <div className="uk-align-right">
                            {enlargeButton}
                            {narrowButton}
                            {expandButton}
                            {compressButton}
                        </div>
                    </GridCell>
                    <GridCell width="1-1" noMargin = {true} id="segmentsTableCell">

                        <DataTable.Table data={this.state.segments} filterable={false} sortable={false}
                                         insertable={false} editable={false}
                                         selectedRows = {this.state.selectedSegments}
                                         groupBy = {groups} sortBy = {sorts}
                                         onrowmouseenter = {(data) => this.handleMouseOver(data)}
                                         hideGroupContents = {true}>
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper track="onclick" shouldRender = {(segment) => !this.isSegmentSelected(segment)}
                                                         onaction = {(data) => {this.handleSegmentSelect(data)}}>
                                    <Button label="select" flat = {true} style="primary" size="small"/>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper track="onclick" shouldRender = {(segment) => this.isSegmentSelected(segment)}
                                                         onaction = {(data) => {this.handleSegmentSelect(data)}}>
                                    <Button label="remove" flat = {true} style="danger" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                            <DataTable.Text header="Shipment" sortable={true} filterable={true}
                                            reader={new ShipmentReader()} printer={new ShipmentPrinter()}/>
                            <DataTable.Text header="Prev. Segment" sortable={true} filterable={true}
                                            reader={new StatusReader()} printer={new StatusPrinter()}/>
                            <DataTable.Text header="Customer" sortable={true} filterable={true}
                                            reader={new CustomerReader()} printer={new CustomerPrinter()}/>
                            <DataTable.Text header="From" sortable={true} filterable={true}
                                            reader={new FromReader()} printer={new FromPrinter()}/>
                            <DataTable.Text header="To" sortable={true} filterable={true}
                                            reader={new ToReader()} printer={new ToPrinter()}/>
                            <DataTable.Text header="Service" sortable={true} filterable={true} center={true}
                                            reader={new ServiceTypeReader()} printer={new ServiceTypePrinter()}/>
                            <DataTable.Text header="Properties" sortable={true} filterable={true} center={true}
                                            reader={new PropertyReader()} printer={new PropertyPrinter()}/>
                            <DataTable.Text header="Requirements" sortable={true} filterable={true} center={true}
                                            reader={new RequirementsReader()} printer={new RequirementsPrinter()}/>
                            <DataTable.ActionColumn width="10">
                                <DataTable.ActionWrapper track="onclick" onaction = {(data) => {this.handleDivideClick(data)}}>
                                    <Button label="Divide" flat = {true} style="success" size="small"/>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper track="onclick" onaction = {(data) => {this.handleMergeClick(data)}}>
                                    <Button label="Merge" flat = {true} style="warning" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>

                        </DataTable.Table>
                    </GridCell>
                </Grid>
                <DivideModal ref={(c) => this.segmentDivideModal = c}
                             handleDivideSegment={(segment, selectedCrossDock) => {return this.props.handleDivideSegment(segment, selectedCrossDock)}}
                             warehouses={this.props.warehouses} />
                <MergeModal ref={(c) => this.segmentMergeModal = c}
                            handleMergeSegment={(segment, segmentIds) => {return this.props.handleMergeSegment(segment, segmentIds)}}
                            warehouses={this.props.warehouses} />
            </div>
        );
    }

}
SegmentsTable.contextTypes = {
    storage: React.PropTypes.object
};

class ShipmentReader {
    readCellValue(row){
        return row.shipment;
    }
    readSortValue(row){
        return row.shipment.id;
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
            <div>
                <div className="uk-text-bold">{shipmentCode}</div>
                <div className="uk-text-weight-500">{transportOrderId}</div>
            </div>
        );
    }
}

class CustomerReader {
    readCellValue(row){
        return row;
    }
    readSortValue(row){
        return row.shipment.customerName;
    }
}


class CustomerPrinter {
    print(data) {
        let customerName = "";
        let senderCompanyName = "";
        let receiverCompanyName = "";

        if (data.shipment.customerName) {
            customerName = this.truncate(data.shipment.customerName);
        }
        if (data.shipment.sender && data.shipment.sender.companyName) {
            senderCompanyName = this.truncate(data.shipment.sender.companyName);
        }
        if (data.shipment.receiver && data.shipment.receiver.companyName) {
            receiverCompanyName = this.truncate(data.shipment.receiver.companyName);
        }
        let tags = [];
        tags.push("<div>" + _.get(data, "segmentType.fromType.name") + "</div>");
        tags.push("<div>" + _.get(data, "segmentType.toType.name") + "</div>");
        tags.push("<div>" + _.get(data, "regionalType.name") + "</div>");

        return (
            <div data-uk-tooltip="{cls:'long-text'}" title={tags.join("")}>
                <div className="uk-text-bold">{customerName}</div>
                <div className="uk-text-weight-500">{senderCompanyName}</div>
                <div className="uk-text-weight-500">{receiverCompanyName}</div>
            </div>
        );
    }
    truncate(str){
        let split = str.split(" ");
        return split.splice(0,3).join(" ") + (split.length > 3 ? "..." : "");
    }
}

class FromReader {
    readCellValue(row){
        return row;
    }
    readSortValue(row){
        return row.fromLocation && row.fromLocation.name ? row.fromLocation.name : "";
    }
}


class FromPrinter {
    print(data) {
        let companyName = "";
        let postalCode = "";
        let countryIsoCode = "";

        if(data.fromLocation.name) {
            companyName = data.fromLocation.name;
        }

        if(data.fromLocation.postalCode) {
            postalCode = data.fromLocation.postalCode;
        }

        if(data.fromLocation.countryIsoCode) {
            countryIsoCode = data.fromLocation.countryIsoCode;
        }
        let readyDate = "";
        let colorClass = ["uk-text-bold"];
        if(data.segmentType && data.segmentType.fromType.id == "CUSTOMER"){
            let start = _.get(data, "shipment.pickupAppointment.start");
            let end = _.get(data, "shipment.pickupAppointment.end");
            if(start && end){
                readyDate = ReadyDateFormatter.formatRange(start.localDateTime, end.localDateTime, start.timezone);
                colorClass.push("md-color-red-600");
            }else if(start && !end){
                readyDate = ReadyDateFormatter.format(start.localDateTime, start.timezone);
                colorClass.push("md-color-red-600");
            }else{
                readyDate = ReadyDateFormatter.format(data.shipment.readyAtDate.localDateTime, data.shipment.readyAtDate.timezone);
            }
        }
        if(data.segmentType && data.segmentType.fromType.id == "WAREHOUSE"){
            if(data.dateRestriction && data.dateRestriction.minDeparture){
                readyDate = ReadyDateFormatter.format(data.dateRestriction.minDeparture.localDateTime, data.dateRestriction.minDeparture.timezone);
            }
        }

        return(
            <div>
                <div className="uk-text-bold">{countryIsoCode + "-" + postalCode}</div>
                <div className="md-color-grey-600 uk-text-weight-500">{companyName}</div>
                <div className={colorClass.join(" ")}>{readyDate}</div>
            </div>
        );
    }
}


class ToReader {
    readCellValue(row){
        return row;
    }
    readSortValue(row){
        return row.toLocation && row.toLocation.name ? row.toLocation.name : "";
    }
}


class ToPrinter {
    print(data) {
        let companyName = "";
        let postalCode = "";
        let countryIsoCode = "";

        if(data.toLocation.name) {
            companyName = data.toLocation.name;
        }

        if(data.toLocation.postalCode) {
            postalCode = data.toLocation.postalCode;
        }

        if(data.toLocation.countryIsoCode) {
            countryIsoCode = data.toLocation.countryIsoCode;
        }
        let readyDate = "";
        let colorClass = ["uk-text-bold"];
        if(data.segmentType && data.segmentType.toType.id == "CUSTOMER"){
            let start = _.get(data, "shipment.deliveryAppointment.start");
            let end = _.get(data, "shipment.deliveryAppointment.end");
            if(start && end){
                readyDate = ReadyDateFormatter.formatRange(start.localDateTime, end.localDateTime, start.timezone);
                colorClass.push("md-color-red-600");
            }else if(start && !end){
                readyDate = ReadyDateFormatter.format(start.localDateTime, start.timezone);
                colorClass.push("md-color-red-600");
            }else{
                if(data.dateRestriction.maxArrival){
                    readyDate = ReadyDateFormatter.format(data.dateRestriction.maxArrival.localDateTime, data.dateRestriction.maxArrival.timezone);
                }

            }
        }
        if(data.segmentType && data.segmentType.toType.id == "WAREHOUSE"){
            if(data.dateRestriction && data.dateRestriction.maxArrival){
                readyDate = ReadyDateFormatter.format(data.dateRestriction.maxArrival.localDateTime, data.dateRestriction.maxArrival.timezone);
            }
        }

        return(
            <div>
                <div className="uk-text-bold">{countryIsoCode + "-" + postalCode}</div>
                <div className="md-color-grey-600 uk-text-weight-500">{companyName}</div>
                <div className={colorClass.join(" ")}>{readyDate}</div>
            </div>

        );
    }
}

class DateReader {
    readCellValue(row){
        return row.shipment;
    }
    readSortValue(row){
        return row.shipment.readyAtDate.utcDateTime;
    }
}
class DatePrinter {
    print(data) {
        let readyAtDate = "";
        let readyAtTimezone = "";
        if(data.readyAtDate) {
            readyAtDate = data.readyAtDate.localDateTime;
            readyAtTimezone = data.readyAtDate.timezone;
        }
        return(
            <div>
                <div className="uk-text-bold">{readyAtDate}</div>
                <div className="md-color-grey-600 uk-text-weight-500">{readyAtTimezone}</div>
            </div>
        );
    }
}

class PropertyReader {
    readCellValue(row){
        return row.shipment;
    }
    readSortValue(row){
        return row.shipment.grossWeight;
    }
}
class PropertyPrinter {
    print(data) {
        let grossWeight = "";
        let volume = "";
        let ldm = "";

        if(data.grossWeight) {
            grossWeight = data.grossWeight;
        }

        if(data.volume) {
            volume = data.volume;
        }

        if(data.ldm) {
            ldm = data.ldm;
        }
        let packageTypes = [];
        if(data.packageTypes){
            packageTypes = data.packageTypes.map(item => {
                return  <div key={item.name}>
                    {item.count + " " + item.name}
                </div>
            });
        }
        let dimensions = [];
        if(data.units){
            data.units.forEach(unit => {
                let type = unit.type;
                unit.packages.forEach(item => {
                    dimensions.push("<div>" + item.count + " " + type + " " +
                        item.width + "*" + item.length + "*" + item.height +
                        " stackability:" + item.stackSize + "</div>");
                })
            });
        }
        return(
            <div data-uk-tooltip="{cls:'long-text'}" title={dimensions.join("")}>
                <div className="property-container-table uk-text-bold">
                    <div className="property-container-table-item uk-text-large">
                        {packageTypes}
                    </div>
                    <div className="property-container-table-item">
                        <div key="weight">{grossWeight ? grossWeight + " kg" : ""}</div>
                        <div key="volume">{volume ? volume + " m³" : ""}</div>
                        <div key="ldm">{ldm ? ldm + " ldm" : ""}</div>
                    </div>
                </div>
            </div>
        );
    }
}

class RequirementsReader {
    readCellValue(row){
        return row;
    }
    readSortValue(row){
        return (row.requiredVehicleFeatures ? row.requiredVehicleFeatures.length : 0) + (row.notAllowedVehicleFeatures ? row.notAllowedVehicleFeatures.length : 0);
    }
}
class RequirementsPrinter {
    print(data) {
        let content = VehicleFeature.createVehicleRequirementElementsOfSegment(data);

        return(
            <div>
                {content}
            </div>
        );
    }
}

class ReadyDateFormatter{
    static formatRange(startLocalDateTime, endLocalDateTime, timezone){
        let result = "";
        let startSplit = startLocalDateTime.split(" ");
        let endSplit = endLocalDateTime.split(" ");
        if(startSplit[0] == endSplit[0]){
            console.log(ReadyDateFormatter.formatDayMonth(startSplit[0]));
            result = ReadyDateFormatter.formatDayMonth(startSplit[0]) + " " + startSplit[1] + "-" + endSplit[1];
        }else{
            result = ReadyDateFormatter.formatDayMonth(startSplit[0]) + " " + startSplit[1] + "-" + ReadyDateFormatter.formatDayMonth(endSplit[0]) + " " + endSplit[1];
        }
        return result;
    }
    static format(startLocalDateTime, timezone){
        let startSplit = startLocalDateTime.split(" ");
        return ReadyDateFormatter.formatDayMonth(startSplit[0]) + " " + startSplit[1];
    }
    static formatDayMonth(date){
        return date.split("/").slice(0,2).join("/");
    }
}
class StatusReader {
    readCellValue(row){
        return row;
    }
    readSortValue(row){
        return row.previousSegmentStatus;
    }
}
class StatusPrinter {
    constructor(){
        this.segmentStatus = [
            {
                name: "No Segment",
                style: "uk-badge md-bg-green-500 uk-text uk-text-bold"
            },
            {
                name: "Not Planned",
                style: "uk-badge md-bg-grey-400 md-color-grey-900 uk-text uk-text-bold"
            },
            {
                name: "Planned",
                style: "uk-badge md-bg-grey-200 md-color-grey-900 uk-text uk-text-bold"
            },
            {
                name: "On The Way",
                style: "uk-badge md-bg-orange-400 uk-text uk-text-bold"
            },
            {
                name: "Arrived",
                style: "uk-badge md-bg-blue-500 uk-text uk-text-bold"
            },
            {
                name: "Completed",
                style: "uk-badge md-bg-green-500 uk-text uk-text-bold"
            }
        ];
    }
    print(data) {
        let previousSegmentStatus = data.previousSegmentStatus;

        let className = this.segmentStatus.find(elem => elem.name == previousSegmentStatus);

        return(
            <ul>
                <span className={className ? className.style : "uk-text-bold"}>{previousSegmentStatus}</span>
            </ul>
        );
    }
}

class ServiceTypeReader{

    readCellValue(row){
        let initials = {
            STANDARD: "STD", EXPRESS: "EXP", SUPER_EXPRESS: "SE", SPEEDY: "SP", SPEEDYXL: "SPX"
        };
        return initials[row.shipment.serviceType];
    }
    readSortValue(row){
        return this.readCellValue(row);
    }
}
class ServiceTypePrinter{
    print(data) {
        let classes = {
            STD: "md-bg-grey-400", EXP: "md-bg-red-300", SE: "md-bg-red-500", SP: "md-bg-red-700", SPX: "md-bg-red-900"
        };
        let classNames = ["round-initial-icon", classes[data]];
        return(
            <div className={classNames.join(" ")}>{data}</div>
        );
    }
}