import React from 'react';
import {Grid, GridCell} from "../layout";
import {AutoComplete} from '../advanced';
import {Notify, DropDown} from '../basic';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';
import {RenderingComponent} from "./RenderingComponent";
import {Span} from "../basic/Span";

export class CompanyLocationSearchAutoComplete extends React.Component {
    constructor(props) {
        super(props);
        var id = this.props.id ? this.props.id : uuid.v4();
        this.state = {id: id};
    }

    componentDidMount() {
        if(this.props.value && this.props.value.company){
            this.loadLocations(this.props.value.company.id, (data) => this.setState({locations: data}));
        }
    }

    componentWillReceiveProps(nextProps){
        let currentCompanyId = _.get(this.props, "value.company.id");
        let newCompanyId = _.get(nextProps, "value.company.id");
        if(currentCompanyId !== newCompanyId){
            this.loadLocations(newCompanyId, (data) => this.setState({locations: data}));
        }
    }
    handleCompanyOnChange(company) {
        this.loadLocations(company.id, (data) => {
            let locations = data;
            let value = {company: company, location: null};
            if (locations && locations.length === 1 && !this.props.disableLocationAutoSelect) {
                value.location = locations[0];
            }
            this.setState({locations: locations}, () => this.props.onChange(value));
        })
    }

    loadLocations(companyId, onSuccess) {
        axios.get('/kartoteks-service/company/' + companyId + '/locations').then(response => {
            onSuccess(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleCompanyOnClear() {
        this.props.onChange({company: null, location: null});
    }

    handleLocationOnChange(item) {
        let value = _.cloneDeep(this.props.value);
        value.location = item;
        this.props.onChange(value);
    }

    autocompleteCallback = (release, val) => {
        axios.get('/kartoteks-service/search?q=' + val).then(response => {
            release(response.data.content.map(company => {
                return {id: company.id, name: company.name, locations: company.locations}
            }))
        }).catch(error => {
            Notify.showError(error);
        });
    };

    renderRegistrationCompanyLocationSelectionDropdown() {
        if (!this.props || !this.props.value) {
            return null;
        }

        return (
            <DropDown label={this.props.locationLabel}
                      uninitializedText = "Please select company"
                      options={this.state.locations}
                      value={this.props.value ? this.props.value.location : null}
                      onchange={(data) => this.handleLocationOnChange(data)}
                      hideLabel={this.props.hideLabel}
                      required={this.props.required}/>
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
                        <Span label={this.props.companyLabel} value={this.props.value && this.props.value.company ? this.props.value.company.name : ""}/>
                    </GridCell>
                </Grid>
                <Grid>
                    <GridCell width={width}>
                        <Span label={this.props.locationLabel} value={this.props.value && this.props.value.location ? this.props.value.location.name : ""}/>
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
                    <AutoComplete id={this.state.id} label={this.props.companyLabel} valueField="id" labelField="name"
                                  readOnly={this.props.readOnly}
                                  onchange={(item) => this.handleCompanyOnChange(item)}
                                  onclear={() => this.handleCompanyOnClear()}
                                  callback={this.autocompleteCallback} value={this.props.value ? this.props.value.company : null}
                                  flipDropdown={this.props.flipDropdown}
                                  hideLabel={this.props.hideLabel}
                                  required={this.props.required} placeholder="Search for company..."
                                  ukIcon={this.props.ukIcon}
                                  iconColorClass={this.props.iconColorClass}/>
                </GridCell>
                <GridCell width={width}>
                    {this.renderRegistrationCompanyLocationSelectionDropdown()}
                </GridCell>
            </Grid>
        );
    }

    render() {
        return RenderingComponent.render(this);
    }
}