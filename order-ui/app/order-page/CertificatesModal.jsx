import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown, Notify} from 'susam-components/basic';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';

import {OrderService} from '../services';

export class CertificatesModal extends TranslatingComponent {

    constructor(props) {

        super(props);

        this.state = {
            adrClass: null,
            certificatedLoad: null,
            specialLoad: null,
            adrClasses: []
        };

        if (props.value) {
            this.prepareState(props.value);
        }
    }

    componentDidMount() {
        this.loadAdrClasses();
    }

    prepareState(value) {

        let adrClass;
        let certificatedLoad;
        let specialLoad;

        if (value.adrClass) {
            adrClass = value.adrClass;
        } else {
            adrClass = null;
        }

        if (value.certificatedLoad) {
            certificatedLoad = value.certificatedLoad;
        } else {
            certificatedLoad = null;
        }

        if (value.specialLoad) {
            specialLoad = value.specialLoad;
        } else {
            specialLoad = null;
        }

        this.setState({adrClass: adrClass, certificatedLoad: certificatedLoad, specialLoad: specialLoad});
    }

    loadAdrClasses() {
        OrderService.getAdrClasses()
            .then(response => {
                let adrClasses = [];
                response.data.forEach(item => {
                    let adrClass = {
                        id: item.id,
                        name: item.code + " - " + item.name
                    }
                    adrClasses.push(adrClass);
                });
                this.setState({adrClasses: adrClasses});
            })
            .catch(error => {
                Notify.showError(error);
            });
    }

    handleAdrClassChange(value) {
        this.setState({adrClass: value});
    }

    handleCertificatedLoadChange(value) {
        this.setState({certificatedLoad: value});
    }

    handleSpecialLoadChange(value) {
        this.setState({specialLoad: value});
    }

    handleSave() {

        let value = {
            adrClass: this.state.adrClass,
            certificatedLoad: this.state.certificatedLoad,
            specialLoad: this.state.specialLoad
        };

        this.props.onsave && this.props.onsave(value);

        this.modal.close();
    };

    show(value) {
        this.prepareState(value);
        this.modal.open();
    }

    close() {
        this.modal.close();
    }

    render() {

        return (
            <Modal ref={(c) => this.modal = c} title="Certificates"
                   actions={[{label: "Close", action: () => this.close()},
                       {label: "Save", buttonStyle: "primary", action: () => this.handleSave()}]}>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <DropDown label="ADR Class"
                                  onchange={(value) => this.handleAdrClassChange(value)}
                                  value={this.state.adrClass}
                                  options={this.state.adrClasses}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <DropDown label="Certificated Load"
                                  onchange={(value) => this.handleCertificatedLoadChange(value)}
                                  value={this.state.certificatedLoad}
                                  options={[{id: "1", name: "Medical Products"},
                                      {id: "2", name: "Chemical Products"},
                                      {id: "3", name: "Food Products"},
                                      {id: "4", name: "Forest Products"},
                                      {id: "5", name: "Agricultural Products"},
                                      {id: "6", name: "Animal Products"}]}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <DropDown label="Special Load"
                                  onchange={(value) => this.handleSpecialLoadChange(value)}
                                  value={this.state.specialLoad}
                                  options={[{id: "1", name: "Frigo"},
                                      {id: "2", name: "Crane Loading"},
                                      {id: "3", name: "Out of Gauge"},
                                      {id: "4", name: "Heavy Load"},
                                      {id: "5", name: "Long Goods"}]}/>
                    </GridCell>

                </Grid>
            </Modal>
        );
    }
}