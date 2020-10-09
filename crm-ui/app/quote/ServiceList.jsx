import * as axios from 'axios';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip } from "susam-components/advanced";
import { Form, ReadOnlyDropDown } from 'susam-components/basic';
import { Card, CardHeader, Grid, GridCell } from 'susam-components/layout';
import { LookupService } from '../services';
import { withReadOnly } from "../utils";

export class ServiceList extends TranslatingComponent {

    static defaultProps = {
        services: []
    };

    state = {
        mainServices: [],
        extraServices: []
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.loadServiceTypes();
    }

    loadServiceTypes(subsidiary = this.props.quote.subsidiary, serviceArea = this.props.serviceArea, ) {
        if (!subsidiary) {
            return null;
        }
        axios.all([
            LookupService.getServiceTypes(serviceArea.code, "MAIN"),
            LookupService.getExtraServiceTypes(serviceArea.code, subsidiary.id)
        ]).then(axios.spread((mainType, extraType) => {
            this.setState({
                mainServices: mainType.data,
                extraServices: extraType.data
            }, ()=>this.seperateServiceTypes());
        }))
    }

    getExtraServices(subsidiary = this.props.quote.subsidiary, serviceArea = this.props.serviceArea) {
        if (!subsidiary) {
            return
        }
        LookupService.getExtraServiceTypes(serviceArea.code, subsidiary.id).then(response => {
            this.setState({ extraServices: response.data })
        });
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.services, nextProps.services)) {
            this.seperateServiceTypes(nextProps.services);
        }

        if (!_.isEqual(_.get(this.props.quote, "subsidiary"), _.get(nextProps.quote, "subsidiary"))) {
            this.loadServiceTypes(_.get(nextProps.quote, "subsidiary"), nextProps.serviceArea)
        }

    }

    adjustServiceTypes(currentServices = this.props.services) {
        let current = {};
        if (currentServices) {
            current.mainServiceType = _.get(_.find(currentServices, { type: { category: 'MAIN' } }), 'type');
            current.extraServiceTypes = _.filter(currentServices, { type: { category: 'EXTRA' } }).map(item => item.type);
        }
        return current;
    }

    seperateServiceTypes(currentServices = this.props.services) {
        let current = this.adjustServiceTypes(currentServices);
        this.setState(prevState => {
            prevState.currentMainServiceType = current.mainServiceType;
            prevState.currentExtraServiceTypes = current.extraServiceTypes;
            return prevState;
        });
    }
    updateState(key, value) {
        this.setState(prevState=>{
            prevState[key] = value;
            return prevState;
        }, () => this.aggregateServiceTypes());
    }

    aggregateServiceTypes() {
        let services = [];
        if (this.state.currentMainServiceType) {
            let service;
            if (this.props.services) {
                service = _.find(this.props.services, { type: { code: this.state.currentMainServiceType.code } });
            }
            services.push(service ? service : { type: this.state.currentMainServiceType });
        }
        if (this.state.currentExtraServiceTypes) {
            this.state.currentExtraServiceTypes.forEach(currentExtraService => {
                let service;
                if (this.props.services) {
                    service = _.find(this.props.services, { type: { code: currentExtraService.code } });
                }
                services.push(service ? service : { type: currentExtraService });
            });
        }
        this.handleAddOrRemove(services);
    }

    handleAddOrRemove(services) {
        this.props.onAddOrRemove && this.props.onAddOrRemove(services);
    }

    validate() {
        return this.form.validate();
    }

    renderMainServiceTypes() {
        if (_.isEmpty(this.state.mainServices)) {
            return null;
        }
        return (
            <ReadOnlyDropDown options={this.state.mainServices} label="Service Type" translate={true}
                value={this.state.currentMainServiceType} required={true} readOnly={this.props.readOnly}
                onchange={(service) => { service ? this.updateState("currentMainServiceType", service) : null }} />
        );
    }


    renderExtraServiceTypes() {
        if (_.isEmpty(this.state.extraServices)) {
            return null;
        }
        return (
            <ReadOnlyChip options={this.state.extraServices} label="Extra Services" translate={true}
                value={this.state.currentExtraServiceTypes} readOnly={this.props.readOnly} hideSelectAll={true}
                onchange={(service) => { this.updateState("currentExtraServiceTypes", service) }} />
        );
    }

    render() {
        return (
            <Form ref={c => this.form = c}>
                <Card>
                    <CardHeader title="Service Details" />
                    <Grid>
                        <GridCell width="1-3">
                            {this.renderMainServiceTypes()}
                        </GridCell>
                        <GridCell width="2-3">
                            {this.renderExtraServiceTypes()}
                        </GridCell>
                    </Grid>
                </Card>
            </Form>
        );
    }
}

const ReadOnlyChip = withReadOnly(Chip);

