import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, CardHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, DropDownButton, Checkbox, CheckboxGroup, Span} from 'susam-components/basic';

import {KartoteksService} from '../../../services/KartoteksService';
import {PhoneNumberUtils} from '../../../utils/PhoneNumberUtils';

export class GooglePlacesSearch extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.setState({query: this.props.query, matchedPlaceId: this.props.matchedPlaceId});
        //this.searchGooglePlaces(this.props.query);

    }
    componentWillReceiveProps(nextProps){
        this.setState({query: nextProps.query, matchedPlaceId: nextProps.matchedPlaceId});
    }
    searchGooglePlaces(query){
        if(!query){
            return;
        }
        this.setState({busy: true});
        KartoteksService.autoCompleteGooglePlaces(query).then(response => {
            if (response.data.status === 'OK') {
                this.setState({results: response.data.predictions, busy: false, selectedPlace: null});
                if (this.state.matchedPlaceId) {
                    response.data.predictions.forEach(item => {
                        if (item.place_id == this.state.matchedPlaceId) {
                            this.selectGooglePlaceResult(null, item);
                        }
                    });
                }
            } else if(response.data.status === 'ZERO_RESULTS'){
                this.setState({results: [], busy: false, selectedPlace: null});
            } else {
                Notify.showError('Google places lookup failed, Google returned status: ' + response.data.status);
                console.error(response.data.error_message);
            }
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        })
    }
    parsePhoneNumber(value){
        if(!value){
            return null;
        }
        let phoneParts = value.split(" ");
        if(phoneParts.length == 3){
            return {countryCode: phoneParts[0].substr(1), regionCode: phoneParts[1], phone: phoneParts[2]}
        }
        if(phoneParts.length > 3){
            return {countryCode: phoneParts[0].substr(1), regionCode: phoneParts[1], phone: _.slice(phoneParts, 2).join("")}
        }
        return null;
    }
    verifyGoogleResult(response){
        if(response.data.status === "OK") {
            if (response.data.results[0]) {

            }
        }
    }

    retrieveCountryIsoFromGoogleResult(result) {
        if(!result.address_components) return null;

        let country = null;
        result.address_components.forEach( a => {
            if(a.types && a.types[0] == "country") {
                country = {iso: a.short_name};
            }
        })

        return country;
    }

    retrievePostalCodeFromGoogleResult(result) {
        if(!result.address_components) return null;

        let postalCode = null;
        result.address_components.forEach( a => {
            if(a.types && a.types[0] == "postal_code") {
                postalCode = a.short_name;
            }
        });

        return postalCode;
    }

    selectGooglePlaceResult(e, item){
        e && e.preventDefault();
        this.setState({placeResultBusy: true});
        KartoteksService.getGooglePlaceDetails(item.place_id).then(placeResponse => {
            if (placeResponse.data.status != 'OK') {
                Notify.showError('Google places lookup failed, Google returned status: ' + placeResponse.data.status);
                console.error(placeResponse.data.error_message);
                return;
            }
            let result = placeResponse.data.result;
            let place = {};
            place.phoneNumber = this.parsePhoneNumber(result.international_phone_number);
            place.id = result.place_id;
            place.name = result.name;
            place.url = result.url;
            place.pointOnMap = result.geometry.location;
            place.address = result.formatted_address;
            place.country = this.retrieveCountryIsoFromGoogleResult(result);
            place.postalCode = this.retrievePostalCodeFromGoogleResult(result);

            this.setState({selectedPlace: place, placeResultBusy: false});
            this.setState({placeResultBusy: false}, this.props.handleSearchResultSelect(place.pointOnMap));

        }).catch(error => {
            Notify.showError(error);
            this.setState({placeResultBusy: false});
        });
    }
    handleUseSearchResult(){
       this.props.handleUseSearchResult(this.state.selectedPlace);
    }

    updateState(value){
        let state = _.cloneDeep(this.state);
        state.query = value;
        this.setState(state);
    }

    render(){
        let content = <GridCell width="1-1" noMargin = {true}><Loader size="M" title="Searching Google Places"/></GridCell>;
        if(!this.state.busy){
            let placesSearchResults = "";
            if(this.state.results){
                placesSearchResults = "No results found, try changing search text";
                if(this.state.results.length > 0) {
                    placesSearchResults = this.state.results.map(item => {
                        let selectedClassName = this.state.selectedPlace && this.state.selectedPlace.id == item.place_id ? "md-bg-light-blue-50" : "";
                        let matched = "";
                        if(item.place_id == this.state.matchedPlaceId){
                            matched = <span className="uk-align-right"><i className="uk-badge primary" style={{marginRight: "10px"}}>Matched</i></span>;
                        }
                        return <li key={item.id} className={selectedClassName}>
                            <div className="md-list-content">
                                <span className="md-list-heading">
                                    <a href="#" onClick={(e) => this.selectGooglePlaceResult(e, item)}>{item.structured_formatting.main_text}</a>
                                </span>
                                {matched}
                                <span className="uk-text-small uk-text-muted">{item.description}</span>
                            </div>
                        </li>;
                    });
                    placesSearchResults = <GridCell width="1-1" noMargin={true}>
                        <ul className="md-list">{placesSearchResults}</ul>
                    </GridCell>;
                }
            }
            let selectedGooglePlace = null;
            if(this.state.placeResultBusy){
                selectedGooglePlace = <Loader title="Fetching Google Place Details"/>
            }
            if(this.state.selectedPlace){
                selectedGooglePlace = <Grid>

                    <GridCell width="1-1" noMargin = {true}>
                        <Grid>
                            <GridCell width="1-2"><Span label="Address" value={this.state.selectedPlace.address}/></GridCell>
                            <GridCell width="1-4"><Span label="Phone Number" value={PhoneNumberUtils.format(this.state.selectedPlace.phoneNumber)}/></GridCell>
                            <GridCell width="1-4">
                                <Button label="Copy" waves = {true} style = "success" width="200px"
                                                onclick={() => {this.handleUseSearchResult()}}/>
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>;
            }

            content = <GridCell width="1-1">
                <Grid>
                    <GridCell width="2-5" noMargin = {true}>
                        <Grid>
                            <GridCell width="2-3">
                                <TextInput label="Place Search Text" value = {this.state.query} onchange = {(value) => this.updateState(value)}/>
                            </GridCell>
                            <GridCell width="1-3" verticalAlign="bottom">
                                <Button label="search" waves = {true} style = "success" onclick = {() => this.searchGooglePlaces(this.state.query)}/>
                            </GridCell>
                            <GridCell width="1-1">
                                {placesSearchResults}
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="3-5" noMargin = {true}>
                        {selectedGooglePlace}
                    </GridCell>
                </Grid>
            </GridCell>;
        }

        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <CardHeader title="Verify with Google"/>
                </GridCell>
                {content}
            </Grid>
        );
    }
}