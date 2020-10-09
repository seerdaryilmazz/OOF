import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip } from 'susam-components/advanced';
import { Button } from 'susam-components/basic';
import { Card, Grid, GridCell } from 'susam-components/layout';
import uuid from 'uuid';
import { ParticipantSelection } from './ParticipantSelection';
import { ShipmentProperties } from './ShipmentProperties';




export class ShipmentInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {data: {}, lookups: {}};

        if (props.data) {
            this.state.data = props.data;
        } else {
            this.state.data = {};
        }
    }

    getADR() {
        return axios.get('/order-service/lookup/adr-class/');
    }

    componentDidMount() {
        axios.all([this.getADR()])
            .then(axios.spread((adr) => {
                let state = _.cloneDeep(this.state);
                state.lookups.adr = adr.data;
                this.setState(state);
            })).catch((error) => {
            console.log(error);
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({data: nextProps.data});
        }
    }

    updateData(field, value) {
        this.props.handleDataUpdate(field, value);
    }

    historyObjectToTextFcn(data) {
        let label = data.owner.label + ":";

        data.data.forEach((elem) => {
            label += "\n" + elem.name;
        })

        return label;
    }

    historyObjectToTextFcnParticipants(data) {
        let label = data.owner.label + ": ";

        data.data.forEach((elem) => {
            if(elem.company.name) {
                label += "\n" + elem.company.name;
            }
            else {
                label += "\n" +"<No company name given>";
            }
        })

        return label;
    }

    handleSelectConsigneeClick(e) {
        this.consigneeModal.loadTemplateData();
        this.consigneeModal.show();
    }

    handleSelectSenderClick(e) {
        this.senderModal.loadTemplateData();
        this.senderModal.show();
    }

    handleParticipantSave(field, readonlyField, value) {
        let state = _.cloneDeep(this.state);

        if (this.props.readOnlyDataInterface.isReadOnly(readonlyField)) {
            state.data[field] = [];
        }
        else if (!state.data[field]) {
            state.data[field] = [];
        }
        state.data[field].push(value);
        this.setState(state);
        this.props.handleDataUpdate(field, state.data[field]);

    }

    handleConsigneeSave(value) {
        this.handleParticipantSave("receivers", "receiverCompanies", value);
    }

    handleSenderSave(value) {
        this.handleParticipantSave("senders", "senderCompanies", value);
    }

    handleDeleteDifferentParticipant(e, field, item) {
        let data = _.cloneDeep(this.state.data);

        _.remove(data[field], req => {
            return req.company.code == item.company.code;
        });

        this.setState({data: data});
        this.props.handleDataUpdate(field, data[field]);

    }

    retrieveSelfLocationInformationList(companyData) {
        if (!companyData.locations && !companyData.locationContacts) return null;
        return (

            <ul className="md-list md-list-addon">
                <li>
                    <div className="md-list-addon-element">
                        <i className="uk-icon-medium uk-icon-map-marker"></i>
                    </div>
                    <div className="md-list-content">
                        <span className="uk-text-small uk-text-muted uk-text-truncate">
                           {companyData.locations ? companyData.locations.map(each => each.name).join(",") : "<No Location>"}
                        </span>
                        <span className="uk-text-small uk-text-muted uk-text-truncate uk-text-italic">
                            {companyData.locationContacts ? companyData.locationContacts.map(each => each.name).join(",") : "<No Contact>"}
                        </span>
                    </div>
                </li>
            </ul>
        );
    }

    retrieveDifferentCompaniesList(differentCompaniesData) {
        if (!differentCompaniesData) return null;
        return (
            <ul className="md-list md-list-addon">

                {differentCompaniesData.map(differentCompany => {
                    return (
                        <li key={differentCompany.company.id + "-22"}>
                            <div className="md-list-addon-element">
                                <i className="uk-icon-medium uk-icon-map-marker"></i>
                            </div>
                            <div className="md-list-content">
                                <span className="uk-text-small">
                                    {differentCompany.company.name}
                                </span>
                                <span className="uk-text-small uk-text-muted uk-text-truncate">
                                    {differentCompany.locations ? differentCompany.locations.map(each => each.name).join(",") : "<No Location>"}
                                </span>
                                <span className="uk-text-small uk-text-muted uk-text-truncate uk-text-italic">
                                    {differentCompany.locationContacts ? differentCompany.locationContacts.map(each => each.name).join(",") : "<No Contact>"}
                                </span>
                            </div>
                        </li>

                    );
                })}
            </ul>
        )
    }


    renderSelectedParticipants(field) {
       // console.log("render selected item: " + JSON.stringify(this.state[field], null, 3));

        let result = "";
        if (this.state.data[field]) {
            result = this.state.data[field].map(item => {
                return (
                    <li key={item.company.id + "-1"}>
                        <div className="md-list-content">
                            <Grid collapse={true}>
                                <GridCell width="9-10" noMargin={true}>
                                    <span className="uk-text-truncate">
                                        {item.company.name}
                                    </span>
                                    <span className="uk-text-small uk-text-muted uk-text-italic">
                                        {item.contacts ? item.contacts.map(each => each.name).join(",") : "<No Contact>"}
                                    </span>
                                    <span>{this.retrieveSelfLocationInformationList(item)}</span>
                                    <span>{this.retrieveDifferentCompaniesList(item.differentCompanies)}</span>
                                </GridCell>
                                <GridCell width="1-10" noMargin={true}>
                                    <a href="#" className="md-list-action"
                                       onClick={(e) => this.handleDeleteDifferentParticipant(e, field, item)}><i
                                        className="md-icon uk-icon-times"/></a>
                                </GridCell>
                            </Grid>
                        </div>
                    </li>
                );
            })
        }
        return result;
    }

    constructParticipantTemplateData(companyField, locationCompanyField, locationAddressField) {

        let company = this.props.readOnlyDataInterface.retrieveValueDynamic(companyField, null);
        let isCompanyReadOnly = this.props.readOnlyDataInterface.isReadOnly(companyField)

        let locationCompany = this.props.readOnlyDataInterface.retrieveValueDynamic(locationCompanyField, null);
        let isLocationCompanyReadOnly = this.props.readOnlyDataInterface.isReadOnly(locationCompanyField);


        let locationAddress = this.props.readOnlyDataInterface.retrieveValueDynamic(locationAddressField, null);
        let isLocationAddressReadOnly = this.props.readOnlyDataInterface.isReadOnly(locationAddressField);


        let data = {
            company: company,
            differentCompany: {
                company: locationCompany,
                locations: locationAddress
            },
            isCompanyReadOnly: isCompanyReadOnly,
            isLocationCompanyReadOnly: isLocationCompanyReadOnly,
            isLocationAddressReadOnly: isLocationAddressReadOnly

        };
        return data;
    }

    render() {
        let readOnlyDataInterface = this.props.readOnlyDataInterface;

        let senderData = this.constructParticipantTemplateData("senderCompanies", "loadCompanies", "loadAddresses");
        let consigneeData = this.constructParticipantTemplateData("receiverCompanies", "unloadCompanies", "unloadAddresses");

        let senderHierarchyButton = this.props.hierarchialDataIcon(this.historyObjectToTextFcnParticipants, "senders");
        let receiverHierarchyButton = this.props.hierarchialDataIcon(this.historyObjectToTextFcnParticipants, "receivers");

        let addSenderButton = null;
        let addConsigneeButton = null;

        let data = this.state.data;

        if (!(senderData.isCompanyReadOnly && data.senders && data.senders.length > 0)) {
            addSenderButton = <Button label="Add Sender Filter" onclick={(e) => this.handleSelectSenderClick(e)}/>
        }

        if (!(consigneeData.isCompanyReadOnly && data.receivers && data.receivers.length > 0)) {
            addConsigneeButton =
                <Button label="Add Consignee Filter" onclick={(e) => this.handleSelectConsigneeClick(e)}/>
        }

        return (
            <Card title="Shipment Details">
                <Grid>
                    <GridCell width="1-1">
                        <div className="md-input-wrapper md-input-filled">
                            <label>Sender Company</label>
                        </div>
                    </GridCell>
                    <GridCell width="9-10">
                        <ul className="md-list">
                            {this.renderSelectedParticipants("senders")}
                        </ul>
                        {addSenderButton}
                    </GridCell>
                    <GridCell width="1-10">{senderHierarchyButton}</GridCell>

                    <GridCell width="1-1">
                        <div className="md-input-wrapper md-input-filled">
                            <label>Consignee Company</label>
                        </div>
                    </GridCell>
                    <GridCell width="9-10">
                        <ul className="md-list">
                            {this.renderSelectedParticipants("receivers")}
                        </ul>
                        {addConsigneeButton}
                    </GridCell>
                    <GridCell width="1-10">{receiverHierarchyButton}</GridCell>
                    <GridCell width="9-10">
                        <Chip key={uuid.v4()} label="ADR"
                              onchange={(value) => this.updateData("adrs", value)}
                              value={readOnlyDataInterface.retrieveValue("adrs")}
                              readOnly={readOnlyDataInterface.isReadOnly("adrs")}
                              options={this.state.lookups.adr}/>
                    </GridCell>
                    <GridCell width="1-10">
                        {this.props.hierarchialDataIcon(this.historyObjectToTextFcn, "adrs")}
                    </GridCell>
                    <GridCell width="1-1">
                        <ShipmentProperties data={this.state.data}
                                            handleDataUpdate={(field, data) => this.updateData(field, data)}
                                            hierarchialDataIcon={(fcn, field) => this.props.hierarchialDataIcon(fcn, field)}>

                        </ShipmentProperties>
                    </GridCell>
                </Grid>


                <ParticipantSelection type="Consignee" ref={(c) => this.consigneeModal = c}
                                      onsave={(value) => this.handleConsigneeSave(value)}
                                      templateData={consigneeData}/>

                <ParticipantSelection type="Sender" ref={(c) => this.senderModal = c}
                                      onsave={(value) => this.handleSenderSave(value)}
                                      templateData={senderData}/>
            </Card>
        );
    }
}

ShipmentInfo.contextTypes = {
    translator: React.PropTypes.object
};