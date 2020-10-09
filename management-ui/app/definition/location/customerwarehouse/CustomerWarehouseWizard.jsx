import * as axios from 'axios';
import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Page, Wizard } from "susam-components/layout";
import { KartoteksService } from '../../../services/KartoteksService';
import { CustomerWarehouseService, CustomsOfficeService } from '../../../services/LocationService';
import { WorkingHours } from '../place/WorkingHours';
import { CustomerWarehouseBooking } from './CustomerWarehouseBooking';
import { CustomerWarehouseLocation } from './CustomerWarehouseLocation';
import { CustomerWarehouseTrailerPool } from './CustomerWarehouseTrailerPool';







export class CustomerWarehouseWizard extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
        this.steps = [
            {
                title: "Location",
                onNextClick: () => {
                    return this.locationStep.next()
                },
                prevButtonLabel: "Cancel",
                onPrevClick: () => {
                    this.handleCancelClick()
                }
            },
            {
                title: "Working Hours",
                onNextClick: () => {
                    return this.workingHoursStep.next()
                }
            },
            {
                title: "Booking",
                onNextClick: () => {
                    return this.bookingStep.next()
                }
            },
            {
                title: "Operational Details",
                onNextClick: () => {
                    return this.confirmationStep.next()
                },
                nextButtonLabel: "Save"
            }];
    }

    componentDidMount() {
        this.initializeState(this.props);
        this.initialize();
    }

    initialize() {
        axios.all([
            CustomerWarehouseService.listCWBookingType(),
            CustomerWarehouseService.listCWBookingOptions(),
            CustomsOfficeService.list()
        ]).then(axios.spread((bookingTypes, bookingOptions, customsOffices) => {
            this.setState({
                bookingTypes: bookingTypes.data,
                bookingOptions: bookingOptions.data,
                customsOffices: customsOffices.data
            });
        })).catch((error) => {
            Notify.showError(error);
        });
    }

    initializePlace() {
        return (
            {
                active: true,
                location: {},
                establishment: {
                    address: {},
                    workingHours: [],
                    phoneNumbers: []
                },
                assets: []
            }
        );
    }

    initializeState(props) {
        let isQueryParamExist = false; 
        
        if (props.location.query) {
            if(props.location.query.id){
                this.loadCustomerWarehouse(props.location.query.id);
                isQueryParamExist=true
            } else if(props.location.query.locationId){
                if(props.location.query.locationType == 'COMPANY'){
                    this.loadCompanyByLocationId(props.location.query.locationId, props.location.query.locationType);
                    isQueryParamExist=true
                } else if(props.location.query.locationType == 'CUSTOMS'){
                    isQueryParamExist=true
                }
            }
        }
        if(!isQueryParamExist){
            let state = _.cloneDeep(this.state);
            state.place = this.initializePlace();
            this.setState(state);
        }
    }

    handleCancelClick() {
        this.props.onCancel ? this.props.onCancel() : this.context.router.push('/ui/management/customerwarehouse-list');
    }

    loadCompanyByLocationId(locationId, locationType) {
        KartoteksService.getCompanyByLocationId(locationId).then(response => {
            let state = _.cloneDeep(this.state);
            state.searchByLocation = true;
            state.place = this.initializePlace();
            state.place.company = {id: response.data.id, name: response.data.name}
            state.place.companyLocation = _.find(response.data.companyLocations,{id: Number.parseInt(locationId)})
            state.place.companyType = {id: locationType, code: locationType, name:"Company"}
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        })
    }

    loadCustomerWarehouse(id) {
        CustomerWarehouseService.get(id).then(response => {
            let state = _.cloneDeep(this.state);
            state.place = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        })
    }

    loadCompanyContacts(place){
        KartoteksService.getCompanyContacts(place.company.id).then(response => {
            this.setState({
                contacts: response.data.map(d => {
                    return {id: d.id, name: d.fullname}
                })
            });
        }).catch(error => {
            Notify.showError("Error occured while retrieving contacts of the selected company: " + error);
        });
    }

    loadCustomsContacts(place){
        CustomsOfficeService.listContacts(place.company).then(response => {
            this.setState({
                contacts: response.data.map(d => {
                    return {id: d.id, name: d.fullname}
                })
            });
        }).catch(error => {
            Notify.showError("Error occured while retrieving contacts of the selected customs: " + error);
        });
    }

    loadCustomsTypesForCompanies(){
        CustomerWarehouseService.listCustomsTypesForCompanies().then(response => {
            this.setState({customsTypes: response.data});
        }).catch(error => Notify.showError(error));
    }

    loadCustomsTypesForCustoms(){
        CustomerWarehouseService.listCustomsTypesForCustoms().then(response => {
            this.setState({customsTypes: response.data});
        }).catch(error => Notify.showError(error));
    }

    updateLocation(location) {
        let place = _.cloneDeep(this.state.place);
        place = _.merge(place, location);
        this.setState({place: place}, () => {
            if (place.company && place.companyType && place.companyType.id === "COMPANY"){
                this.loadCompanyContacts(this.state.place);
                this.loadCustomsTypesForCompanies();
            }
            if (place.company && place.companyType && place.companyType.id === "CUSTOMS"){
                this.loadCustomsContacts(this.state.place);
                this.loadCustomsTypesForCustoms();
            }

        });
    }

    updateWorkingHours(workingHours) {
        let place = _.cloneDeep(this.state.place);
        place.establishment.workingHours = workingHours;
        this.setState({place: place});
    }

    updateBooking(place) {
        this.setState({place: place});
    }

    updateConfirmation(place) {
        this.setState({place: place}, () => this.saveCustomerWarehouse());
    }

    saveCustomerWarehouse() {
        CustomerWarehouseService.save(this.state.place).then(response => {
            Notify.showSuccess("Customer Warehouse saved");
            this.props.onSuccess ? this.props.onSuccess(response.data) : this.context.router.push('/ui/management/customerwarehouse-list');
        }).catch(error => {
            Notify.showError(error);
            this.props.onError && this.props.onError(error);
        })
    }

    render() {
        let place = this.state.place;
        if (!place) {
            return null;
        }

        let title = super.translate("New Location");

        if (place.name) {
            title = place.name;
        }

        return (
            <Page title={title}>
                <Wizard steps={this.steps}>
                    <CustomerWarehouseLocation ref={(c) => this.locationStep = c}
                                               readOnly={true}
                                               place={place}
                                               searchByLocation={this.state.searchByLocation}
                                               handleSave={data => this.updateLocation(data)}/>
                    <WorkingHours ref={(c) => this.workingHoursStep = c}
                                  isRequired = {false}
                                  workingHours={this.state.place.establishment.workingHours}
                                  handleSave={data => this.updateWorkingHours(data)}/>
                    <CustomerWarehouseBooking ref={(c) => this.bookingStep = c}
                                              data={place}
                                              bookingTypes={this.state.bookingTypes}
                                              bookingOptions={this.state.bookingOptions}
                                              contacts={this.state.contacts}
                                              handleSave={data => this.updateBooking(data)}/>
                    <CustomerWarehouseTrailerPool ref={(c) => this.confirmationStep = c}
                                                  data={place}
                                                  registrationMethods={this.state.registrationMethods}
                                                  customsTypes = {this.state.customsTypes}
                                                  customsOffices = {this.state.customsOffices}
                                                  handleSave={data => this.updateConfirmation(data)}/>

                </Wizard>
            </Page>
        );
    }

}

CustomerWarehouseWizard.contextTypes = {
    router: React.PropTypes.object.isRequired
};