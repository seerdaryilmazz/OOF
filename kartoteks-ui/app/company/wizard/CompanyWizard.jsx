import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Checkbox } from 'susam-components/basic';
import { Grid, GridCell, Loader, Modal, Wizard } from "susam-components/layout";
import uuid from 'uuid';
import { QueueItemSaveSettings, wizardNextSetting } from '../../settings/QueueItemSaveSettings';
import { EmailUtils, PhoneNumberUtils, StringUtils } from '../../utils/';
import { CompanyContacts } from './contacts/CompanyContacts';
import { CompanyGeneral } from './general/CompanyGeneral';
import { CompanyLocations } from './locations/CompanyLocations';
import * as Addresses from './locations/config/';
import { CompanyRelations } from './relations/CompanyRelations';
import { CompanyRoles } from './roles/CompanyRoles';
import { CompanySectors } from './sectors/CompanySectors';




export class CompanyWizard extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.dontAskWizardNextStateSetting = {name: "dontAskWizardNextStateSetting"}
    }

    initializeState(props){
        let state = _.cloneDeep(this.state);
        if(props.companyToEdit){
            let companyToEdit = _.cloneDeep(props.companyToEdit);
            this.sanitizeLocations(companyToEdit);
            this.sanitizeContacts(companyToEdit);
            this.TrimTaxId(companyToEdit);
            companyToEdit.sectors && companyToEdit.sectors.forEach(item => item._key = item.id ? item.id : uuid.v4());
            companyToEdit.roles && companyToEdit.roles.forEach(item => item._key = item.id ? item.id : uuid.v4());
            companyToEdit.activeRelations && companyToEdit.activeRelations.forEach(item => {
                item._key = item.id ? item.id : uuid.v4();
                item.relationType.type = "HAS";
                item.relationType.uniqueId = '' + item.relationType.id;
            });
            companyToEdit.passiveRelations && companyToEdit.passiveRelations.forEach(item => {
                item._key = item.id ? item.id : uuid.v4();
                item.relationType.type = "IS";
                let name = item.relationType.name;
                item.relationType.name = item.relationType.altName;
                item.relationType.altName = name;
                item.relationType.uniqueId = '!' + item.relationType.id;
            });

            state.companyToEdit = companyToEdit;
            state.companyOriginal = _.cloneDeep(companyToEdit);
        }
        if(props.companyToMerge){
            let companyToMerge = _.cloneDeep(props.companyToMerge);
            this.sanitizeLocations(companyToMerge);
            this.sanitizeContacts(companyToMerge);
            this.TrimTaxId(companyToMerge);
            companyToMerge.sectors && companyToMerge.sectors.forEach(item => item._key = item.id ? item.id : uuid.v4());
            companyToMerge.roles && companyToMerge.roles.forEach(item => item._key = item.id ? item.id : uuid.v4());
            companyToMerge.activeRelations && companyToMerge.activeRelations.forEach(item => {item._key = item.id ? item.id : uuid.v4(); item.relationType.type = "HAS";});
            companyToMerge.passiveRelations && companyToMerge.passiveRelations.forEach(item => {item._key = item.id ? item.id : uuid.v4(); item.relationType.type = "IS";});
            state.companyToMerge = companyToMerge;
        }
        if(state.companyToMerge && state.companyToEdit && state.companyToMerge.mappedIds){
            state.companyToEdit.mergeWithCompanyId = state.companyToMerge.id;
            this.mergeCompanyMappedIds(state.companyToEdit, state.companyToMerge);
        }

        if(state.companyToMerge && state.companyToEdit && state.companyToMerge.sectors){
            if(!state.companyToEdit.sectors){
                state.companyToEdit.sectors = [];
            }
            state.companyToMerge.sectors.forEach(item => {
                let found = _.find(state.companyToEdit.sectors, {sector:{code: item.sector.code}});
                if(!found){
                    state.companyToEdit.sectors.push(item);
                }
            });
        }

        if(state.companyToMerge && state.companyToEdit && state.companyToMerge.roles){
            if(!state.companyToEdit.roles){
                state.companyToEdit.roles = [];
            }
            state.companyToMerge.roles.forEach(item => {
                let found = _.find(state.companyToEdit.roles, {roleType:{code: item.roleType.code}, segmentType: {code: item.segmentType.code}});
                if(!found){
                    state.companyToEdit.roles.push(item);
                }
            });
        }

        if(state.companyToMerge && state.companyToMerge.companyContacts){
            state.companyToMerge.companyContacts.forEach(item => {
                if(item.companyLocation){
                    item.companyLocation = _.find(state.companyToMerge.companyLocations, {
                        name: item.companyLocation.name
                    });
                }
            });
            if(state.companyToEdit && state.companyToEdit.companyContacts){
                state.companyToEdit.companyContacts.forEach(item => {
                    if(item.companyLocation) {
                        item.companyLocation = _.find(state.companyToEdit.companyLocations, {
                            name: item.companyLocation.name
                        });
                    }
                });
                this.findPossibleContactMatches(state.companyToMerge, state.companyToEdit)
            }
        }

        this.setState(state);
    }

    findPossibleContactMatches(companyToMerge, companyToEdit){
        companyToMerge.companyContacts.forEach(item => {
            item._canMergeWith = _.find(companyToEdit.companyContacts, {
                firstName: item.firstName,
                lastName: item.lastName
            });
        });
    }
    TrimTaxId(company){
        if(!_.isEmpty(company.taxId)){
            company.taxId=company.taxId.trim();
        }
    }

    sanitizeLocations(company){
        if(!company.companyLocations){
            company.companyLocations = [];
        }
        company.companyLocations = company.companyLocations.map(item => {
            let location = this.sanitizeLocation(item, company.country);
            location._key = location.id ? location.id : uuid.v4();
            return location;
        });
    }
    localizedSort(first, second){
        let fullname1 = (first.firstName ? first.firstName : "") + (first.lastname ? first.lastname : "");
        let fullname2 = (second.firstName ? second.firstName : "") + (second.lastname ? second.lastname : "");
        return fullname1.toUpperCase().localeCompare(fullname2.toUpperCase());
    }
    sanitizeContacts(company){
        if(!company.companyContacts){
            company.companyContacts = [];
        }
        company.companyContacts = company.companyContacts.map(item => {
            let contact = this.sanitizeContact(item, company.country);
            contact._key = uuid.v4();
            return contact;
        });
        company.companyContacts = company.companyContacts.sort((first, second) => this.localizedSort(first, second));

    }

    selectAddressConfig(countryCode){
        let addressConfig = Addresses.AddressConfig[countryCode];
        if(!addressConfig){
            addressConfig = Addresses.AddressConfig.DEFAULT;
        }
        return addressConfig;
    }
    sanitizeLocation(location, country){
        this.selectAddressConfig(country.iso).cleanUnusedFields(location.postaladdress);
        StringUtils.trimAndSet(location, "name");
        StringUtils.trimAndSet(location, "postaladdress.streetName");
        StringUtils.trimAndSet(location, "postaladdress.postalCode");
        StringUtils.trimAndSet(location, "postaladdress.city");
        let countryCode = country ? country.phoneCode : "";
        _.each(location.phoneNumbers,
            phoneNumber => {
                phoneNumber.phoneNumber = PhoneNumberUtils.sanitize(phoneNumber.phoneNumber);
                if(!phoneNumber.phoneNumber.countryCode){
                    phoneNumber.phoneNumber.countryCode = countryCode;
                }
                //some people reported that phone parameter is treated as a number, thus startsWith method fails.
                let phone = phoneNumber.phoneNumber.phone ? phoneNumber.phoneNumber.phone.toString() : "";
                if(phone && countryCode && _.startsWith(phone, ("00" + countryCode))){
                    phoneNumber.phoneNumber.phone = phone.replace("00" + countryCode, "");
                }
                PhoneNumberUtils.setIsValid(phoneNumber.phoneNumber);
            });
        return location;
    }
    sanitizeContact(contact, country){
        StringUtils.trimAndSet(contact, "firstName");
        StringUtils.trimAndSet(contact, "lastName");
        let countryCode = country ? country.phoneCode : "";
        _.each(contact.phoneNumbers,
            phoneNumber => {
                phoneNumber.phoneNumber = PhoneNumberUtils.sanitize(phoneNumber.phoneNumber);
                if(!phoneNumber.phoneNumber.countryCode){
                    phoneNumber.phoneNumber.countryCode = countryCode;
                }
                let phone = phoneNumber.phoneNumber.phone ? phoneNumber.phoneNumber.phone.toString() : "";
                if(phone && countryCode && _.startsWith(phone, ("00" + countryCode))){
                    phoneNumber.phoneNumber.phone = phone.replace("00" + countryCode, "");
                }
                PhoneNumberUtils.setIsValid(phoneNumber.phoneNumber);
            });
        _.each(contact.emails,
            email => {
                email.email = EmailUtils.sanitize(email.email);
                EmailUtils.setIsValid(email.email);
            });
        return contact;
    }

    componentDidMount(){
        this.initializeState(this.props);
    }

    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
    }

    mergeCompanyMappedIds(companyToEdit, companyToMerge){
        if(!companyToMerge){
            return;
        }
        companyToMerge.mappedIds.forEach(item => {
            let mappedId =_.find(companyToEdit.mappedIds, {application: {id: item.application.id}, applicationCompanyId: item.applicationCompanyId});
            if(!mappedId){
                if(!companyToEdit.mappedIds){
                    companyToEdit.mappedIds = [];
                }
                companyToEdit.mappedIds.push(item);
            }
        });
    }

    mergeLocationMappedIds(locationToEdit, locationToMerge){
        if(!locationToMerge){
            return;
        }
        locationToMerge.mappedIds.forEach(item => {
            let mappedId =_.find(locationToEdit.mappedIds, {application: {id: item.application.id}, applicationLocationId: item.applicationLocationId});
            if(!mappedId){
                locationToEdit.mappedIds.push(item);
            }
        });
    }

    mergeContactMappedIds(contactToEdit, contactToMerge){
        if(!contactToMerge){
            return;
        }
        contactToMerge.mappedIds.forEach(item => {
            let mappedId =_.find(contactToEdit.mappedIds, {application: {id: item.application.id}, applicationContactId: item.applicationContactId});
            if(!mappedId){
                contactToEdit.mappedIds.push(item);
            }
        });
    }

    handleCompanyGeneralChange(key, value){
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);
        companyToEdit[key] = value;
        this.setState({companyToEdit: companyToEdit});
    }
    handleCompanyCountryChange(value){
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);
        companyToEdit.country = value;
        companyToEdit.taxOffice = null;
        companyToEdit.taxOfficeCode = null;
        this.setState({companyToEdit: companyToEdit});
    }
    handleCompanyLogoUrlChange(value){
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);
        companyToEdit.newLogoUrl = value;
        companyToEdit.logoUrl = value;
        this.setState({companyToEdit: companyToEdit});
    }

    moveContactsToOtherLocation(contacts, locationToFind, locationToReplace){
        _.filter(contacts, {companyLocation: {_key: locationToFind._key}})
            .forEach(item => item.companyLocation = locationToReplace);
    }
    updateContactsLocation(contacts, location){
        _.filter(contacts, {companyLocation: {_key: location._key}})
            .forEach(item => item.companyLocation = location);
    }
    handleSaveCompanyLocation(locationToSave, locationToRemoveFromMergingCompany, locationToRemoveFromEditingCompany){
        let state = {};
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);
        let companyToMerge = _.cloneDeep(this.state.companyToMerge);

        if(locationToRemoveFromEditingCompany){
            this.mergeLocationMappedIds(locationToSave, locationToRemoveFromEditingCompany);
            _.remove(companyToEdit.companyLocations, {_key: locationToRemoveFromEditingCompany._key});
            this.moveContactsToOtherLocation(companyToEdit.companyContacts, locationToRemoveFromEditingCompany, locationToSave);
        }
        if(locationToRemoveFromMergingCompany){
            this.mergeLocationMappedIds(locationToSave, locationToRemoveFromMergingCompany);
            _.remove(companyToMerge.companyLocations, {_key: locationToRemoveFromMergingCompany._key});
            this.moveContactsToOtherLocation(companyToMerge.companyContacts, locationToRemoveFromMergingCompany, locationToSave);
        }
        if(locationToSave){
            this.updateContactsLocation(companyToEdit.companyContacts, locationToSave);
            this.updateContactsLocation(companyToMerge.companyContacts, locationToSave);
        }

        let index = _.findIndex(companyToEdit.companyLocations, {_key: locationToSave._key});
        if(index != -1){
            companyToEdit.companyLocations[index] = locationToSave;
        }else{
            companyToEdit.companyLocations.push(locationToSave);
        }

        state.companyToEdit = companyToEdit;
        state.companyToMerge = companyToMerge;
        this.setState(state);
    }

    handleSaveCompanyContact(contactsToSave, contactsToRemove){
        console.log('contactsToSave', contactsToSave);
        console.log('contactsToRemove', contactsToRemove);

        this.mergeContactMappedIds(contactsToSave, contactsToRemove);

        let state = {};
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);

        let index = _.findIndex(companyToEdit.companyContacts, {_key: contactsToSave._key});
        if(index != -1){
            companyToEdit.companyContacts[index] = contactsToSave;
        }else{
            companyToEdit.companyContacts.push(contactsToSave);
        }
        if(contactsToRemove) {
            _.remove(companyToEdit.companyContacts, {_key: contactsToRemove._key});
        }
        state.companyToEdit = companyToEdit;
        if(contactsToRemove){
            let companyToMerge = _.cloneDeep(this.state.companyToMerge);
            _.remove(companyToMerge.companyContacts, {_key: contactsToRemove._key});
            state.companyToMerge = companyToMerge;
        }
        this.setState(state);
    }

    handleSaveCompanySector(sector){
        let state = {};
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);
        if(!companyToEdit.sectors){
            companyToEdit.sectors = [];
        }
        let index = _.findIndex(companyToEdit.sectors, {_key: sector._key});
        if(index != -1){
            companyToEdit.sectors[index] = sector;
        }else{
            companyToEdit.sectors.push(sector);
        }
        state.companyToEdit = companyToEdit;
        this.setState(state);
    }

    handleSaveCompanyRole(role){
        let state = {};
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);
        if(!companyToEdit.roles){
            companyToEdit.roles = [];
        }
        let index = _.findIndex(companyToEdit.roles, {_key: role._key});
        if(index != -1){
            companyToEdit.roles[index] = role;
        }else{
            companyToEdit.roles.push(role);
        }
        state.companyToEdit = companyToEdit;
        this.setState(state);
    }

    handleSaveCompanyRelation(relation){
        console.log("handleSaveCompanyRelation", relation);
        let state = {};
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);
        if(relation.relationType.type == "HAS"){
            if(!companyToEdit.activeRelations){
                companyToEdit.activeRelations = [];
            }
            let index = _.findIndex(companyToEdit.activeRelations, {_key: relation._key});
            if(index != -1){
                companyToEdit.activeRelations[index] = relation;
            }else{
                companyToEdit.activeRelations.push(relation);
            }
        }else if(relation.relationType.type == "IS"){
            if(!companyToEdit.passiveRelations){
                companyToEdit.passiveRelations = [];
            }
            let index = _.findIndex(companyToEdit.passiveRelations, {_key: relation._key});
            if(index != -1){
                companyToEdit.passiveRelations[index] = relation;
            }else{
                companyToEdit.passiveRelations.push(relation);
            }
        }
        state.companyToEdit = companyToEdit;
        this.setState(state);
    }


    handleDeleteCompanyLocation(location){
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);
        _.remove(companyToEdit.companyLocations, {_key: location._key});
        this.setState({companyToEdit: companyToEdit});
    }
    handleDeleteCompanyContact(contact){
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);
        _.remove(companyToEdit.companyContacts, {_key: contact._key});
        this.setState({companyToEdit: companyToEdit});
    }
    handleIgnoreCompanyContact(contact){
        let companyToMerge = _.cloneDeep(this.state.companyToMerge);
        _.remove(companyToMerge.companyContacts, {_key: contact._key});
        this.setState({companyToMerge: companyToMerge});
    }
    handleDeleteCompanySector(sector){
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);
        _.remove(companyToEdit.sectors, {_key: sector._key});
        this.setState({companyToEdit: companyToEdit});
    }
    handleDeleteCompanyRole(role){
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);
        _.remove(companyToEdit.roles, {_key: role._key});
        this.setState({companyToEdit: companyToEdit});
    }
    handleDeleteCompanyRelation(relation){
        let companyToEdit = _.cloneDeep(this.state.companyToEdit);
        if(relation.relationType.type === "HAS"){
            _.remove(companyToEdit.activeRelations, {_key: relation._key});
        }
        if(relation.relationType.type === "IS"){
            _.remove(companyToEdit.passiveRelations, {_key: relation._key});
        }

        this.setState({companyToEdit: companyToEdit});
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }


    handleDontAskMeClick(value){
        this.context.storage.write(this.dontAskWizardNextStateSetting.name, value);
    }

    handleNextActionClose(){
        this.modal.close();
        this.saveCompany();
    }

    handleWizardSave(){
        if((this.props.mode || "").startsWith("NewCompany")){
            Promise.resolve(this.companySectors.next()).then((value) => {
                if(value){
                    this.saveCompany();
                }
            }).catch(error => {
                console.log(error);
            });
        }else{
            Promise.resolve(this.companySectors.next()).then((value) => {
                if (this.props.origin === "CRM") {
                    this.context.storage.write(this.dontAskWizardNextStateSetting.name, true);
                    this.context.storage.write(wizardNextSetting.name, wizardNextSetting.options.companyPage);
                }
                if(this.context.storage.read(this.dontAskWizardNextStateSetting.name)){
                    this.saveCompany();
                }else{
                    this.modal.open();
                }
            }).catch(error => {
                console.log(error);
            });
        }
    }

    saveCompany(){
        this.props.onfinish && this.props.onfinish(this.state.companyToEdit, (response) => {
            let nextAction = this.context.storage.read(wizardNextSetting.name);
            if((this.props.mode || "").startsWith("NewCompany") || nextAction == wizardNextSetting.options.companyPage){
                let params = this.props.origin ? "?origin=" + this.props.origin : "";
                try {
                    this.context.router.push('/ui/kartoteks/company/' + response.data.id + params);
                } catch (error) {
                    console.log(error)
                }

            }else if(nextAction == wizardNextSetting.options.nextQueueItem){
                try {
                    this.context.router.push('/ui/kartoteks/import-queue-next');
                } catch (error) {
                    console.log(error)
                }

            }
        });

    }
    handleCancelClick(){
        this.context.router.goBack();
    }
    renderCompanyGeneral(){
        return <CompanyGeneral mode = {this.props.mode} ref = {(c) => this.companyGeneral = c}
                               companyToEdit = {this.state.companyToEdit}
                               companyToMerge = {this.state.companyToMerge}
                               companyOriginal = {this.state.companyOriginal}
                               onchange = {(key, value) => this.handleCompanyGeneralChange(key, value)}
                               onCountryChange = {(value) => this.handleCompanyCountryChange(value)}
                               onLogoUpdate = {(value) => this.handleCompanyLogoUrlChange(value)}/>
    }

    renderCompanyLocations(){
        return  <CompanyLocations mode = {this.props.mode} ref = {(c) => this.companyLocations = c}
                                 companyToEdit = {this.state.companyToEdit}
                                 companyToMerge = {this.state.companyToMerge}
                                 companyOriginal = {this.state.companyOriginal}
                                 ondelete = {(location) => this.handleDeleteCompanyLocation(location)}
                                 onsave = {(locationToSave, locationToRemoveFromMergingCompany, locationToRemoveFromEditingCompany) =>
                                     this.handleSaveCompanyLocation(locationToSave, locationToRemoveFromMergingCompany, locationToRemoveFromEditingCompany, )} />   
    }
    renderCompanyContacts(){
        return <CompanyContacts mode = {this.props.mode} ref = {(c) => this.companyContacts = c}
                                companyToEdit = {this.state.companyToEdit}
                                companyToMerge = {this.state.companyToMerge}
                                companyOriginal = {this.state.companyOriginal}
                                ondelete = {(contact) => this.handleDeleteCompanyContact(contact)}
                                onignore = {(contact) => this.handleIgnoreCompanyContact(contact)}
                                onsave = {(contactsToEdit, contactsToMerge) => this.handleSaveCompanyContact(contactsToEdit, contactsToMerge)}/>
    }

    renderCompanySectors(){
        return  <CompanySectors mode = {this.props.mode} ref = {(c) => this.companySectors = c}
                               companyToEdit = {this.state.companyToEdit}
                               companyToMerge = {this.state.companyToMerge}
                               companyOriginal = {this.state.companyOriginal}
                               ondelete = {(sector) => this.handleDeleteCompanySector(sector)}
                               onsave = {(sector) => this.handleSaveCompanySector(sector)}/>
    }
    renderCompanyRoles(){
        return <CompanyRoles mode = {this.props.mode} ref = {(c) => this.companyRoles = c}
                             companyToEdit = {this.state.companyToEdit}
                             companyToMerge = {this.state.companyToMerge}
                             companyOriginal = {this.state.companyOriginal}
                             ondelete = {(role) => this.handleDeleteCompanyRole(role)}
                             onsave = {(role) => this.handleSaveCompanyRole(role)}/>;
    }
    renderCompanyRelations(){
        return <CompanyRelations mode = {this.state.mode} ref = {(c) => this.companyRelations = c}
                                 companyToEdit = {this.state.companyToEdit}
                                 companyToMerge = {this.state.companyToMerge}
                                 companyOriginal = {this.state.companyOriginal}
                                 ondelete = {(relation) => this.handleDeleteCompanyRelation(relation)}
                                 onsave = {(relation) => this.handleSaveCompanyRelation(relation)}/>;
    }

    render(){
        if(!this.state.companyToEdit || !this.state.companyToMerge){
            return <Loader size="L" title="Fetching company"/>;
        }

        let steps;
        if((this.props.mode || "").startsWith("NewCompany")){
            steps = [
                {title:super.translate("General Info"), onNextClick: () => {return this.companyGeneral.next()}},
                {title:super.translate("Locations"), onNextClick: () => {return this.companyLocations.next()}},
                {title:super.translate("Contacts"), onNextClick: () => {return this.companyContacts.next()}},
                {title:super.translate("Sectors"), onNextClick: () => {this.handleWizardSave()}, nextButtonLabel: "Save", nextButtonStyle:"success"}
            ];
        }else{
            steps = [
                {title:super.translate("General Info"), onNextClick: () => {return this.companyGeneral.next()}, prevButtonLabel: "Cancel", onPrevClick: () => {this.handleCancelClick()}},
                {title:super.translate("Locations"), onNextClick: () => {return this.companyLocations.next()}},
                {title:super.translate("Contacts"), onNextClick: () => {return this.companyContacts.next()}},
                {title:super.translate("Sectors"), onNextClick: () => {this.handleWizardSave()}, nextButtonLabel: "Save", nextButtonStyle:"success"}
            ];
        }
       
        return (
            <div style={{marginTop: "-40px"}}>
                <Wizard steps = {steps} 
                 hidePrevButton={true}
                 backgroundColor="transparent"
                 textColorNext="md-color-blue-900"
                 textColorPrev="md-color-orange-800"
                >
                    {this.renderCompanyGeneral()}
                    {this.renderCompanyLocations()}
                    {this.renderCompanyContacts()}
                    {this.renderCompanySectors()}
                    {this.renderCompanyRoles()}
                    {this.renderCompanyRelations()}
                </Wizard>
                <Modal title="how do you want to proceed ?" ref = {(c) => this.modal = c}
                       actions = {[{label:"Close", action:() => this.modal.close()},
                           {label:"ok", buttonStyle:"primary", action:() => this.handleNextActionClose()}]}>
                    <Grid>
                        <GridCell width="1-1">
                            <QueueItemSaveSettings />
                        </GridCell>
                        <GridCell width="1-1">
                            <Checkbox label="Don't ask me again" onchange={(value) => this.handleDontAskMeClick(value)}/>
                        </GridCell>
                    </Grid>
                </Modal>
            </div>
        );
    }
}
CompanyWizard.contextTypes = {
    router: PropTypes.object.isRequired,
    storage: PropTypes.object,
    translator: PropTypes.object
};
