import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {ReadOnlyDropDown, Notify} from 'susam-components/basic';

import {CompanyService, CrmAccountService} from '../services';

export class CompanyContactDropDownFilteredByAccountAndLocation extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            companyContactsLoaded:false,
            accountContacts: [],
            companyContacts: [],
            options: []
        };
        this.findContactsOfAccount(this.props.account.id);
    }

    componentDidMount() {
        if(this.props.location){
            this.loadContacts(this.props.location.id)
        }
    }

    componentWillReceiveProps(nextProps) {
        this.loadOptionsIfNecessary(nextProps.location, this.props.location);
        if(!_.isEqual(nextProps.reloadKey, this.props.reloadKey)){
            this.setState({companyContactsLoaded: false}, ()=> this.loadAccountAndCompanyContacts(_.get(nextProps.location, 'id')));
        }
        // this.setInitialValue();
    }

    loadOptionsIfNecessary(nextLocation, currentLocation) {
        let nextLocationId = nextLocation ? nextLocation.id : null;
        let currentLocationId = currentLocation ? currentLocation.id : null;

        if (!_.isEqual(nextLocationId, currentLocationId)) {
            this.setState({companyContactsLoaded: false}, ()=>this.loadContacts(nextLocationId));
        }

    }

    loadAccountAndCompanyContacts(locationId){
        this.findContactsOfAccount(this.props.account.id, (accountContacts) => {
            this.loadContacts(locationId, accountContacts)
        })
    }

    loadContacts(locationId, accountContacts){
        this.findContactsOfLocation(locationId, (companyContacts) => {
            let accCon = !_.isEmpty(accountContacts) ? accountContacts : this.state.accountContacts;
            let options = this.getOptions(companyContacts, accCon, locationId);
            this.setState({companyContacts: companyContacts, companyContactsLoaded: true, options: options}, () => this.setInitialValue());
        });
    }

    setInitialValue(){
        if(this.props.setInitialValue && (_.isEmpty(this.props.value) || !this.isValueContains())){
            if(this.state.options.length == 1){
                this.props.onchange && this.props.onchange(this.state.options[0])
            }
        }
    }

    isValueContains(){
        return 0 <= _.findIndex(this.state.options, item=>item.id === this.props.value.id)
    }

    findContactsOfLocation(location, callback) {
        if (!this.state.companyContactsLoaded && !_.isNil(location)) {
            CompanyService.getContactsByLocation(location).then(response => {
                callback(response.data);
            }).catch(error => {
                Notify.showError(error);
            });
        } else {
            callback(_.cloneDeep(this.state.companyContacts));
        }
    }

    findContactsOfAccount(accountId, callback) {
        if (!_.isNil(accountId)) {
            CrmAccountService.retrieveContacts(accountId).then(response => {
                if(callback) {
                    callback(response.data);
                } else {
                    this.setState({accountContacts: response.data});
                }
            }).catch(error => {
                Notify.showError(error);
            });
        } else {
            callback(_.cloneDeep(this.state.accountContacts));
        }
    }

    getOptions(companyContacts, accountContacts, locationId) {
        let options = [];
        if (!_.isNil(locationId)) {
            let allowedCompanyContactIds = [];
            if (!_.isEmpty(accountContacts)) {
                accountContacts.forEach((item) => {
                    allowedCompanyContactIds.push(item.companyContactId);
                });
            }
            if (!_.isEmpty(allowedCompanyContactIds) && !_.isEmpty(companyContacts)) {
                companyContacts.forEach((item) => {
                    if (allowedCompanyContactIds.includes(item.id) && item.companyLocation.id == locationId) {
                        let clone = _.cloneDeep(item);
                        clone.name = clone.firstName + " " + clone.lastName;
                        options.push(clone);
                    }
                });
            }
        }
        return options;
    }

    render() {
        return (
            <ReadOnlyDropDown {...this.props} options={this.state.options}/>
        );
    }
}