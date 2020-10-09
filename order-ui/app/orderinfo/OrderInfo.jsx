import React from 'react';
import uuid from 'uuid';

import {Form, DropDown, TextInput, Button} from 'susam-components/basic';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';
import {Table} from 'susam-components/table';


import OrderInfoLoadTable from './OrderInfoLoadTable.jsx';
import OrderInfoLoadDetailsTable from './OrderInfoLoadDetailsTable.jsx';
import OrderInfoDocumentTable from './OrderInfoDocumentTable.jsx';
import OrderInfoDimensionDetailsTable from './OrderInfoDimensionDetailsTable.jsx';
import OrderInfoLoadForm from './OrderInfoLoadForm.jsx';

export default class OrderInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.state.data = {};
        this.state.data.loads = [];
        this.state.transportOrderReq = {};
    }

    componentWillMount() {
        this.queryLookups();
        this.queryTransportOrderReq(this.props.params.preorderid);

        this.queryTransportOrder_Mock();
    }

    componentDidMount() {

    }


    render() {

        let pageHeaderElem = this.getPageHeaderElem();
        let summaryElem = this.getSummaryElem();
        let detailsElem = this.getDetailsElem();
        let loadElem = this.getLoadElem();
        let loadDetailsElem = this.getLoadDetailsElem();
        let addDocumentElem = this.getAddDocumentElem();
        let saveButtonElem = this.getSaveButtonElem();
        let dimensionDetailsModal = this.getDimensionDetailsModal();
        let loadFormModal = this.getLoadFormModal();

        return (
            <div>
                {pageHeaderElem}
                <div>
                    <Card>
                        {summaryElem}
                        {detailsElem}
                        {loadElem}
                        {loadDetailsElem}
                        {saveButtonElem}
                    </Card>
                </div>
                {dimensionDetailsModal}
                {loadFormModal}
            </div>
        );

    }

    getPageHeaderElem() {
        return (
            <h3 class="heading_b uk-margin-bottom">
                TRANSPORT ORDER
                <span class="sub-heading"></span>
            </h3>
        );
    }

    getSummaryElem() {

        let orderNo = this.state.transportOrderReq.requestNo;

        let customer = "";
        if(this.state.transportOrderReq.customer) {
            customer = this.state.transportOrderReq.customer.name;
        }

        let orderType = this.state.transportOrderReq.orderType;
        let projectNo = this.state.transportOrderReq.projectNo;
        let customerNote = this.state.transportOrderReq.customerNote;

        return (
            <Grid key="summaryCard">
                <GridCell width="1-1">
                    Order No: {orderNo}
                </GridCell>
                <GridCell width="1-1">
                    Customer: {customer}
                </GridCell>
                <GridCell width="1-5">
                    Order Type: {orderType}
                </GridCell>
                <GridCell width="1-5">
                    Project No: {projectNo}
                </GridCell>
                <GridCell width="1-1">
                    Customer Note: {customerNote}
                </GridCell>
            </Grid>
        );
    }

    getDetailsElem() {
        let data = this.state.data;
        return ([
            <Grid key="detailsCard">
                <GridCell width="1-1">
                   ORDER INFORMATION
                </GridCell>
                <GridCell width="1-3">
                    <DropDown label="Service Type" required={true}
                              onchange={(value) => this.updateValues(data, "serviceType", value)}
                              value={data.serviceType}
                              options={this.state.lookups.serviceType}/>
                </GridCell>
                <GridCell width="1-3">
                    <DropDown label="Incoterms" required={true}
                              onchange={(value) => this.updateValues(data, "incoterm", value)}
                              value={data.incoterm}
                              options={this.state.lookups.incoterm}/>
                </GridCell>
                <GridCell width="1-3">
                    <DropDown label="FTL/LTL" required={true}
                              onchange={(value) => this.updateValues(data, "truckLoadType", value)}
                              value={data.serviceType}
                              options={this.state.lookups.truckLoadType}/>
                </GridCell>
                <GridCell width="1-3">
                    <Grid>
                        <GridCell width="2-3">
                            <TextInput label="Load Worth" onchange={(value) => this.updateValues(data, "loadWorth", value)}
                                       value={data.loadWorth}/>
                        </GridCell>
                        <GridCell width="1-3">
                            <DropDown label="Currency"
                                      onchange={(value) => this.updateValues(data, "loadWorthCurrency", value)}
                                      value={data.loadWorthCurrency}
                                      options={this.state.lookups.currency}/>
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-3">
                    <DropDown label="Payment Type"
                              onchange={(value) => this.updateValues(data, "paymentMethod", value)}
                              value={data.paymentMethod}
                              options={this.state.lookups.paymentMethod}/>
                </GridCell>
                <GridCell width="1-3">
                    <DropDown label="Insurance"
                              onchange={(value) => this.updateValues(data, "insuranceIncluded", value)}
                              value={data.insuranceIncluded}
                              options={[{id:"1",name:"Yes"},{id:"0",name:"No"}]}/>
                </GridCell>
            </Grid>
        ]);
    }

    getLoadElem() {
        return ([
            <Grid key="loadCard">
                <GridCell width="4-5">
                    LOADS
                </GridCell>
                <GridCell width="1-5">
                    <Button label="New Load" onclick={this.prepareAddLoad}/>
                </GridCell>
                <GridCell width="1-1">
                    <OrderInfoLoadTable key={uuid.v4()} data={this.state.data.loads}
                                        specialAction1={this.prepareEditLoad}
                                        rowClicked={(loadData) => this.loadOrderInfoLoadDetailsTable(loadData)}>
                    </OrderInfoLoadTable>
                </GridCell>
            </Grid>
        ]);
    }

    getLoadDetailsElem() {
        if (!this.state.loadDetailsCurr) {
            return null;
        }

        return ([
            <Grid key="loadDetailsCard" id="loaddetialsgrid" style={{display:"none"}}>
                <GridCell width="1-1">
                    LOAD DETAILS - ({this.state.loadCurr.loadAddress} - {this.state.loadCurr.unloadAddress})
                </GridCell>
                <GridCell width="1-1">
                    <OrderInfoLoadDetailsTable key={uuid.v4()} data={this.state.loadDetailsCurr}
                                               specialAction1={(loadData) => this.prepareDimensionDetailsModal(loadData)}
                                               updateLoadData={(optype, loadDetailsData, oldLoadDetails) => this.calculateLoadDataFromDetails(optype, loadDetailsData, oldLoadDetails)}>
                    </OrderInfoLoadDetailsTable>
                </GridCell>
            </Grid>
        ]);
    }

    getAddDocumentElem() {
        return ([
            <Grid key="addDocumentCard">
                <GridCell width="1-1">
                    ADD DOCUMENT
                </GridCell>
                <GridCell width="1-1">
                    <OrderInfoDocumentTable></OrderInfoDocumentTable>
                </GridCell>
            </Grid>
        ]);
    }

    getSaveButtonElem() {
        return ([
            <Grid key="saveButtonGrid">
                <GridCell width="1-1">
                    <Button label="SAVE!!!!" onclick={this.saveData} waves={true} style="primary"/>
                </GridCell>
            </Grid>
        ]);
    }

    getDimensionDetailsModal() {

        return (
            <Modal ref={(c) => this.dimensionDetailsForm = c} large={true}>
                <Grid key="dimensionDetailsModal" >
                    <GridCell width="1-1">
                        LOAD DIMENSION DETAILS
                    </GridCell>
                    <GridCell width="1-1">
                        <OrderInfoDimensionDetailsTable key={uuid.v4()}
                                                        loadDetailsSingleData={this.state.loadDetailsSingleCurr}
                                                        closeThis={this.closeDimensionDetailsForm}
                                                        validateDataWithLoadDetails={(optype, loadDetailsData, oldLoadDetails) => this.validateLoadDetailsAndDimension(optype, loadDetailsData, oldLoadDetails)}></OrderInfoDimensionDetailsTable>

                    </GridCell>
                </Grid>
            </Modal>
        );
    }

    getLoadFormModal() {
        return (
            <Modal ref={(c) => this.loadForm = c} large={true}>
                <OrderInfoLoadForm key={uuid.v4()} closeThis={this.closeLoadForm}
                                   data={this.state.loadCurr}
                                   updateLoads={this.updateLoads}></OrderInfoLoadForm>
            </Modal>
        );
    }

    updateLoads = (data) => {

        let newElem = true;
        this.state.data.loads.forEach(load => {
            if (load.uiid == data.uiid) {
                newElem = false;
                return;
            }
        })

        if (newElem) {
            this.state.data.loads.push(data);
        }

        return true;
    }

    prepareAddLoad = (data) => {
        this.state.loadCurr = {};
        this.state.loadCurr.uiid = uuid.v4();
        this.refreshPage();
        this.openLoadForm();

    }

    prepareEditLoad = (data) => {
        this.state.loadCurr = data;
        this.refreshPage();
        this.openLoadForm();

    }

    loadOrderInfoLoadDetailsTable = (loadData) => {

        if (!loadData.loadDetails) {
            loadData.loadDetails = [];
        }

        this.state.loadCurr = loadData;
        this.state.loadDetailsCurr = loadData.loadDetails;

        this.refreshPage();
    }

    updateValues = (parameter, paramName, value) => {
        parameter[paramName] = value;
    }

    openLoadForm = () => {
        this.loadForm.open();
    }
    closeLoadForm = () => {
        this.loadForm.close();
        this.refreshPage()
    }


    prepareDimensionDetailsModal = (data) => {
        if (!data.dimensionDetails) {
            data.dimensionDetails = [];
        }

        this.state.loadDetailsSingleCurr = data;
        this.refreshPage();
        this.openDimensionDetailsForm();

    }

    openDimensionDetailsForm = () => {
        this.dimensionDetailsForm.open();
    }
    closeDimensionDetailsForm = () => {
        this.dimensionDetailsForm.close();
        this.setState(this.state);
    }

    calculateLoadDataFromDetails = (optype, loadDetails, oldLoadDetails) => {
        let loadData = this.state.loadCurr;

        if (!loadData.kap) {
            loadData.kap = 0;
        }
        if (!loadData.grossweight) {
            loadData.grossweight = 0;
        }
        if (!loadData.neatweight) {
            loadData.neatweight = 0;
        }
        if (!loadData.volume) {
            loadData.volume = 0;
        }
        if (!loadData.ldm) {
            loadData.ldm = 0;
        }

        if (optype == "add") {
            loadData.kap += +loadDetails.kap;
            loadData.grossweight += +loadDetails.grossweight;
            loadData.neatweight += +loadDetails.neatweight;
            loadData.volume += +loadDetails.volume;
            loadData.ldm += +loadDetails.ldm;
        } else if (optype == "remove") {
            loadData.kap -= +loadDetails.kap;
            loadData.grossweight -= +loadDetails.grossweight;
            loadData.neatweight -= +loadDetails.neatweight;
            loadData.volume -= +loadDetails.volume;
            loadData.ldm -= +loadDetails.ldm;
        } else if (optype == "edit") {
            loadData.kap -= +oldLoadDetails.kap - +loadDetails.kap;
            loadData.grossweight -= +oldLoadDetails.grossweight - +loadDetails.grossweight;
            loadData.neatweight -= +oldLoadDetails.neatweight - +loadDetails.neatweight;
            loadData.volume -= +oldLoadDetails.volume - +loadDetails.volume;
            loadData.ldm -= +oldLoadDetails.ldm - +loadDetails.ldm;
        }

        this.refreshPage();
        return true;

    }

    refreshPage = () => {
        this.setState(this.state);
    }

    updateState = (base, key, value) => {
        base[key] = value;
        this.setState(this.state);
    };

    queryTransportOrder_Mock = () => {
        let loads = [{
            "uiid": "0de03b2f-689a-4484-82f3-9aae5d025dfe",
            "loadAddress": "Burak",
            "unloadAddress": "Verid",
            "readydate": "02/08/2016",
            "ogdate": "12/08/2016",
            "adr": "Adr data",
            "certificate": "sertifika 0910",
            "loadDetails": [{
                "kap": "2",
                "grossweight": "24",
                "neatweight": "20",
                "volume": "20",
                "ldm": "20",
                "hscode": "rjr",
                "loaddefinition": "rjr",
                "buyerorderno": "rj",
                "dimensionDetails": [{
                    "amount": "2",
                    "ambalaj": "Paket",
                    "xdim": "1",
                    "ydim": "5",
                    "height": "2",
                    "grossweight": "12",
                    "neatweight": "10",
                    "istif": "2",
                    "articleno": "Ar29",
                    "productnumber": "12",
                    "volume": 10,
                    "ldm": 10
                }]
            }, {
                "kap": "3",
                "grossweight": "38",
                "neatweight": "30",
                "volume": "30",
                "ldm": "30",
                "hscode": "rjr",
                "loaddefinition": "rjr",
                "buyerorderno": "rj",
                "dimensionDetails": [{
                    "amount": "1",
                    "ambalaj": "Ambalaj",
                    "xdim": "5",
                    "ydim": "2",
                    "height": "1",
                    "grossweight": "22",
                    "neatweight": "16",
                    "istif": "6",
                    "articleno": "A45",
                    "productnumber": "6",
                    "volume": 10,
                    "ldm": 10
                }, {
                    "amount": "2",
                    "ambalaj": "Paket",
                    "xdim": "1",
                    "ydim": "5",
                    "height": "2",
                    "grossweight": "8",
                    "neatweight": "7",
                    "istif": "2",
                    "articleno": "Ar29",
                    "productnumber": "12",
                    "volume": 10,
                    "ldm": 10
                }]
            }],
            "kap": 5,
            "grossweight": 52,
            "neatweight": 40,
            "volume": 40,
            "ldm": 50
        }, {
            "uiid": "f4e9364f-89f1-4c91-8c31-eeddef183b47",
            "loadAddress": "İstanbul",
            "unloadAddress": "Capetown",
            "readydate": "29/07/2016",
            "ogdate": "31/07/2016",
            "adr": "adrno123",
            "certificate": "serti123",
            "loadDetails": [{
                "kap": "4",
                "grossweight": "50",
                "neatweight": "40",
                "volume": "30",
                "ldm": "30",
                "hscode": "code1",
                "loaddefinition": "def1242",
                "buyerorderno": "1233412AE",
                "dimensionDetails": [{
                    "amount": "1",
                    "ambalaj": "Paket",
                    "xdim": "1",
                    "ydim": "5",
                    "height": "1",
                    "grossweight": "12",
                    "neatweight": "8",
                    "istif": "1",
                    "articleno": "ar343",
                    "productnumber": "2",
                    "volume": 5,
                    "ldm": 5
                }, {
                    "amount": "1",
                    "ambalaj": "Kutu",
                    "xdim": "1",
                    "ydim": "1",
                    "height": "5",
                    "grossweight": "14",
                    "neatweight": "12",
                    "istif": "2",
                    "articleno": "ar665",
                    "productnumber": "12",
                    "volume": 5,
                    "ldm": 5
                }, {
                    "amount": "2",
                    "ambalaj": "Paket",
                    "xdim": "1",
                    "ydim": "2",
                    "height": "5",
                    "grossweight": "12",
                    "neatweight": "10",
                    "istif": "4",
                    "articleno": "ar4",
                    "productnumber": "20",
                    "volume": 10,
                    "ldm": 10
                }]
            }],
            "kap": 4,
            "grossweight": 50,
            "neatweight": 40,
            "volume": 30,
            "ldm": 30
        }]


        let data = {
            "serviceType": {
                "id": 1, "code": "EXPRESS", "name": "EXPRESS"
            },
            "incoterm": {
                "id": -2, "code": "ic2", "name": "Incoterm 2"
            },
            "truckLoadType": {
                "id": 0, "code": "FTL", "name": "FTL"
            },
            "insuranceIncluded": {
                "id": 0, "name": "No"
            },
            "paymentMethod": {
                "id": -2, "code": "visa", "name": "Credit Card (Visa)"
            },
            "loadWorth": 123,
            "loadWorthCurrency": {
                "id": -1, "code": "USD", "name": "United States Dollar"
            },
            loads: loads
        }

        this.updateState(this.state, "data", data);
    }

    queryTransportOrderReq_Mock = (test) => {

        let orderNo = this.state.transportOrderReq.requestNo;

        let customer = "";
        if(this.state.transportOrderReq.customer) {
            customer = this.state.transportOrderReq.customer.name;
        }

        let orderType = this.state.transportOrderReq.orderType;
        let projectNo = this.state.transportOrderReq.projectNo;
        let customerNote = this.state.transportOrderReq.customerNote;

        let transportOrderReq = {
            requestNo: "123123",
            customer: {
                name: "customer 1"
            },
            orderType: "SPOT",
            projectNo: "pr no 1",
            customerNote: "Not Not not"
        }

        this.updateState(this.state, "transportOrderReq", transportOrderReq);

    }

    savedata_Mock = () => {
        console.log(JSON.stringify(this.state.data.loads));

    }



    queryLookups = () => {
        this.state.lookups = {};
        this.lookupAjaxRequest('/order-service/lookup/service-type/', this.state.lookups, "serviceType");
        this.lookupAjaxRequest('/order-service/lookup/incoterm/', this.state.lookups, "incoterm");
        this.lookupAjaxRequest('/order-service/lookup/currency/', this.state.lookups, "currency");
        this.lookupAjaxRequest('/order-service/lookup/payment-method/', this.state.lookups, "paymentMethod");
        this.lookupAjaxRequest('/order-service/lookup/truck-load-type/', this.state.lookups, "truckLoadType");

    }

    lookupAjaxRequest(url, parameter, paramName) {
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            async: false,
            success: (data) => {
                parameter[paramName] = data;
            },
            error: (xhr, status, err) => {
                console.error("Error ocured", status, err.toString());
            }

        });
    }

    queryTransportOrderReq = (preOrderId) => {
        $.ajax({
            url: '/order-service/transport-order-req/' + preOrderId,
            type: 'GET',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            async: false,
            success: (data) => {
                this.state.transportOrderReq = data;
            },
            error: (xhr, status, err) => {
                console.error("Error ocured", status, err.toString());
            }

        });

    }


    saveData = () => {

        let data = JSON.parse(JSON.stringify(this.state.data));
        delete data["loads"];

        console.log(JSON.stringify(data));
        $.ajax({
            url: '/order-service/transport-order/',
            type: 'POST',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            async: false,
            success: (data) => {
                this.state.transportOrderReq = data;
            },
            error: (xhr, status, err) => {
                console.error("Error ocured", status, err.toString());
            }

        });
    }
}
