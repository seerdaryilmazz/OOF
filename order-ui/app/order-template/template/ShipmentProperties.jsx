import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { DropDown, TextInput } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { Table } from 'susam-components/table';



export class ShipmentProperties extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            lookups: {}
        };
        if (props.data && props.data.shipmentProperties) {
            this.state.data = props.data.shipmentProperties;
        } else {
            this.state.data = [];
        }
    }

    getPackageType() {
        return axios.get('/order-service/lookup/package-type/');
    }

    componentWillMount() {
        axios.all([this.getPackageType()])
            .then(axios.spread((packageType, stackability) => {
                let state = _.cloneDeep(this.state);
                let lookupElem = {};
                lookupElem.packageType = packageType.data;

                this.retrieveHeaders();
                this.retrieveActions();
                this.retrieveInsertion();

                this.setState({lookups: lookupElem});
            })).catch((error) => {
            console.log(error);
        });


    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data && nextProps.data.shipmentProperties) {
            this.state.data = nextProps.data.shipmentProperties;
        }
        if (nextProps.hierarchialData) {
            this.state.hierarchialData = nextProps.hierarchialData;
        }
    }


    retrieveHeaders = () => {

        return [
            {
                name: "id",
                data: "id",
                hidden: true
            },
            {
                name: "Package Type",
                data: "packageType",
                render: (data) => { return this.renderPackageType(data)}
            },
            {
                name: "Stackability",
                data: "stackability"
            },
            {
                name: "Properties",
                data: "properties"
            },
            {
                name: "Description",
                data: "description"
            }
        ];

    }

    renderPackageType(data) {

        let result =  this.state.lookups.packageType.find(p => {return (p.id == data.packageType)});

        if(!result) return "";

        return result.name;
    }

    retrieveInsertion = () => {

        return {
            packageType: [
                <DropDown options={this.state.lookups.packageType}/>
            ],
            stackability: [
                <TextInput />
            ],
            properties: [
                <TextInput />
            ],
            description: [
                <TextInput />
            ]
        };

    }

    retrieveActions = () => {

        return {
            rowEdit: {
                icon: "pencil-square",
                action: (value, oldValue) => this.rowEdit(value, oldValue),
                title: "edit"
            },
            rowDelete: {
                icon: "close",
                action: (value) => this.rowDelete(value),
                title: "remove",
                confirmation: "Are you sure you want to delete"
            },
            rowAdd: (value) => this.rowAdd(value),
            rowClick: (value) => this.rowClicked(value)
        };

    }


    rowAdd(value) {
        this.state.data.push(value);
        this.formatDataSendParent();
    }

    rowEdit(value, oldValue) {
        _.remove(this.state.data, function (item) {
            return item.amount == oldValue.amount;
        });
        this.state.data.push(value);
        this.formatDataSendParent();
        return true;
    }

    rowDelete(value) {
        _.remove(this.state.data, function (item) {
            return item == value;
        });
        this.formatDataSendParent();
    }

    rowClicked(value) {
    }

    formatDataSendParent() {
        let dataArr = _.cloneDeep(this.state.data);

        dataArr.forEach(function (elem) {

            for (var c in elem) {
                if (!elem.hasOwnProperty(c)) {
                    continue;
                }
                else if (elem[c] && elem[c].id) {
                    elem[c] = elem[c].id;
                }

            }
        });

        this.props.handleDataUpdate("shipmentProperties", dataArr);

    }

    historyObjectToTextFcn(data) {

        let packageTypeLookup = this.state.lookups.packageType;

        let label = data.owner.label;

        data.data.forEach((elem) => {
            let packageTypeLookupElem = packageTypeLookup ? packageTypeLookup.find(p => {return (p.id == elem.packageType)}) : null;
            label += "\n"
                + (packageTypeLookupElem? packageTypeLookupElem.name : elem.packageType)
                + (elem.stackability? " " + elem.stackability: "")
                + (elem.properties? " " + elem.properties : "")
                + (elem.description? " " + elem.description: "");
        })

        return label;
    }

    render() {
        return (
            <Grid>
                <GridCell width="9-10">
                    <div className="uk-form-row">
                        <div className="md-input-wrapper md-input-filled">
                            <label>Shipment Properties</label>
                        </div>
                    </div>
                </GridCell>
                <GridCell width="1-10">
                    {this.props.hierarchialDataIcon((data) =>  this.historyObjectToTextFcn(data), "shipmentProperties")}
                </GridCell>
                <GridCell width="1-1">
                    <Table data={this.state.data} headers={this.retrieveHeaders()} actions={this.retrieveActions()}
                           insertion={this.retrieveInsertion()}>

                    </Table>
                </GridCell>
            </Grid>
        );
    }
}

ShipmentProperties.contextTypes = {
    translator: React.PropTypes.object
};
