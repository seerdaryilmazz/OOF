import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, Button, Span} from 'susam-components/basic';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {withAuthorization} from '../security';

import {CompanyService} from '../services/KartoteksService';

const SecuredGrid = withAuthorization(Grid, "kartoteks.company.move-location");

export class MoveLocation extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    initialize(props){
        this.setState({busy: true});
        CompanyService.getCompany(props.params.companyId).then(response => {
            let company = response.data;

            this.setState({sourceCompany: company, busy: false});
        }).catch(error => {
            Notify.showError(error);
            this.setState({busy: false});
        });
    }
    fetchCompanyAndUpdateState(key, value){
        CompanyService.getCompany(value.id).then(response => {
            let company = response.data;
            this.updateState(key, company);
        }).catch(error => {
            Notify.showError(error);
        });
    }
    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    componentDidMount(){
        this.initialize(this.props);
    }
    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }

    validate(){
        if(!this.state.sourceLocation){
            Notify.showError("Please select location to move");
            return false;
        }
        if(!this.state.destinationCompany){
            Notify.showError("Please select company to move");
            return false;
        }
        return true;
    }

    handleSave(){
        if(!this.validate()){
            return;
        }
        CompanyService.moveLocationToCompany(this.state.sourceLocation, this.state.destinationCompany).then(response => {
            Notify.showSuccess("Location moved successfully");
            this.fetchCompanyAndUpdateState("sourceCompany", this.state.sourceCompany);
            this.fetchCompanyAndUpdateState("destinationCompany", this.state.destinationCompany);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    renderSourceLocationItem(location){
        let selectedClassName = this.state.sourceLocation && this.state.sourceLocation.id == location.id ? "md-bg-light-blue-50" : "";
        return(
            <li key = {location.id} className={selectedClassName} style = {{cursor: 'pointer'}} onClick = {(e) => this.updateState("sourceLocation", location)}>
                <div className="md-list-content">
                    <div className="md-list-heading">
                        {location.name}
                    </div>
                    <div className="uk-text-small uk-text-muted">{location.postaladdress ? location.postaladdress.formattedAddress : ""}</div>
                </div>
            </li>
        );
    }

    renderDestinationLocationItem(location){
        return(
            <li key = {location.id}>
                <div className="md-list-content">
                    <div className="md-list-heading">
                        {location.name}
                    </div>
                    <div className="uk-text-small uk-text-muted">{location.postaladdress ? location.postaladdress.formattedAddress : ""}</div>
                </div>
            </li>
        );
    }

    renderSourceLocations(company){
        let locations = "Please select company";
        if(company){
            locations = company.companyLocations.map(item => {
                return this.renderSourceLocationItem(item);
            });
            locations = <ul>{locations}</ul>;
        }
        return locations;
    }

    renderDestinationLocations(company){
        let locations = "Please select company";
        if(company){
            locations = company.companyLocations.map(item => {
                return this.renderDestinationLocationItem(item);
            });
            locations = <ul>{locations}</ul>;
        }
        return locations;
    }

    render(){
        if(this.state.busy){
            return <Loader title="Fetching Company"/>;
        }
        let sourceLocations = this.renderSourceLocations(this.state.sourceCompany);
        let destinationLocations = this.renderDestinationLocations(this.state.destinationCompany);

        return (
            <div>
                <PageHeader title="Move Location"/>

                    <SecuredGrid>
                        <GridCell width="1-1" noMargin = {true}>
                            <Card>
                                <Grid>
                                    <GridCell width="1-2" noMargin = {true}>
                                        <Grid>
                                            <GridCell width="1-1">
                                                <CardHeader title="From Company"/>
                                            </GridCell>
                                            <GridCell width="1-1">
                                                <CompanySearchAutoComplete value = {this.state.sourceCompany} required = {true}
                                                                           onchange = {(value) => this.fetchCompanyAndUpdateState("sourceCompany", value)} />
                                            </GridCell>
                                            <GridCell width="1-1">
                                                <ul className="md-list md-list-centered">
                                                    {sourceLocations}
                                                </ul>
                                            </GridCell>
                                            <GridCell width="1-1">
                                                <div className="uk-align-right">
                                                    <Button label="Move" style="primary" onclick = {() => this.handleSave()} />
                                                </div>
                                            </GridCell>
                                        </Grid>
                                    </GridCell>
                                    <GridCell width="1-2" noMargin = {true}>
                                        <Grid>
                                            <GridCell width="1-1">
                                                <CardHeader title="To Company"/>
                                            </GridCell>
                                            <GridCell width="1-1">
                                                <CompanySearchAutoComplete value = {this.state.destinationCompany} required = {true}
                                                                           onchange = {(value) => this.fetchCompanyAndUpdateState("destinationCompany", value)}/>
                                            </GridCell>
                                            <GridCell width="1-1">
                                                <ul className="md-list md-list-centered">
                                                    {destinationLocations}
                                                </ul>
                                            </GridCell>
                                        </Grid>
                                    </GridCell>
                                </Grid>
                            </Card>
                        </GridCell>
                    </SecuredGrid>
            </div>
        );
    }
}