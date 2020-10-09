import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { DropDown, TextInput } from 'susam-components/basic';
import { Card } from 'susam-components/layout';
import { Table } from 'susam-components/table';


export class OrderQuota extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            lookups: {}
        };
        if (props.data && props.data.orderQuota) {
            this.state.data = props.data.orderQuota;
        } else {
            this.state.data = [];
        }
    }

    getOrderQuotaLimit() {
        return axios.get('/order-service/lookup/order-quota-limit/');
    }

    getOrderQuotaType() {
        return axios.get('/order-service/lookup/order-quota-type/');
    }

    getOrderQuotaTime() {
        return axios.get('/order-service/lookup/order-quota-time/');
    }

    componentWillMount() {
        axios.all([this.getOrderQuotaLimit(),
            this.getOrderQuotaType(),
            this.getOrderQuotaTime()])
            .then(axios.spread((quotaLimit, quotaType, quotaTime) => {
                let state = _.cloneDeep(this.state);
                let lookupElem = {};
                lookupElem.quotaLimit = quotaLimit.data;
                lookupElem.quotaType = quotaType.data;
                lookupElem.quotaTime = quotaTime.data;

                this.retrieveHeaders();
                this.retrieveActions();
                this.retrieveInsertion();

                this.setState({lookups: lookupElem});
            })).catch((error) => {
            console.log(error);
        });


    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data && nextProps.data.orderQuota) {
            this.state.data = nextProps.data.orderQuota;
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
                name: "Min/Max",
                data: "limit"
            },
            {
                name: "Amount",
                data: "amount"
            },
            {
                name: "Type",
                data: "type"
            },
            {
                name: "Time",
                data: "time"
            }
        ];

    }

    retrieveInsertion = () => {

        return {
            limit: [
                <DropDown options={this.state.lookups.quotaLimit}/>
            ],
            amount: [
                <TextInput />
            ],
            type: [
                <DropDown options={this.state.lookups.quotaType}/>
            ],
            time: [
                <DropDown options={this.state.lookups.quotaTime}/>
            ]
        };

    }

    retrieveActions = () => {

        return{
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

        this.props.handleDataUpdate("orderQuota", dataArr);

    }

    historyObjectToTextFcn(data) {

        let label = data.owner.label + ":";

        data.data.forEach((elem) => {
            label += "\n" + elem.limit + "," + elem.amount + "," + elem.type + "," + elem.time;
        })

        return label;
    }

    render() {
        let hierarchialDataIcon = {element: this.props.hierarchialDataIcon(this.historyObjectToTextFcn, "orderQuota")};
        return (
            <Card title="Order Quota" toolbarItems = {[hierarchialDataIcon]}>

                <Table data={this.state.data} headers={this.retrieveHeaders()} actions={this.retrieveActions()}
                       insertion={this.retrieveInsertion()}>

                </Table>

            </Card>
        );
    }
}

OrderQuota.contextTypes = {
    translator: React.PropTypes.object
};
