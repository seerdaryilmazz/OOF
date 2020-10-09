import * as axios from 'axios';
import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { ActionHeader, Card, Grid, GridCell, Loader } from "susam-components/layout";
import uuid from "uuid";
import { CompanyService, LookupService } from '../../../services/KartoteksService';
import { CompanyContact } from './CompanyContact';
import { ContactList } from './ContactList';

export class CompanyContacts extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {};
    }

    initializeState(props){

    }

    initializeLookups(){
        axios.all([
            LookupService.getBusinessSegmentTypes(),
            LookupService.getGenders(),
            LookupService.getContactDepartments(),
            LookupService.getContactTitles(),
            LookupService.getPhoneTypeList(),
            LookupService.getUsageTypeList()
        ]).then(axios.spread((segmentTypes, genders, departments, titles, phoneTypes, usageTypes) => {
            let state = _.cloneDeep(this.state);
            state.lookups = {};
            state.lookups.segmentTypes = segmentTypes.data;
            state.lookups.genders = genders.data;
            state.lookups.departments = departments.data;
            state.lookups.titles = titles.data;
            state.lookups.phoneTypes = phoneTypes.data;
            state.lookups.usageTypes = usageTypes.data;
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
        })
    }
    
    componentDidUpdate(prevProps, prevState){
        if(!_.isEqual(this.state.contactToEdit, prevState.contactToEdit)){
            this.props.onRenderInnerView && this.props.onRenderInnerView(!_.isNil(this.state.contactToEdit));
        }
    }

    componentDidMount(){
        this.initializeState(this.props);
        this.initializeLookups();
    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
    }
    handleAddContact(value){
        let contactToEdit = _.cloneDeep(value);
        contactToEdit._key = uuid.v4();
        this.setState({contactToEdit: contactToEdit, contactToRemove: value});
    }
    handleEditContact(value){
        this.setState({contactToEdit: value});
    }
    handleDeleteContact(item){
        this.props.ondelete && this.props.ondelete(item);
    }
    handleIgnoreContact(item){
        this.props.onignore && this.props.onignore(item);
    }

    handleMergeContact(contactToEdit, contactToMerge){
        let original = _.find(this.props.companyOriginal.companyContacts, {id: contactToEdit.id});
        this.setState({contactToEdit: contactToEdit, contactToMerge: contactToMerge, contactToRemove: contactToMerge, contactOriginal: original});
    }

    createNewContact(){
        return {
            _key: uuid.v4(),
            active: true,
            company: this.props.companyToEdit,
            emails:[],
            phoneNumbers:[]
        }
    }
    handleNewContactClick(){
        this.setState({contactToEdit: this.createNewContact()});
    }

    validate(){
        if(this.state.contactToEdit) {
            Notify.showError("Please save the contact you are editing");
            return false;
        }
        if(this.props.companyToMerge.companyContacts && this.props.companyToMerge.companyContacts.length > 0){
            Notify.showError("Please add or update all contacts");
            return false;
        }
        return true;
    }

    next(){
        return new Promise(
            (resolve, reject) => {
                if(!this.validate()){
                    reject();
                    return;
                }
                this.setState({busy: true});
                CompanyService.validateContacts(this.props.companyToEdit.companyContacts).then(response => {
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
        let contactToEdit = _.cloneDeep(this.state.contactToEdit);
        _.set(contactToEdit, key, value);
        this.setState({contactToEdit: contactToEdit});
    }

    handleSave(contact){
        this.props.onsave && this.props.onsave(contact, this.state.contactToRemove);
        this.clearStateContacts();
    }

    clearStateContacts(){
        this.setState({contactToEdit: null, contactToMerge: null, contactToRemove: null, contactOriginal: null});
    }

    handleCancel(){
        this.setState({contactToEdit: null});
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
    renderContactForm(){
        if(this.state.busy){
            return <Loader title="Validating"/>;
        }else{
            return <CompanyContact contact = {this.state.contactToEdit}
                                   contactToMerge = {this.state.contactToMerge}
                                   contactOriginal = {this.state.contactOriginal}
                                   showUpdateList = {this.state.contactToMerge != null}
                                   ref = {(c) => this.form = c}
                                   country = {this.props.companyToEdit.country}
                                   locations = {this.props.companyToEdit.companyLocations}
                                   lookups = {this.state.lookups}
                                   onsave = {(contact) => this.handleSave(contact)}
                                   oncancel = {() => this.handleCancel()}/>;
        }
    }

    getActionHeaderTools() {
        let actionHeaderTools = [];
        
            actionHeaderTools.push({title: "New Contact", items: [{label: "", onclick: () => this.handleNewContactClick()}]} );
        
        return actionHeaderTools;
    }

    render(){
        let contactForm = null;
        let existingContactsList = [];
        let newContactsList = [];
        let updatedContactsList = [];
     

        if(this.state.contactToEdit){
            contactForm = this.renderContactForm();
        }else{
           
            let existingContacts = this.props.companyToEdit.companyContacts;
            let newContacts = _.filter(this.props.companyToMerge.companyContacts, {_new: true});
            let updatedContacts = _.filter(this.props.companyToMerge.companyContacts, {_updated: true});

            if(existingContacts ) {
               
                existingContactsList = 
                    <GridCell width="1-1" margin="small">
                        <ActionHeader title="Contacts" tools={this.getActionHeaderTools()} removeTopMargin={true} /> 
                    <ContactList contacts={existingContacts}
                                                    showEditButton={true}
                                                    onedit={(data) => this.handleEditContact(data)}
                                                    showDeleteButton={true}
                                                    ondelete={(data) => this.handleDeleteContact(data)}
                                                    mergeOptions = {existingContacts}
                                                    showMergeButton = {existingContacts.length > 1}
                                                    onmerge = {(contactToEdit, contactToMerge) => this.handleMergeContact(contactToEdit, contactToMerge)}/>
                    </GridCell>
                         
            }

            if(newContacts && newContacts.length > 0) {
                newContactsList = <ContactList title="New Contacts" contacts = {newContacts}
                                               mergeOptions = {existingContacts}
                                               showMergeButton = {existingContacts.length > 0}
                                               onmerge = {(contactToEdit, contactToMerge) => this.handleMergeContact(contactToEdit, contactToMerge)}
                                               showAddButton = {true}
                                               onadd = {(data) => this.handleAddContact(data)}
                                               showIgnoreButton = {true}
                                               onignore = {(data) => this.handleIgnoreContact(data)}/>;
            }

            if(updatedContacts && updatedContacts.length > 0) {
                updatedContactsList = <ContactList title="Updated Contacts" contacts={updatedContacts}
                                                 mergeOptions = {existingContacts}
                                                 showReviewButton={true}
                                                 onreview = {(contactToEdit, contactToMerge) => this.handleMergeContact(contactToEdit, contactToMerge)}/>;
            }
        }

        return (
            <Card style={{backgroundColor:"white"}}>
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        {contactForm}
                    </GridCell>
                    <GridCell width="1-1" margin="small">
                        {newContactsList}
                    </GridCell>
                    <GridCell width="1-1" margin="small">
                        {updatedContactsList}
                    </GridCell>
                    <GridCell >  
                        {existingContactsList}
                    </GridCell>
                    
                </Grid>
            </Card>

        );
    }
}