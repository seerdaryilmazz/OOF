
import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {DropDown, Notify, TextArea, Button} from "susam-components/basic";
import {Chip} from "susam-components/advanced";

import {RuleService} from '../../services';


export class RuleTest extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: {},
            testData: this.retrieveInitialTestData(),
            testResult: "",
            isHidden: true
        }


    }

    componentDidMount() {
        RuleService.retrieveRuleSummary().then(response => {
                this.setState({data: response.data});
            }
        ).catch((error) => {
            Notify.showError("An Error Occured While Loading Rules", error);
            console.log("Error:" + error);
        });

    }

    test() {

        let dataObj;

        try {
            dataObj = JSON.parse(this.state.testData);
        } catch (e) {
            Notify.showError("Error Occured: " + e);
        }

        if(!dataObj) return;

        axios.post("/order-template-service/rule/execute/create-order/execute-rules", dataObj).then(response => {
                this.setState({testResult: JSON.stringify(response.data, null, 3)});
            }
        ).catch((error) => {
            Notify.showError("Error Occured while trunning test!: ", error);
            console.log("Error:" + error);
        });;
    }

    handleShowHideClick() {
        if(this.state.isHidden) {
            this.setState({isHidden: false});
        } else {
            this.setState({isHidden: true});
        }
    }

    retrieveShowHideIcon() {
        if(this.state.isHidden) {
            return "angle-double-down";
        } else {
            return "angle-double-up";
        }
    }


    render() {

        return (
            <Card title="Rule Test" toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]}>
                <Grid hidden={this.state.isHidden}>
                    <GridCell>
                        <Button label="Test" style="success" size="Large"
                                onclick={() => {this.test()}}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <span>Input: </span>
                    </GridCell>
                    <GridCell width="1-2">
                        <span>Output: </span>
                    </GridCell>
                    <GridCell width="1-2">
                        <TextArea value={this.state.testData} rows={30}
                                  onchange={(value) => {this.setState({testData: value})}}></TextArea>
                    </GridCell>
                    <GridCell width="1-2" >
                        <TextArea value={this.state.testResult} rows={30}></TextArea>
                    </GridCell>
                </Grid>
            </Card>
        );
    }


    retrieveInitialTestData() {
        let data = {
            "deleted": false,
            "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
            "lastUpdatedBy": "user-dg",
            "id": 6952,
            "subsidiary": {
                "id": 952,
                "name": "EKOL LOJISTIK A.Ş."
            },
            "customerId": 3035951,
            "customer": null,
            "serviceType": {
                "id": "STANDARD",
                "code": "STANDARD",
                "name": "Standard"
            },
            "truckLoadType": {
                "id": "FTL",
                "code": "FTL",
                "name": "FTL"
            },
            "incoterm": {
                "deleted": false,
                "lastUpdated": null,
                "lastUpdatedBy": null,
                "code": "CPT/CFR",
                "name": "CPT/CFR",
                "id": 251
            },
            "insuredByEkol": true,
            "status": {
                "id": "RESERVED",
                "code": "RESERVED",
                "name": "RESERVED"
            },
            "readyAtDate": null,
            "documents": [],
            "shipments": [
                {
                    "deleted": false,
                    "lastUpdated": "13/01/2017 08:44 Europe/Berlin",
                    "lastUpdatedBy": "user-dg",
                    "id": 4952,
                    "code": "000063",
                    "adrClass": {
                        "deleted": false,
                        "lastUpdated": null,
                        "lastUpdatedBy": null,
                        "code": "1",
                        "name": "Explosive substances and articles ",
                        "id": 1
                    },
                    "sender": {
                        "companyId": 51,
                        "company": {
                            "id": 51,
                            "name": "KAYA BLANKET - ARZU KAYA",
                            "contact": null,
                            "segmentType": null
                        },
                        "companyContactId": -1111,
                        "companyContact": {
                            "id": -1111,
                            "firstName": "EULLAH",
                            "lastName": "KAYA"
                        },
                        "locationOwnerCompanyId": 51,
                        "locationOwnerCompany": null,
                        "locationId": 201,
                        "location": {
                            "id": 201,
                            "name": "ARZU KAYA",
                            "postaladdress": {
                                "postalCode": "16400",
                                "country": {
                                    "id": 26001,
                                    "countryName": "HUNGARY",
                                    "iso": "HU"
                                },
                                "formattedAddress": "Kemalpaşa Mh. Atatürk Bulvarı Kaptan İş Merkezi No:23 Kat:1, 16400 İNEGÖL, BURSA TURKEY",
                                "pointOnMap": {
                                    "lat": 47.4482306696,
                                    "lng": 19.0657371283
                                }
                            }
                        },
                        "locationContactId": -1111,
                        "locationContact": {
                            "id": -1111,
                            "firstName": "EULLAH",
                            "lastName": "KAYA"
                        }
                    },
                    "receiver": {
                        "companyId": 3023998,
                        "company": {
                            "id": 3023998,
                            "name": "VOLKSWAGEN LOGISTICS GMBH & CO OHG",
                            "contact": null,
                            "segmentType": null
                        },
                        "companyContactId": 35310,
                        "companyContact": {
                            "id": 35310,
                            "firstName": "JAN",
                            "lastName": "HENDRIK KALFARI"
                        },
                        "locationOwnerCompanyId": 3026016,
                        "locationOwnerCompany": null,
                        "locationId": 3028051,
                        "location": {
                            "id": 3028051,
                            "name": "VW LOGISTICS",
                            "postaladdress": {
                                "postalCode": "38436",
                                "country": {
                                    "id": 31551,
                                    "countryName": "GERMANY",
                                    "iso": "DE"
                                },
                                "formattedAddress": "HESSLINGER STRASSE 12 , 38436 WOLFSBURG, BRAUNSCHWEIG GERMANY",
                                "pointOnMap": {
                                    "lat": 52.41050249,
                                    "lng": 10.8025522
                                }
                            }
                        },
                        "locationContactId": 35308,
                        "locationContact": {
                            "id": 35308,
                            "firstName": "SASKIA",
                            "lastName": "GILLICH"
                        }
                    },
                    "readyAtDate": "26/10/2016 02:30 Europe/Berlin",
                    "pickupAppointment": {
                        "start": "01/11/2016 00:30 UTC",
                        "end": "12/11/2016 00:30 UTC"
                    },
                    "deliveryAppointment": {
                        "start": null,
                        "end": null
                    },
                    "shipmentUnits": [
                        {
                            "deleted": false,
                            "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                            "lastUpdatedBy": "user-dg",
                            "id": 1953,
                            "type": {
                                "id": 1,
                                "packageGroup": {
                                    "id": 2
                                }
                            },
                            "totalGrossWeightInKilograms": 200,
                            "totalNetWeightInKilograms": 200,
                            "totalVolumeInCubicMeters": 24,
                            "totalLdm": 200,
                            "shipmentUnitPackages": []
                        },
                        {
                            "deleted": false,
                            "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                            "lastUpdatedBy": "user-dg",
                            "id": 1952,
                            "type": {
                                "deleted": false,
                                "lastUpdated": null,
                                "lastUpdatedBy": null,
                                "code": "Pallet",
                                "name": "Pallet",
                                "id": 51,
                                "hasRestriction": false,
                                "packageGroup": {
                                    "id": 1
                                }
                            },
                            "totalGrossWeightInKilograms": 100,
                            "totalNetWeightInKilograms": 100,
                            "totalVolumeInCubicMeters": 2,
                            "totalLdm": 100,
                            "shipmentUnitPackages": [
                                {
                                    "deleted": false,
                                    "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                                    "lastUpdatedBy": "user-dg",
                                    "id": 1952,
                                    "count": 2,
                                    "lengthInCentimeters": 100,
                                    "widthInCentimeters": 100,
                                    "heightInCentimeters": 100,
                                    "stackSize": 1
                                }
                            ]
                        }
                    ],
                    "planningStatus": {
                        "id": "FINISHED",
                        "code": "FINISHED",
                        "name": "Finished"
                    },
                    "shipmentStatus": "TO_BE_RECEIVED"
                }
            ],
            "routeRequirements": [
                {
                    "deleted": false,
                    "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                    "lastUpdatedBy": "user-dg",
                    "id": 2953,
                    "permissionType": {
                        "id": "REQUIRED",
                        "code": "REQUIRED",
                        "name": "Required"
                    },
                    "transportType": {
                        "deleted": false,
                        "lastUpdated": "11/10/2016 14:19 Europe/Berlin",
                        "lastUpdatedBy": "admin",
                        "code": "SEA",
                        "name": "Denizyolu Taşımacılığı",
                        "id": 51
                    },
                    "routes": [
                        {
                            "deleted": false,
                            "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                            "lastUpdatedBy": "user-dg",
                            "id": 2954,
                            "routeId": 2251
                        },
                        {
                            "deleted": false,
                            "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                            "lastUpdatedBy": "user-dg",
                            "id": 2953,
                            "routeId": 2651
                        },
                        {
                            "deleted": false,
                            "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                            "lastUpdatedBy": "user-dg",
                            "id": 2955,
                            "routeId": 2001
                        }
                    ]
                },
                {
                    "deleted": false,
                    "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                    "lastUpdatedBy": "user-dg",
                    "id": 2952,
                    "permissionType": {
                        "id": "NOT_ALLOWED",
                        "code": "NOT_ALLOWED",
                        "name": "Not Allowed"
                    },
                    "transportType": {
                        "deleted": false,
                        "lastUpdated": "11/10/2016 14:19 Europe/Berlin",
                        "lastUpdatedBy": "admin",
                        "code": "TRAIN",
                        "name": "Demiryolu Taşımacılığı",
                        "id": 101
                    },
                    "routes": [
                        {
                            "deleted": false,
                            "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                            "lastUpdatedBy": "user-dg",
                            "id": 2952,
                            "routeId": 2251
                        }
                    ]
                }
            ],
            "vehicleRequirements": [
                {
                    "deleted": false,
                    "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                    "lastUpdatedBy": "user-dg",
                    "id": 1952,
                    "permissionType": {
                        "id": "REQUIRED",
                        "code": "REQUIRED",
                        "name": "Required"
                    },
                    "vehicleType": {
                        "id": "TRAILER",
                        "code": "TRAILER",
                        "name": "Trailer"
                    },
                    "vehicleDetails": [
                        {
                            "deleted": false,
                            "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                            "lastUpdatedBy": "user-dg",
                            "id": 1952,
                            "type": null
                        },
                        {
                            "deleted": false,
                            "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                            "lastUpdatedBy": "user-dg",
                            "id": 1953,
                            "type": null
                        }
                    ]
                },
                {
                    "deleted": false,
                    "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                    "lastUpdatedBy": "user-dg",
                    "id": 1953,
                    "permissionType": {
                        "id": "NOT_ALLOWED",
                        "code": "NOT_ALLOWED",
                        "name": "Not Allowed"
                    },
                    "vehicleType": {
                        "id": "TRUCK",
                        "code": "TRUCK",
                        "name": "Truck"
                    },
                    "vehicleDetails": [
                        {
                            "deleted": false,
                            "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                            "lastUpdatedBy": "user-dg",
                            "id": 1954,
                            "type": null
                        }
                    ]
                }
            ],
            "equipmentRequirements": [
                {
                    "deleted": false,
                    "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                    "lastUpdatedBy": "user-dg",
                    "id": 1952,
                    "count": 2,
                    "equipmentType": {
                        "deleted": false,
                        "lastUpdated": "11/11/2016 14:00 Europe/Berlin",
                        "lastUpdatedBy": "admin",
                        "code": "ANGLEIRON",
                        "name": "Angle Iron",
                        "id": 1251
                    }
                },
                {
                    "deleted": false,
                    "lastUpdated": "11/11/2016 17:06 Europe/Berlin",
                    "lastUpdatedBy": "user-dg",
                    "id": 1953,
                    "count": 3,
                    "equipmentType": {
                        "deleted": false,
                        "lastUpdated": "11/11/2016 14:00 Europe/Berlin",
                        "lastUpdatedBy": "admin",
                        "code": "CHAIN",
                        "name": "Chain",
                        "id": 1651
                    }
                }
            ]
        };
        return JSON.stringify(data, null, 3);
    }

}