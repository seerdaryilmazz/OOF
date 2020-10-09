import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import { Grid, GridCell} from "susam-components/layout";
import {Notify, Button, DropDown, Span} from 'susam-components/basic';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {Kartoteks} from "../services";
import {BaseTemplateValidator} from "./validators/BaseTemplateValidator";


export class SenderTemplateSenderLocations extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {senderLocations: {}, senderLocation:{}};
    }

    convertLocationsWithPostalCodes(item){
        return {
            id: item.id,
            name: item.name + " - " + item.postaladdress.country.iso + item.postaladdress.postalCode
        }
    }

    handleSelectLoadingCompany(value){
        Kartoteks.getCompanyLocations(value.id).then(response => {
            let locationsWithPostalCode = response.data.map(item => this.convertLocationsWithPostalCodes(item));
            this.setState({loadingLocations: locationsWithPostalCode, senderLocation: { loadingCompany: value }});
        }).catch(error => {
            Notify.showError(error);
        });
    }


    handleSetSenderAsLoadingCompany(){
        if(this.props.template.sender && this.props.template.sender.id){
            this.handleSelectLoadingCompany(this.props.template.sender);
        }
    }


    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }


    updateLoadingLocation(value){
        let state = _.cloneDeep(this.state);
        state["senderLocation"]["loadingLocation"] = value;
        this.setState(state);
    }


    handleDeleteClick(senderLocation){
        Notify.confirm("Are you sure?", () => {
            let template = _.cloneDeep(this.props.template);
            _.remove(template.senderLocations, item => item._key === senderLocation._key);
            this.props.onChange && this.props.onChange(template.senderLocations);
        });
    }



    handleAddClick(){
        let result = BaseTemplateValidator.validateSenderLocation(this.state.senderLocation);


        if(!result && this.props.template.senderLocations) {
            this.props.template.senderLocations.find(senderLocation => {
                if (senderLocation.loadingCompany.id === this.state.senderLocation.loadingCompany.id
                    & senderLocation.loadingLocation.id === this.state.senderLocation.loadingLocation.id) {
                    result = "Company and location are already selected";
                    return;
                }
            })
        }

        if(result){
            Notify.showError(result);
        }else {

            let template = _.cloneDeep(this.props.template);
            if (!template.senderLocations) {
                template.senderLocations = [];
            }
            let senderLocation = {
                _key: uuid.v4(),
                loadingCompany: this.state.senderLocation.loadingCompany,
                loadingLocation: this.state.senderLocation.loadingLocation
            };

            template.senderLocations.push(senderLocation);
            this.setState({senderLocation: {}});
            this.setState({senderLocations: template.senderLocations});
            this.props.onChange && this.props.onChange(template.senderLocations);
        }
    }

    handleCustomLocation(isCustomLocation) {
        this.updateState("isCustomLocation", isCustomLocation);
        let template = _.cloneDeep(this.props.template);
        template.senderLocations = isCustomLocation ? null : [];
        this.props.onChange && this.props.onChange(template.senderLocations);
    }

    renderSenderLocations(senderLocation){
        return (
            <li key = {senderLocation._key} className = {false ? "md-bg-blue-50" : ""}>
                <Grid>
                    <GridCell width = "4-5">
                        <div className="md-list-content">
                            <div className="md-list-heading">{senderLocation.loadingCompany.name} / {senderLocation.loadingLocation.name}
                            </div>
                        </div>
                    </GridCell>
                    <GridCell width = "1-5">
                        <Button label = "delete" flat = {true} size = "small" style = "danger"
                                onclick = {() => this.handleDeleteClick(senderLocation)} />
                    </GridCell>
                </Grid>
            </li>
        );
    }

    renderLocations(){
        let list = <div>{super.translate("There are no sender locations")}</div>;
        if(this.props.template.senderLocations && this.props.template.senderLocations.length >0 ) {
            list = <ul className = "md-list">
                {this.props.template.senderLocations.map(item => this.renderSenderLocations(item))}
            </ul>;
        }

        if(this.state.isCustomLocation || (this.props.template.senderLocations != null && this.props.template.senderLocations.length > 0 )){
            return(
                <Grid>

                    <GridCell width = "1-3">
                        <CompanySearchAutoComplete label = "Loading Company" value = {this.state.senderLocation.loadingCompany}
                                                   required = {true}
                                                   onchange = {(value) => this.handleSelectLoadingCompany(value)} />
                    </GridCell>
                    <GridCell width = "1-6">
                        <div className = "uk-margin-top">
                            <Button label="Use Sender" flat = {true} size = "small" style = "success"
                                    onclick = {() => this.handleSetSenderAsLoadingCompany()} />
                        </div>
                    </GridCell>

                    <GridCell width = "1-3">
                        <DropDown label = "Loading Location" options = {this.state.loadingLocations}
                                  emptyText = "No locations..." uninitializedText = "Loading Location"
                                  value = {this.state.senderLocation.loadingLocation} required = {true}
                                  onchange = {(value) => this.updateLoadingLocation(value)} />
                    </GridCell>

                    <GridCell width="1-10">
                        <div className = "uk-margin-top">
                            <Button label="add" size="small" style="success" waves = {true} onclick = {() => this.handleAddClick()}/>
                        </div>
                    </GridCell>

                    <GridCell width="1-1">
                        {list}
                    </GridCell>
                </Grid>
            );
        }

        return(
            <Grid>
                <GridCell width = "1-6">
                    <Span className="uk-text-large" value = "ALL LOCATIONS" />
                </GridCell>
                <GridCell width = "2-6">
                    <div className = "uk-margin-top">
                        <Button label="Define Specific Locations" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleCustomLocation(true)} />
                    </div>
                </GridCell>
            </Grid>
        );
    }

    render(){

        var allLocations;
        if(this.state.isCustomLocation ||
            (this.props.template.senderLocations && this.props.template.senderLocations.length > 0) ){
            allLocations =
            <GridCell width = "2-6">
                <div>
                    <Button label="All Locations" flat = {true} size = "small" style = "success"
                            onclick = {() => this.handleCustomLocation(false)} />
                </div>
            </GridCell>;
        }

        return (
            <Grid>
                <GridCell width="1-6">
                    <span className="uk-text-large uk-text-bold uk-text-primary">
                        {super.translate("Loading Locations")}
                    </span>
                </GridCell>

                {allLocations}

                <GridCell>


                    {this.renderLocations()}
                </GridCell>


            </Grid>
        );
    }
}