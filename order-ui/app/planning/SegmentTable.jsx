import React from "react";
import _ from 'lodash';

import {Button} from "susam-components/basic";

import {Card, Grid, GridCell} from "susam-components/layout";
import {Chip} from "susam-components/advanced";
import * as DataTable from 'susam-components/datatable';

import {DivideModal} from "./DivideModal";
import {MergeModal} from "./MergeModal";

export class SegmentTable extends React.Component {

    constructor(props) {
        super(props);
        this.moment = require("moment");
        this.state = {}
    }

    static SEGMENT_STATUS = [
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

    openDivideModal(segment) {
        this.segmentDivideModal.openFor(segment);
    }

    openMergeModal(segment, segments) {
        this.segmentMergeModal.openFor(segment, this.props.segmentList);
    }

    renderPrevSegmentColumn() {
        if(this.props.renderForFTL) {
            return null;
        }
        return <DataTable.Text field="" header="Prev. Segment" sortable={true} filterable={true}
                               reader={new StatusReader()} printer={new StatusPrinter()}/>;
    }

    render() {

        let results = null;
        let groups = this.state.groupBy ? this.state.groupBy.map(item => item.groupBy ? item.groupBy : item.id) : null;
        let sorts = this.state.sortBy ? this.state.sortBy.map(item => item.sortBy ? item.sortBy : item.id) : null;

        if (this.props.segmentList && this.props.segmentList.length > 0) {
            let displayModeButton = this.props.shipmentsFullScreen ?
                <a href="javascript:void(0);"
                   className="uk-icon-button uk-icon-arrow-circle-o-down"
                   onClick={() => this.props.onShipmentsDisplayModeChange(false)}/> :
                <a href="javascript:void(0);"
                   className="uk-icon-button uk-icon-arrow-circle-o-up"
                   onClick={() => this.props.onShipmentsDisplayModeChange(true)}/>;

            results = (
                <Card title="Shipments"
                      toolbarItems={[]}>
                    <Grid>
                        <GridCell width="3-10">
                            <Chip label="Group By"
                                  onchange={(value) => {this.setState({groupBy: value})}}
                                  options={[{id:"shipment.transportOrderId", name:"Order Number"},
                                            {id:"shipment.id", name:"Shipment Number"},
                                            {id:"shipment.customerName", name:"Customer"},
                                            {id:"shipment.sender.companyName", name:"Sender"},
                                            {id:"shipment.receiver.companyName", name:"Consignee"},
                                            {id:"fromLocation.countryIsoCode", name:"From Country Code"},
                                            {id:"fromLocation.postalCode", name:"From Zip Code"},
                                            {id:"fromLocation.name", name:"From Location"},
                                            {id:"toLocation.countryIsoCode", name:"To Country Code"},
                                            {id:"toLocation.postalCode", name:"To Zip Code"},
                                            {id:"toLocation.name", name:"To Location"},
                                            {id:"shipment.readyAtDate.utcDateTime", name:"Ready At Date",
                                                groupBy:(row) => {
                                                    return row.shipment.readyAtDate.utcDateTime.split(" ")[0];
                                                }
                                            }
                                  ]}
                                  valueField="name"
                                  labelField="name"
                                  value={this.state.groupBy}/>
                        </GridCell>

                        <GridCell width="3-10">
                            <Chip label="Sort By"
                                  onchange={(value) => this.setState({sortBy: value})}
                                  options={[{id:"shipment.transportOrderId", name:"Order Number", sortBy: (row) => {
                                              return parseInt(row.shipment.transportOrderId);
                                          }},
                                          {id:"shipment.id", name:"Shipment Number", sortBy: (row) => {
                                              return parseInt(row.shipment.id);
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
                                          {id:"shipment.readyAtDate.utcDateTime", name:"Ready At Date", sortBy: (row) => {
                                              return this.moment(row.shipment.readyAtDate.utcDateTime, "DD/MM/YYYY HH:mm").format("X");
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
                                  ]}
                                  valueField="name"
                                  labelField="name"
                                  value={this.state.sortBy}/>
                        </GridCell>

                        <GridCell width="2-5" noMargin="true">
                            <div className="uk-float-right">
                                {displayModeButton}
                            </div>
                        </GridCell>

                        <GridCell width="1-1" noMargin="true">
                            <DataTable.Table data={this.props.segmentList} filterable={false} sortable={false}
                                             insertable={false} editable={false}
                                             selectedRows = {this.props.selectedRows}
                                             groupBy = {groups} sortBy = {sorts}
                                             onrowclick = {(selectedRows) => this.props.handleSegmentSelection(selectedRows)}>
                                <DataTable.Text field="" header="Shipment" sortable={true} filterable={true}
                                                reader={new ShipmentReader()} printer={new ShipmentPrinter()}/>
                                {this.renderPrevSegmentColumn()}
                                <DataTable.Text field="" header="Customer" sortable={true} filterable={true} center={true}
                                                reader={new CustomerReader()} printer={new CustomerPrinter()}/>
                                <DataTable.Text field="currentFrom" header="From" sortable={true} filterable={true}
                                                reader={new FromReader()} printer={new FromPrinter()}/>
                                <DataTable.Text field="currentTo" header="To" sortable={true} filterable={true}
                                                reader={new ToReader()} printer={new ToPrinter()}/>

                                <DataTable.Text field="" header="Properties" sortable={true} filterable={true} center={true}
                                                reader={new PropertyReader()} printer={new PropertyPrinter()}/>
                                <DataTable.Text field="" header="Tags" sortable={true} filterable={true} center={true}
                                                reader={new TagReader()} printer={new TagPrinter()}/>
                                <DataTable.ActionColumn width="10">
                                    <DataTable.ActionWrapper track="onclick" onaction = {(data) => {this.openDivideModal(data)}}>
                                        <Button label="Divide" flat = {true} style="success" size="small"/>
                                    </DataTable.ActionWrapper>
                                    <DataTable.ActionWrapper track="onclick" onaction = {(data) => {this.openMergeModal(data)}}>
                                        <Button label="Merge" flat = {true} style="warning" size="small"/>
                                    </DataTable.ActionWrapper>
                                </DataTable.ActionColumn>
                            </DataTable.Table>
                        </GridCell>
                        <DivideModal ref={(c) => this.segmentDivideModal = c}
                                     handleDivideSegment={(segment, selectedCrossDock) => {return this.props.handleDivideSegment(segment, selectedCrossDock)}}
                                     warehouses={this.props.warehouses} />
                        <MergeModal ref={(c) => this.segmentMergeModal = c}
                                    handleMergeSegment={(segment, segmentIds) => {return this.props.handleMergeSegment(segment, segmentIds)}}
                                    warehouses={this.props.warehouses} />
                    </Grid>
                </Card>
            );
        }

        return results;
    }
}

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
            <ul>
                <li className="uk-text-bold">{shipmentCode}</li>
                <li className="md-color-grey-600">Order Number: <span className="uk-text-weight-500">{transportOrderId}</span></li>
            </ul>
        );
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
    print(data) {
        let previousSegmentStatus = data.previousSegmentStatus;

        let className = SegmentTable.SEGMENT_STATUS.find(elem => elem.name == previousSegmentStatus);

        return(
            <ul>
                <span className={className ? className.style : "uk-text-bold"}>{previousSegmentStatus}</span>
            </ul>
        );
    }
}



class CustomerReader {
    readCellValue(row){
        return row.shipment;
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

        if (data.customerName) {
            customerName = data.customerName;
        }
        if (data.sender && data.sender.companyName) {
            senderCompanyName = data.sender.companyName;
        }
        if (data.receiver && data.receiver.companyName) {
            receiverCompanyName = data.receiver.companyName;
        }

        return (
            <ul>
                <li className="uk-text-bold">{customerName}</li>
                <li className="md-color-grey-600">Sender: <span className="uk-text-weight-500">{senderCompanyName}</span></li>
                <li className="md-color-grey-600">Consignee: <span className="uk-text-weight-500">{receiverCompanyName}</span></li>
            </ul>
        );
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
            <ul>
                <li className="uk-text-bold">{countryIsoCode + "-" + postalCode}</li>
                <li><span className="md-color-grey-600 uk-text-weight-500">{companyName}</span></li>
                <li><span className={colorClass.join(" ")}>{readyDate}</span></li>
            </ul>
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
            <ul>
                <li className="uk-text-bold">{countryIsoCode + "-" + postalCode}</li>
                <li><span className="md-color-grey-600 uk-text-weight-500">{companyName}</span></li>
                <li><span className={colorClass.join(" ")}>{readyDate}</span></li>
            </ul>

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
            let i = 0;
            packageTypes = data.packageTypes.map(item => {
                return  <p key={i++}>
                    {item.count + " " + item.name}
                </p>
            });
        }
        return(
            <div className="property-container-table uk-text-bold">
                <div className="property-container-table-item uk-text-large">
                    {packageTypes}
                </div>
                <div className="property-container-table-item">
                    <ul>
                        <li>{grossWeight ? grossWeight + " kg" : ""}</li>
                        <li>{volume ? volume + " m³" : ""}</li>
                        <li>{ldm ? ldm + " ldm" : ""}</li>
                    </ul>
                </div>
            </div>
        );
    }
}


class TagReader {
    readCellValue(row){
        return row;
    }
    readSortValue(row){
        return (row.segmentType ? row.segmentType.fromType : "") + (row.segmentType ? row.segmentType.toType : "") + row.regionalType;
    }
}
class TagPrinter {
    print(data) {

        let fromTag = _.get(data, "segmentType.fromType.name");
        let toTag = _.get(data, "segmentType.toType.name");
        let regionTag = _.get(data, "regionalType.name");

        return(
            <div className="property-container-table">
                <div className="property-container-table-item">
                    <ul>
                        <li>From: {fromTag}</li>
                        <li>To: {toTag}</li>
                        <li>Region: {regionTag}</li>
                    </ul>
                </div>
            </div>
        );
    }
}