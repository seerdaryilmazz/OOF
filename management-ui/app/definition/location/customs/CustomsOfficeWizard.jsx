import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Page, Wizard } from "susam-components/layout";
import { CustomsOfficeService } from '../../../services/LocationService';
import { CustomsContactList } from './CustomsContactList';
import { CustomsGeneralInfo } from './CustomsGeneralInfo';
import { CustomsLocationList } from './CustomsLocationList';





export class CustomsOfficeWizard extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
        this.steps = [
            {
                title: "General Info",
                onNextClick: () => {
                    return this.generalStep.next()
                },
                prevButtonLabel: "Cancel",
                onPrevClick: () => {
                    this.handleCancelClick()
                }
            },
            {
                title: "Locations",
                onNextClick: () => {
                    return this.locationStep.next()
                }
            },
            {
                title: "Contacts",
                nextButtonLabel: "Save",
                onNextClick: () => {
                    return this.contactStep.next()
                }
            }
        ];
    }

    componentDidMount() {
        this.initializeState(this.props);

    }

    initializeCustomsOffice(){
        return {active: true, locations: [], contacts: []};
    }

    initializeState(props) {
        if (props.location.query && props.location.query.id) {
            this.loadCustomsOffice(props.location.query.id);
        }else{
            let state = _.cloneDeep(this.state);
            state.customsOffice = this.initializeCustomsOffice();
            this.setState(state);
        }
    }

    loadCustomsOffice(id){
        CustomsOfficeService.get(id).then(response => {
            let state = _.cloneDeep(this.state);
            state.customsOffice = response.data;
            state.customsOffice.contacts.forEach(contact => {
                contact._key = contact.id;
                if(contact.customsLocation){
                    contact.customsLocation._key = contact.customsLocation.id;
                }
            });
            state.customsOffice.locations.forEach(location => location._key = location.id);
            this.setState(state);
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        })
    }

    handleCancelClick(){
        this.context.router.push('/ui/management/customs-office-list');
    }

    updateGeneralInfo(value) {
        let customsOffice = _.cloneDeep(this.state.customsOffice);
        customsOffice = _.assign(customsOffice, value);
        this.setState({customsOffice: customsOffice});
    }
    updateLocations(locations) {
        let customsOffice = _.cloneDeep(this.state.customsOffice);
        customsOffice.locations = locations;
        customsOffice.contacts.forEach(contact => {
            if(contact.customsLocation){
                if(!_.find(customsOffice.locations, {_key: contact.customsLocation._key})){
                    contact.customsLocation = null;
                }
            }
        });
        this.setState({customsOffice: customsOffice});
    }

    updateContacts(contacts){
        let customsOffice = _.cloneDeep(this.state.customsOffice);
        customsOffice.contacts = contacts;
        this.setState({customsOffice: customsOffice}, () => this.saveCustomsOffice());
    }

    saveCustomsOffice(){
        console.log("saveCustomsOffice", this.state.customsOffice);
        CustomsOfficeService.save(this.state.customsOffice).then(response => {
            Notify.showSuccess("Customs office saved");
            this.context.router.push('/ui/management/customs-office-list');
        }).catch(error => {
            Notify.showError(error);
        })
    }

    render() {
        if (!this.state.customsOffice) {
            return null;
        }
        let title = super.translate("New Customs Office");
        if(this.state.customsOffice.name){
            title = this.state.customsOffice.name;
        }

        return (
            <Page title = {title}>
                <Wizard steps={this.steps}>
                    <CustomsGeneralInfo ref={(c) => this.generalStep = c}
                               data={this.state.customsOffice}
                               handleSave={data => this.updateGeneralInfo(data)}/>
                    <CustomsLocationList ref={(c) => this.locationStep = c}
                                         data={this.state.customsOffice}
                                         handleSave={data => this.updateLocations(data)} />
                    <CustomsContactList ref={(c) => this.contactStep = c}
                                        data={this.state.customsOffice}
                                        handleSave={data => this.updateContacts(data)} />
                </Wizard>
            </Page>
        );
    }

}

CustomsOfficeWizard.contextTypes = {
    router: React.PropTypes.object.isRequired
};