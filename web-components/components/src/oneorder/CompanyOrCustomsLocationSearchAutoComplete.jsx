import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import uuid from 'uuid';
import { TranslatingComponent } from '../abstract';
import { DropDown, Notify } from '../basic';
import { Span } from "../basic/Span";
import { Grid, GridCell } from "../layout";
import { CompanySearchAutoComplete } from './CompanySearchAutoComplete';
import { RenderingComponent } from "./RenderingComponent";

export class CompanyOrCustomsLocationSearchAutoComplete extends TranslatingComponent {

    constructor(props) {
        super(props);
        var id = this.props.id ? this.props.id : uuid.v4();
        this.state = { id: id };
    }

    componentDidMount() {
        if(this.props.value && this.props.value.company){
           this.loadLocations(this.props.value.company, (locations) => {
                let value = _.clone(this.props.value);
                if (!value.location && locations && locations.length === 1 && !this.props.disableLocationAutoSelect) {
                    value.location = locations[0];
                    this.props.onChange(value)
                }
                this.setState({locations: locations})
            });
        }
    }

    componentWillReceiveProps(nextProps){
        let currentCompanyId = _.get(this.props, "value.company.id");
        let newCompanyId = _.get(nextProps, "value.company.id");
        if(currentCompanyId !== newCompanyId && _.has(nextProps, 'value.company.id')){
            this.loadLocations(nextProps.value.company, (locations) => {
                let value = _.clone(nextProps.value);
                if (!value.location && locations && locations.length === 1 && !this.props.disableLocationAutoSelect) {
                    value.location = locations[0];
                    this.props.onChange(value)
                }
                this.setState({locations: locations})
            });
        }
    }

    loadLocations(company, onSuccess) {
        let call = val => axios.get(`/kartoteks-service/company/${val}/locations`)
        if ("CUSTOMS" === company.type) {
            call = val => axios.get(`/location-service/location/customs-office/${val}/locations`)
        }
        call(company.id).then(response => {
            onSuccess(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleCompanyOnChange(company) {
        this.loadLocations(company, (data) => {
            let locations = data;
            let value = { company: company, location: null };
            if (locations && locations.length === 1 && !this.props.disableLocationAutoSelect) {
                value.location = locations[0];
            }
            this.setState({ locations: locations }, () => this.props.onChange(value));
        })
    }

    handleLocationOnChange(item) {
        if (this.props.onChange) {
            let value = _.cloneDeep(this.props.value);
            value.location = item;
            this.props.onChange(value);
        }
    }

    handleCompanyOnClear() {
        this.props.onChange && this.props.onChange({ company: null, location: null });
    }

    renderRegistrationCompanyLocationSelectionDropdown() {
        if (!this.props || !this.props.value) {
            return null;
        }

        return (
            <DropDown label={this.props.locationLabel}
                uninitializedText="Please select company"
                options={this.state.locations}
                value={this.props.value ? this.props.value.location : null}
                onchange={(data) => this.handleLocationOnChange(data)}
                hideLabel={this.props.hideLabel}
                required={this.props.required} />
        );
    }

    renderReadOnly() {
        let width = "1-1";
        if (this.props.inline) {
            width = "1-2";
        }

        return (
            <div>
                <Grid>
                    <GridCell width={width}>
                        <Span label={this.props.companyLabel} value={this.props.value && this.props.value.company ? this.props.value.company.name : ""} />
                    </GridCell>
                </Grid>
                <Grid>
                    <GridCell width={width}>
                        <Span label={this.props.locationLabel} value={this.props.value && this.props.value.location ? this.props.value.location.name : ""} />
                    </GridCell>
                </Grid>
            </div>
        );
    }

    renderStandard() {
        let width = "1-1";
        if (this.props.inline) {
            width = "1-2";
        }
        return (
            <Grid>
                <GridCell width={width}>
                    <CompanySearchAutoComplete id={this.state.id} label={this.props.companyLabel}
                        value={this.props.value ? this.props.value.company : null}
                        sources={this.props.sources}
                        readOnly={this.props.readOnly}
                        onchange={(item) => this.handleCompanyOnChange(item)}
                        onclear={() => this.handleCompanyOnClear()}
                        flipDropdown={this.props.flipDropdown}
                        hideLabel={this.props.hideLabel}
                        required={this.props.required} placeholder="Search for company..." />
                </GridCell>
                <GridCell width={width}>
                    {this.renderRegistrationCompanyLocationSelectionDropdown()}
                </GridCell>
            </Grid>
        );
    }

    render() {
        return RenderingComponent.render(this);
    }
}

CompanyOrCustomsLocationSearchAutoComplete.contextTypes = {
    translator: React.PropTypes.object
};