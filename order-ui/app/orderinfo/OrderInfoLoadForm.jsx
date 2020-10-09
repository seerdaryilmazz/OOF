import React from 'react';

import {Form, DropDown, TextInput, Button} from 'susam-components/basic';
import {Card, Grid, GridCell} from 'susam-components/layout';
import {DateTime} from 'susam-components/advanced';
import {Table} from 'susam-components/table';

export default class OrderInfoLoadForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }


    render() {

        this.state.data = this.props.data;

        let data = this.state.data;

        if (!data) {
            return null;
        }

        let senderElem = this.getSenderElem(data);
        let receiverElem = this.getReceiverElem(data);
        let orderDetails = this.getOrderDetails(data);


        return (


            <Card>
                {senderElem}
                {receiverElem}
                {orderDetails}

            </Card>
        );
    }


    getSenderElem(data) {
        return (
            <Grid>
                <GridCell width="2-5">
                    <TextInput label="Sender" onchange={(value) => this.updateValues(data, "sender", value)}
                               value={data.sender}></TextInput>
                </GridCell>
                <GridCell width="1-5">
                    <DropDown label="Contact Person" required={true}
                              onchange={(value) => this.updateValues(data, "senderContactPerson", value)}
                              value={data.senderContactPerson}
                              options={[{id:"1",name:"Opt 1"},{id:"0",name:"Opt 2"}]}/>
                </GridCell>
                <GridCell width="2-5">

                </GridCell>
                <GridCell width="2-5">
                    <TextInput label="Load Address" onchange={(value) => this.updateValues(data, "loadAddress", value)}
                               value={data.loadAddress}></TextInput>
                </GridCell>
                <GridCell width="1-5">
                    <DropDown label="Contact Person" required={true}
                              onchange={(value) => this.updateValues(data, "loadAddressContactPerson", value)}
                              value={data.loadAddressContactPerson}
                              options={[{id:"1",name:"Opt 1"},{id:"0",name:"Opt 2"}]}/>
                </GridCell>
                <GridCell width="1-5">
                    <DateTime label="Load Date" format="DD/MM/YYYY"
                              onchange={(value) => this.updateValues(data, "loadDate", value)}
                              value={data.loadDate}></DateTime>
                </GridCell>

                <GridCell width="1-5">

                </GridCell>
                <GridCell width="2-5">
                    <TextInput label="Load No" onchange={(value) => this.updateValues(data, "loadNo", value)}
                              value={data.loadNo}></TextInput>
                </GridCell>
                <GridCell width="3-5">
                </GridCell>
            </Grid>
        );
    }

    getReceiverElem(data) {
        return (
            <Grid>
                <GridCell width="2-5">
                    <TextInput label="Receiver" onchange={(value) => this.updateValues(data, "receiver", value)}
                               value={data.receiver}></TextInput>
                </GridCell>
                <GridCell width="1-5">
                    <DropDown label="Contact Person" required={true}
                              onchange={(value) => this.updateValues(data, "receiverContactPerson", value)}
                              value={data.receiverContactPerson}
                              options={[{id:"1",name:"Opt 1"},{id:"0",name:"Opt 2"}]}/>
                </GridCell>
                <GridCell width="2-5">

                </GridCell>
                <GridCell width="2-5">
                    <TextInput label="Unload Address"
                               onchange={(value) => this.updateValues(data, "unloadAddress", value)}
                               value={data.unloadAddress}></TextInput>
                </GridCell>
                <GridCell width="1-5">
                    <DropDown label="Contact Person" required={true}
                              onchange={(value) => this.updateValues(data, "unloadAddressContactPerson", value)}
                              value={data.unloadAddressContactPerson}
                              options={[{id:"1",name:"Opt 1"},{id:"0",name:"Opt 2"}]}/>
                </GridCell>
                <GridCell width="1-5">
                    <DateTime label="Unload Date" format="DD/MM/YYYY"
                              onchange={(value) => this.updateValues(data, "unloadDate", value)}
                              value={data.unloadDate}></DateTime>
                </GridCell>
                <GridCell width="1-5">
                </GridCell>
                <GridCell width="2-5">
                    <TextInput label="Unload No" onchange={(value) => this.updateValues(data, "unloadNo", value)}
                               value={data.unloadNo}></TextInput>
                </GridCell>
                <GridCell width="3-5">
                </GridCell>
            </Grid>
        );
    }

    getOrderDetails(data) {
        return (
            <Grid>
                <GridCell width="1-5">
                    <DateTime label="Ready Date" format="DD/MM/YYYY"
                              onchange={(value) => this.updateValues(data, "readyDate", value)}
                              value={data.readyDate}></DateTime>
                </GridCell>
                <GridCell width="4-5">
                </GridCell>
                <GridCell width="2-5">
                    <DropDown label="ADR / Class" required={true}
                              onchange={(value) => this.updateValues(data, "adrclass", value)}
                              value={data.adrclass}
                              options={[{id:"1",name:"Opt 1"},{id:"0",name:"Opt 2"}]}/>
                </GridCell>
                <GridCell width="2-5">
                    <DropDown label="Certificated Load" required={true}
                              onchange={(value) => this.updateValues(data, "certificatedLoad", value)}
                              value={data.certificatedLoad}
                              options={[{id:"1",name:"Opt 1"},{id:"0",name:"Opt 2"}]}/>
                </GridCell>

                <GridCell width="1-5">

                </GridCell>
                <GridCell width="1-5">
                    <TextInput label="Load Worth" onchange={(value) => this.updateValues(data, "loadWorth", value)}
                               value={data.loadWorth}></TextInput>
                </GridCell>
                <GridCell width="1-5">
                    <DropDown label="Currency" required={true}
                              onchange={(value) => this.updateValues(data, "currency", value)}
                              value={data.currency}
                              options={[{id:"1",name:"Opt 1"},{id:"0",name:"Opt 2"}]}/>
                </GridCell>
                <GridCell width="2-5">
                    <DropDown label="Special Load" required={true}
                              onchange={(value) => this.updateValues(data, "specialLoad", value)}

                              options={[{id:"1",name:"Opt 1"},{id:"0",name:"Opt 2"}]}/>
                </GridCell>
                <GridCell width="1-5">
                </GridCell>
                <GridCell width="1-5">
                    <Button label="Close" onclick={this.props.closeThis}/>
                </GridCell>
                <GridCell width="2-5">
                </GridCell>
                <GridCell width="1-5">
                    <Button label="Save" onclick={this.validateAndClose}/>
                </GridCell>

            </Grid>
        );
    }

    validateAndClose = () => {

        if (!this.props.updateLoads(this.state.data)) {
            return;
        }
        this.props.closeThis();
    }

    updateValues = (param, paramName, paramValue) => {
        param[paramName] = paramValue;
    }


}