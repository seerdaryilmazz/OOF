import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Kartoteks, OrderService, ProjectService } from '../services';
import { LocationService } from '../services/LocationService';
import { DeliveryDateRuleEdit } from './DeliveryDateRuleEdit';
import { DeliveryDateRuleList } from './DeliveryDateRuleList';




export class DeliveryDateRuleManagement extends TranslatingComponent {

    state = {};
    componentDidMount(){
        this.loadLookupData();
    }
    loadLookupData(){
        let calls = [
            OrderService.getTruckLoadTypes(),
            OrderService.getServiceTypes(),
            Kartoteks.getCountries(),
            LocationService.getDaysOfWeek()
        ];
        if(this.props.location.query.customerId){
            calls.push(Kartoteks.getCompanyDetails(this.props.location.query.customerId))
        }
        axios.all(calls).then(axios.spread((loadTypes, serviceTypes, countries, days, customer) => {
            let state = _.cloneDeep(this.state);
            state.lookup = {};
            state.lookup.serviceTypes = serviceTypes.data;
            state.lookup.loadTypes = loadTypes.data;
            state.lookup.countries = countries.data.map(country => {
                return {
                    code: country.iso,
                    name: country.countryName
                }
            });
            state.lookup.days = days.data;
            if(customer){
                state.customer={id: customer.data.id, name: customer.data.name, value:customer.data.name}
            }
            this.setState(state);
        })).catch(error => Notify.showError(error));
    }

    initializeRule(ruleToCopy) {
        return {
            customer: this.state.customer,
            origin: ruleToCopy ? _.cloneDeep(ruleToCopy.origin) : {},
            destination: ruleToCopy ? _.cloneDeep(ruleToCopy.destination) : {},
            schedules: []
        };
    }
    handleSave(){
        let rule = _.cloneDeep(this.state.ruleToEdit);
        rule.origin.postalCodes = rule.origin.postalCodes ? rule.origin.postalCodes.split(",").sort() : [];
        rule.destination.postalCodes = rule.destination.postalCodes ? rule.destination.postalCodes.split(",").sort() : [];
        rule.schedules = rule.schedules.map(item => {
            return {
                readyDate: {
                    dayOfWeek: item.readyDate.day.dayIndex,
                    weekOffset: item.readyDate.day.weekOffset,
                    hour: item.readyDate.time
                },
                deliveryDate: {
                    dayOfWeek: item.deliveryDate.day.dayIndex,
                    weekOffset: item.deliveryDate.day.weekOffset,
                    hour: item.deliveryDate.time
                }
            };
        });
        ProjectService.saveDeliveryDateRule(rule).then(response => {
            Notify.showSuccess("Delivery date rule saved");
            this.setState({ruleToEdit: null});
        }).catch(error => Notify.showError(error));
    }

    render() {
        if (!this.state.ruleToEdit) {
            return <DeliveryDateRuleList customer = {this.state.customer} lookup = {this.state.lookup}
                                 onEdit = {(rule) => this.setState({ruleToEdit: rule})}
                                 onCustomerSelect = {(customer) => this.setState({customer: customer})}
                                 readOnly={this.props.location.query.customerId}
                                 onCreate = {(selectedRoute) => this.setState({ruleToEdit: this.initializeRule(selectedRoute)})}/>
        }else{
            return <DeliveryDateRuleEdit rule = {this.state.ruleToEdit} lookup = {this.state.lookup}
                                 onBack = {() => this.setState({ruleToEdit: null})}
                                 onChange = {(rule) => this.setState({ruleToEdit: rule})}
                                 readOnly={this.props.location.query.customerId}
                                 onSave = {() => this.handleSave()}/>
        }
    }
}