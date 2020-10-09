import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {TextInput, Notify, Button, Span} from "susam-components/basic";
import {Chip, DateRange} from "susam-components/advanced";
import {CompanySearchAutoComplete} from "susam-components/oneorder";

import {ProjectService, KartoteksService} from '../../services';

import {SenderAdd} from './SenderAdd';
import {SenderList} from './SenderList';


export class Sender extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: {},
            lookup:{},
            isHidden: true
        }

    }

    componentDidMount() {
        this.loadData(this.props)
    }

    componentWillReceiveProps(nextProps) {
        this.loadData(nextProps)

    }

    loadData(props) {
        let data = this.state.data;
        let lookup = this.state.lookup;

        if (props.data) {
            data = props.data;
        }
        if (props.lookup) {
            lookup = props.lookup;
        }
        this.setState({data: data, lookup: lookup});
    }

    handleDataUpdate(field, param) {
        let data = this.state.data;
        data[field] = param;
        this.setState({data: data});
    }

    handleCountrySelectionUpdate(countryData, callback) {

        let data = this.state.data;
        let countries = data.countries;

        if (!countries) {
            countries = [];
        }

        let newCountryIsos = countryData.map(c => {
            return c.iso
        });

        countries.forEach(c => {
            if (!newCountryIsos.includes(c.iso)) {
                delete data.sendersData[c.iso];
            }
        });

        newCountryIsos.forEach(c => {
            if (!data.sendersData) {
                data.sendersData = {};
            }
            if (!data.sendersData[c]) {
                data.sendersData[c] = [];
            }
        });

        data.countries = countryData;
        this.setState({data: data}, () => {
            if(callback) {
                callback();
            }
        });

    }

    handleAddSenderClick() {
        this.senderAddReference.openModal()
    }

    addSenderHandler(newSender) {
        let data = this.state.data;

        KartoteksService.getCompany(newSender.senderCompany.id).then(response => {
            
            let countryIso = response.data.country.iso;

            let country
            if(!data.countries) {
                data.countries = [];
            } else {
                country = data.countries.find(d => d.iso == countryIso);
            }
            
            if(!country) {
                let country = this.state.lookup.country.find(c => c.iso == countryIso);
                if(!country) {
                    Notify.showError("Selected company has invalid country.");
                    return;
                }

                data.countries.push(country);
                this.handleCountrySelectionUpdate(data.countries, () => {
                    let senderList = data.sendersData[country.iso];
                    senderList.push(newSender);
                    this.setState({data: data});
                })
            } else {
                let senderList = data.sendersData[country.iso];
                senderList.push(newSender);
                this.setState({data: data});
            }
            
        }).catch((error) => {
            Notify.showError(error);
            console.log("Error Occured while retrieving company:" + error);
        });

        this.setState({data: data})
    }

    dataDeleteHandler(country, sender) {
        let data = this.state.data;

        let senderList = data.sendersData[country.iso];


        let elemIndex = senderList.findIndex(e => e._guiKey == sender._guiKey);
        if (elemIndex < 0) return false;
        senderList.splice(elemIndex, 1);

        this.setState({data: data})
    }

    handleSave() {
        this.props.saveHandler(this.state.data);
    }

    handleShowHideClick() {
        if (this.state.isHidden) {
            this.setState({isHidden: false});
        } else {
            this.setState({isHidden: true});
        }
    }

    retrieveShowHideIcon() {
        if (this.state.isHidden) {
            return "angle-double-down";
        } else {
            return "angle-double-up";
        }
    }

    renderSenderGroups() {
        let data = this.state.data;
        let countries = data.countries;

        if (!countries) {
            return null;
        }

        return countries.map(country => {
            return this.renderSenderGroup(country);
        })
    }

    renderSenderGroup(country) {

        let data = this.state.data;

        return (
            <Grid key={country.iso}
                  toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]}>
                <GridCell width="9-10">
                    <Span value={"Sender Country: " + country.name}/>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    <SenderList data={data.sendersData[country.iso]} handleDelete={(data) => {
                        this.dataDeleteHandler(country, data)
                    }}/>
                </GridCell>
            </Grid>
        );
    }


    render() {

        let data = this.state.data;
        let lookup = this.state.lookup;

        if (!data || !lookup) {
            return null;
        }

        return (
            <Card title="Sender"
                  toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]} c>
                <Grid hidden={this.state.isHidden}>
                    <GridCell width="2-5">
                        <Chip label="Sender Counties" options={lookup.country} valueField="iso"
                              value={data.countries}
                              onchange={(data) => {
                                  this.handleCountrySelectionUpdate(data, null)
                              }}/>
                    </GridCell>
                    <GridCell width="3-5"/>
                    <GridCell width="1-1">
                        <Button label="Add Sender" onclick={() => {
                            this.handleAddSenderClick()
                        }}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <SenderAdd ref={(c) => this.senderAddReference = c} handleAdd={(data) => {
                            this.addSenderHandler(data)
                        }}/>
                    </GridCell>
                    <GridCell width="1-1">
                        {this.renderSenderGroups()}
                    </GridCell>
                    <GridCell width="1-10">
                        <Button label="Save" style="success" onclick={() => {
                            this.handleSave()
                        }}/>
                    </GridCell>
                </Grid>
            </Card>

        );
    }
}