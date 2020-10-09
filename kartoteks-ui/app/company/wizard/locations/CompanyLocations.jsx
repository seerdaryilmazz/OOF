import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { ActionHeader, Card, Grid, GridCell, Loader } from "susam-components/layout";
import uuid from "uuid";
import { CompanyService } from '../../../services/KartoteksService';
import { CompanyLocation } from './CompanyLocation';
import * as Addresses from './config/';
import { LocationList } from './LocationList';

export class CompanyLocations extends TranslatingComponent {

    constructor(props){
        super(props);
        this.addressConfigs = Addresses.AddressConfig;
        this.state = {googlePlacesSearch: {}};
    }

    initializeState(props){

    }
    componentDidUpdate(prevProps, prevState){
        if(!_.isEqual(this.state.locationToEdit, prevState.locationToEdit)){
            this.props.onRenderInnerView && this.props.onRenderInnerView(!_.isNil(this.state.locationToEdit));
        }
    }

    componentDidMount(){
        this.initializeState(this.props);
    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
    }
    handleAddLocation(value){
        let locationToEdit = _.cloneDeep(value);
        locationToEdit._key = uuid.v4();
        this.setState({locationToEdit: locationToEdit,
            locationToRemoveFromMergeCompany: value,
            locationToRemoveFromEditCompany: null});
    }
    handleEditLocation(value){
        this.setState({locationToEdit: value,
            locationToRemoveFromMergeCompany: null,
            locationToRemoveFromEditCompany: null});
    }
    handleDeleteLocation(item){
        this.props.ondelete && this.props.ondelete(item);
    }
    validate(){
        if(this.state.locationToEdit) {
            Notify.showError("Please save the location you are editing");
            return false;
        }
        if(this.props.companyToMerge.companyLocations && this.props.companyToMerge.companyLocations.length > 0){
            Notify.showError("Please add or update all locations");
            return false;
        }
        if(!this.props.companyToEdit.companyLocations || this.props.companyToEdit.companyLocations.length == 0){
            Notify.showError("Please add at least one location");
            return false;
        }
        let duplicateNames = this.findDuplicateNames();
        if(duplicateNames.length > 0){
            duplicateNames.forEach(item => {
                Notify.showError("Location name " + item + " exists more than once");
            });
            return false;
        }
        return true;
    }
    findDuplicateNames(){
        let duplicateNames = [];
        _.forOwn(_.groupBy(this.props.companyToEdit.companyLocations, item => item.name),
            (value, key) => {
                if(value.length > 1){
                    duplicateNames.push(key);
                }
            }
        );
        return duplicateNames;
    }
    next(){
        return new Promise(
            (resolve, reject) => {
                if(!this.validate()){
                    reject();
                    return;
                }
                this.setState({busy: true});
                CompanyService.validateLocations(this.props.companyToEdit.companyLocations).then(response => {
                    this.setState({busy: false});
                    resolve(true);
                }).catch(error => {
                    Notify.showError(error);
                    this.setState({busy: false});
                    reject();
                });
            }
        );
    }
    updateState(key, value){
        let locationToEdit = _.cloneDeep(this.state.locationToEdit);
        _.set(locationToEdit, key, value);
        locationToEdit.postaladdress.formattedAddress = new FormattedAddressBuilder(locationToEdit.postaladdress).buildAddress();
        this.setState({locationToEdit: locationToEdit});
    }
    handleMergeLocation(locationToEdit, locationToMerge){
        let original = _.find(this.props.companyOriginal.companyLocations, {id: locationToEdit.id});
        this.setState({locationToEdit: locationToEdit,
            locationToMerge: locationToMerge,
            locationToRemoveFromMergeCompany: null,
            locationToRemoveFromEditCompany: locationToMerge,
            locationOriginal: original});
    }
    handleMergeQueueLocation(locationToEdit, locationToMerge){
        let original = _.find(this.props.companyOriginal.companyLocations, {id: locationToEdit.id});
        this.setState({locationToEdit: locationToEdit,
            locationToMerge: locationToMerge,
            locationToRemoveFromMergeCompany: locationToMerge,
            locationToRemoveFromEditCompany: null,
            locationOriginal: original});
    }
    handleSave(location){
        this.props.onsave && this.props.onsave(location,
            this.state.locationToRemoveFromMergeCompany, this.state.locationToRemoveFromEditCompany);
        this.clearStateLocations();
    }

    clearStateLocations(){
        this.setState({locationToEdit: null, locationToMerge: null,
            locationToRemoveFromMergeCompany: null, locationToRemoveFromEditCompany: null,
            locationOriginal: null});
    }

    handleCancel(){
        this.clearStateLocations();
    }

    emptyLocation(){
        return {
            phoneNumbers:[], postaladdress:{}
        }
    }
    createNewLocation(){
        let location = this.emptyLocation();
        location._key = uuid.v4();
        location.active = true;
        location.default = !(this.props.companyToEdit.companyLocations && this.props.companyToEdit.companyLocations.length > 0);
        location.postaladdress.country = this.props.companyToEdit.country;
        location.company = this.props.companyToEdit;
        return location;
    }
    handleNewLocationClick(){
        this.setState({locationToEdit: this.createNewLocation()});
    }

    renderCompanyWebsite(){
        let companyWebsite = null;
        let absoluteWebsiteUrl = this.props.companyToEdit.website;
        if(absoluteWebsiteUrl){
            if(absoluteWebsiteUrl.length > 4 && absoluteWebsiteUrl.substr(0,4) != "http"){
                absoluteWebsiteUrl = "http://" + absoluteWebsiteUrl;
            }
            companyWebsite = <a className="md-btn md-btn-flat md-btn-flat-success md-btn-wave waves-effect waves-button"
                                style = {{textTransform: 'lowercase'}}
                                href = {absoluteWebsiteUrl} target="_blank">
                {this.props.companyToEdit.website}
            </a>;
        }
        return companyWebsite;
    }

    renderLocationForm(){
        if(this.state.busy){
            return <Loader title="Validating"/>;
        }else{
            let otherLocationNames =
                _.filter(this.props.companyToEdit.companyLocations, location => location._key != this.state.locationToEdit._key)
                    .map(item => item.shortName).join(",");
            return <CompanyLocation location = {this.state.locationToEdit}
                                    companyShortName = {this.props.companyToEdit.shortName}
                                    locationToMerge = {this.state.locationToMerge}
                                    locationOriginal = {this.state.locationOriginal}
                                    otherLocationNames = {otherLocationNames}
                                    mode = {this.props.mode}
                                    showUpdateList = {this.state.locationToMerge != null}
                                    ref = {(c) => this.form = c}
                                    onsave = {(location) => this.handleSave(location)}
                                    oncancel = {() => this.handleCancel()}/>;
        }
    }

    getActionHeaderTools() {
        let actionHeaderTools = [];
        
            actionHeaderTools.push({title: "New Location",  buttonStyle:{height: 400},items: [{label: "", onclick: () => this.handleNewLocationClick()}]} );
        
        return actionHeaderTools;
    }

    render(){
        let locationForm = null;
        let existingLocationsList = null;
        let newLocationsList = null;
        let updatedLocationsList = null;
        
        if(this.state.locationToEdit){
            locationForm = this.renderLocationForm();
        }else{          
         let existingLocations = this.props.companyToEdit.companyLocations;
            let newLocations = _.filter(this.props.companyToMerge.companyLocations, {_new: true});
            let updatedLocations = _.filter(this.props.companyToMerge.companyLocations, {_updated: true});
            if(existingLocations) {
                existingLocationsList = 
                <GridCell width="1-1" margin="small">
                     <ActionHeader title="Locations" tools={this.getActionHeaderTools()} removeTopMargin={true} /> 
                     <LocationList locations={existingLocations}
                                                      showEditButton={true}
                                                      onedit={(data) => this.handleEditLocation(data)}
                                                      showDeleteButton={true}
                                                      ondelete={(data) => this.handleDeleteLocation(data)}
                                                      mergeOptions = {existingLocations}
                                                      showMergeButton = {existingLocations.length > 1}
                                                      onmerge = {(locationToEdit, locationToMerge) => this.handleMergeLocation(locationToEdit, locationToMerge)}/>
                </GridCell>;
                   
            }
            if(newLocations && newLocations.length > 0){
                newLocationsList = <LocationList title="New Locations" locations = {newLocations}
                                             mergeOptions = {existingLocations}
                                             showMergeButton = {existingLocations.length > 0}
                                             onmerge = {(locationToEdit, locationToMerge) => this.handleMergeQueueLocation(locationToEdit, locationToMerge)}
                                             showAddButton = {true}
                                             onadd = {(data) => this.handleAddLocation(data)}/>;
            }

            if(updatedLocations && updatedLocations.length > 0) {
                updatedLocationsList = <LocationList title="Updated Locations" locations={updatedLocations}
                                                     mergeOptions = {existingLocations}
                                                     showReviewButton={true}
                                                     onreview = {(locationToEdit, locationToMerge) => this.handleMergeQueueLocation(locationToEdit, locationToMerge)} />;
            }
        }

        return (
            <Card style={{backgroundColor:"white"}}>
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        {locationForm}
                    </GridCell>
                    <GridCell width="1-1" margin="small">
                        {newLocationsList}
                    </GridCell>
                    <GridCell width="1-1" margin="small">
                        {updatedLocationsList}
                    </GridCell>
                    <GridCell>
                        {existingLocationsList}
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}