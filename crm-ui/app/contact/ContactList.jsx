import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, Modal, Pagination } from "susam-components/layout";
import { CompanyService, CrmAccountService } from "../services";
import { ActionHeader, EmailUtils, PhoneNumberUtils, StringUtils } from '../utils';
import { Contact } from './Contact';
import PropTypes from "prop-types";


export class ContactList extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {
            pageNumber: 1,
            pageSize:10,
        };
    }

    calculatePageNumber(contacts)
    {
        let {pageNumber, pageSize} = this.state;
        let paging = {
            totalElements: contacts.length,
        }
        paging.content = _.slice(contacts,(pageNumber-1)*pageSize, pageNumber*pageSize );
        paging.pageCount = Math.floor(paging.totalElements / pageSize) + ((paging.totalElements % pageSize) > 0 ? 1 : 0);
        return paging;
    }

    componentDidMount() {
        this.retrieveAccountContacts();
        this.sanitizeContacts();
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    sanitizeContacts(){
        let company = _.cloneDeep(this.props.company);
        if(company){
            if(!company.companyContacts){
                company.companyContacts = [];
            }
            company.companyContacts = company.companyContacts.map(item => {
                let contact = this.sanitizeContact(item, company.country);
                contact._key = contact.id;
                return contact;
            });
            company.companyContacts = company.companyContacts.sort((first, second) => this.localizedSort(first, second));
            this.props.onChange && this.props.onChange(company.companyContacts);
        }
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
                    phoneNumber.phoneNumber.phone = phone.replace("00" + countryCode, "");x
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

    localizedSort(first, second){
        let fullname1 = (first.firstName ? first.firstName : "") + (first.lastname ? first.lastname : "");
        let fullname2 = (second.firstName ? second.firstName : "") + (second.lastname ? second.lastname : "");
        return fullname1.toUpperCase().localeCompare(fullname2.toUpperCase());
    }

    retrieveAccountContacts(pageNumber){
        this.setState({busy: true});
        let params={
            page:pageNumber-1
        };
        CrmAccountService.retrieveContacts(this.props.account.id, params).then(response => {
            this.setState({
                busy: false,
                accountContacts: response.data
            });
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    addToAccountContacts(data){
        this.setState({busy: true});
        let accountContact = {
            companyContactId : data.id,
            account : this.props.account,
            firstName : data.firstName,
            lastName : data.lastName
        }
        CrmAccountService.saveContact(this.props.account.id, accountContact).then(response => {
            let accountContacts = _.cloneDeep(this.state.accountContacts) || [];
            accountContacts.push(response.data);
            this.setState({accountContacts: accountContacts, busy: false});
            Notify.showSuccess("Contact saved successfully");

        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    editAccountContacts(data){
        this.setState({busy: true});
        let accountContact = _.find(this.state.accountContacts, {companyContactId: data.id});
        accountContact.firstName = data.firstName;
        accountContact.lastName = data.lastName;
        CrmAccountService.saveContact(this.props.account.id, accountContact).then(response => {
            let accountContacts = _.cloneDeep(this.state.accountContacts);
            const index = accountContacts.findIndex(contact => contact.id === response.data.id);
            accountContacts[index] = accountContact;
            this.setState({accountContacts: accountContacts, busy: false});
            Notify.showSuccess("Contact saved successfully");
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    deleteAccountContact(data){
        this.setState({busy: true});
        let accountContact = _.find(this.state.accountContacts, {companyContactId: data.id});
        CrmAccountService.deleteContact(accountContact.id).then(response => {

            let accountContacts = _.cloneDeep(this.state.accountContacts);
            if(accountContacts){
                const index = accountContacts.findIndex(contact => contact.id === accountContact.id);
                accountContacts.splice(index, 1);
                this.setState({accountContacts: accountContacts, busy: false});
            }
            Notify.showSuccess("Contact deleted successfully");
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handleContactCreate(){
        this.setState({busy: true});
        let contact = _.cloneDeep(this.state.contact);
        contact.company = this.props.company;
        if(this.contactForm.validate()){
            CompanyService.validateContact(contact).then(response => {
                CompanyService.addContact(contact).then(response => {
                    let companyContact = response.data;
                    this.sanitizeContact(companyContact, this.props.company.country);

                    let companyContacts = _.cloneDeep(this.props.company.companyContacts) || [];
                    companyContacts.push(companyContact);

                    this.props.onChange && this.props.onChange(companyContacts);
                    this.setState({contact: undefined, busy: false}, ()=> this.contactModal.close());

                    this.addToAccountContacts(companyContact);
                }).catch(error => {
                    this.setState({busy: false});
                    Notify.showError(error);
                });
            }).catch(error => {
                Notify.showError(error);
                this.setState({busy: false});
            })
        }
    }

    handleContactEdit(){
        this.setState({busy: true});
        let contact = _.cloneDeep(this.state.contact);
        contact.company = this.props.company;
        if(this.contactForm.validate()){
            CompanyService.validateContact(contact).then(response => {
                CompanyService.updateContact(contact).then(response => {
                    let companyContact = response.data;
                    this.sanitizeContact(companyContact, this.props.company.country);

                    let companyContacts = _.cloneDeep(this.props.company.companyContacts) || [];
                    const index = companyContacts.findIndex(contact => contact.id === companyContact.id);
                    companyContacts[index] = companyContact;

                    this.props.onChange && this.props.onChange(companyContacts);
                    this.setState({contact: undefined, busy: false}, ()=> this.contactModal.close());

                    this.editAccountContacts(companyContact);
                }).catch(error => {
                    this.setState({busy: false});
                    Notify.showError(error);
                });
            }).catch(error => {
                Notify.showError(error);
                this.setState({busy: false});
            })
        }
    }
    openContactForm(data){
        let state = _.cloneDeep(this.state);
        state.contact = data;
        this.setState(state, () => {this.contactModal.open()});
    }

    renderContactForm(){
        return(
            <Modal ref={(c) => this.contactModal = c} title = {this.state.contact && this.state.contact.id ? "Edit Contact" : "Create Contact"}
                   closeOnBackgroundClicked={false}
                   large={true}
                   minHeight="800px"
                   actions={[
                       {label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.contact.id ? this.handleContactEdit() : this.handleContactCreate()}},
                       {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.setState({contact: undefined}, ()=>this.contactModal.close())}]}>

                {this.state.contact && <Contact ref={(c) => this.contactForm = c}
                                                contact = {this.state.contact || undefined}
                                                country = {this.props.company.country}
                                                locations = {this.props.company.companyLocations}
                                                onChange={(value) => this.updateState("contact", value)}/> }
            </Modal>
        );
    }

    renderCompanyContacts(){
        let companyContacts = [];
        if(this.props.company && !_.isEmpty(this.props.company.companyContacts)){
            if(this.state.accountContacts){
                this.props.company.companyContacts.forEach(companyContact => {
                    let contactExists = false;
                    this.state.accountContacts.every(accountContact => {
                        if(accountContact.companyContactId === companyContact.id){
                            contactExists = true;
                            return false;
                        }
                        return true;
                    });
                    if(!contactExists){
                        companyContacts.push(companyContact);
                    }
                });
            }else{
                companyContacts = this.props.company;
            }
        }
        return(
            <Modal ref={(c) => this.companyContactsModal = c}
                   large={true} closeOnBackgroundClicked={false}
                   actions={[{label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.companyContactsModal.close()}]}>
                {this.renderContactData(companyContacts, true)}
            </Modal>
        );
    }

    renderAccountContacts(){
        let accountContacts = [];
        if(!_.isEmpty(this.state.accountContacts) && !_.isEmpty(this.props.company.companyContacts)){
            accountContacts = this.props.company.companyContacts.filter(i=>_.find(this.state.accountContacts, j=>j.companyContactId ==i.id));
        }
        return this.renderContactData(accountContacts, false);
    }

    newContactOnClick(fromCompany){
        if(this.props.company.companyLocations.length == 1){
            let companyLocation = this.props.company.companyLocations[0];
            this.setState({ contact: { active: true, companyLocation: companyLocation} }, () => { fromCompany ? this.contactModal.open() : this.companyContactsModal.open() });
        }else{
            this.setState({ contact: { active: true } }, () => { fromCompany ? this.contactModal.open() : this.companyContactsModal.open() });
        }
    }

    renderContactData(contacts, fromCompany) {
        let actions = [];
        let title;
        let paging = this.calculatePageNumber(contacts);
        if (fromCompany) {
            title = "Company Contacts";
            actions.push(
                <DataTable.ActionWrapper key="add" track="onclick"
                                         onaction={data => Notify.confirm("Are you sure?", () => this.addToAccountContacts(data))}>
                    <Button icon="plus" size="small"/>
                </DataTable.ActionWrapper>
            );
            return (
                <div>
                    <ActionHeader title={title}
                                  tools={[{
                                      title: "New Contact",
                                      items: [{label: "", onclick: () => this.newContactOnClick(fromCompany)}]
                                  }]}
                    />
                    <div>
                        <DataTable.Table data={paging.content} filterable={fromCompany}>
                            <DataTable.Text header="Name" width="20" reader={new FullnameReader()}/>
                            <DataTable.Text header="Department" field="department.name" width="20"
                                            translator={this}/>
                            <DataTable.Text header="Title" field="title.name" width="15" translator={this}/>
                            <DataTable.Text header="Location" field="companyLocation.name" width="15"/>
                            <DataTable.Text header="Work Phone" width="10" reader={new PhoneNumberListReader()}
                                            printer={new ListPrinter()}/>
                            <DataTable.Text header="Work Mobile" width="10"
                                            reader={new MobilePhoneNumberListReader()} printer={new ListPrinter()}/>
                            <DataTable.Text header="Work Emails" width="10" reader={new EmailListReader()}
                                            printer={new ListPrinter()}/>
                            <DataTable.ActionColumn>
                                {actions}
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                        <Pagination totalElements={paging.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={paging.pageCount}
                                    onPageChange={(pageNumber) => this.setState({pageNumber: pageNumber})}/>
                    </div>
                </div>
            );

        } else {
            title = "CRM & Sales Contacts";
            actions.push([
                    <DataTable.ActionWrapper key="editContact" track="onclick"
                                             onaction={(data) => this.openContactForm(data)}>
                        <Button icon="pencil" size="small"/>
                    </DataTable.ActionWrapper>,
                    <DataTable.ActionWrapper key="delete" track="onclick"
                                             onaction={data => Notify.confirm("Are you sure?", () => this.deleteAccountContact(data))}>
                        <Button icon="close" size="small"/>
                    </DataTable.ActionWrapper>
                ]
            );
            return (
                <div>
                    <ActionHeader title={title}
                                  tools={[{
                                      title: "New Contact",
                                      items: [{label: "", onclick: () => this.newContactOnClick(fromCompany)}]
                                  }]}
                                  className="uk-accordion-title"/>
                    <div className="uk-accordion-content uk-accordion-initial-open">
                        <DataTable.Table data={paging.content} filterable={fromCompany}>
                            <DataTable.Text header="Name" width="20" reader={new FullnameReader()}/>
                            <DataTable.Text header="Department" field="department.name" width="20"
                                            translator={this}/>
                            <DataTable.Text header="Title" field="title.name" width="15" translator={this}/>
                            <DataTable.Text header="Location" field="companyLocation.name" width="15"/>
                            <DataTable.Text header="Work Phone" width="10" reader={new PhoneNumberListReader()}
                                            printer={new ListPrinter()}/>
                            <DataTable.Text header="Work Mobile" width="10"
                                            reader={new MobilePhoneNumberListReader()} printer={new ListPrinter()}/>
                            <DataTable.Text header="Work Emails" width="10" reader={new EmailListReader()}
                                            printer={new ListPrinter()}/>
                            <DataTable.ActionColumn>
                                {actions}
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                        <Pagination totalElements={paging.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={paging.pageCount}
                                    onPageChange={(pageNumber) => this.setState({pageNumber: pageNumber})}/>
                    </div>
                </div>
            );
        }
    }


    render() {
        return (
            <div>
                {this.renderAccountContacts()}
                {this.renderCompanyContacts()}
                {this.renderContactForm()}
            </div>
        );
    }
}

ContactList.contextTypes = {
    translator: PropTypes.object
};


class ListPrinter{
    print(data){
        if(data.indexOf("\n") != -1){
            return data.split("\n").map(item => <div key={item}>{item}<br/></div>);
        }
        return data;
    }
}
class FullnameReader{
    readCellValue(row) {
        return row.firstName + " " + row.lastName;
    };

    readSortValue(row) {
        return row.firstName + " " + row.lastName;
    };
}

class EmailListReader{
    readCellValue(row) {
        let formattedEmails = [];
        _.filter(row.emails, {usageType:{code:"WORK"}}).forEach(item => {
            let email = item.email;
            if(email){
                formattedEmails.push(EmailUtils.format(email));
            }
        });
        return formattedEmails.join("\n");
    };

    readSortValue(row) {
        return "";
    };
}

class PhoneNumberListReader{

    readCellValue(row) {
        let formattedPhones = [];
        _.filter(row.phoneNumbers, {usageType:{code:"WORK"}, numberType:{code:"PHONE"}}).forEach(item => {
            let phoneNumber = item.phoneNumber;
            if(phoneNumber){
                formattedPhones.push(PhoneNumberUtils.format(phoneNumber));
            }
        });
        return formattedPhones.join("\n");
    };

    readSortValue(row) {
        return "";
    };
}

class MobilePhoneNumberListReader{

    readCellValue(row) {
        let formattedPhones = [];
        _.filter(row.phoneNumbers, {usageType:{code:"WORK"}, numberType:{code:"MOBILE"}}).forEach(item => {
            let phoneNumber = item.phoneNumber;
            if(phoneNumber){
                formattedPhones.push(PhoneNumberUtils.format(phoneNumber));
            }
        });
        return formattedPhones.join("\n");
    };

    readSortValue(row) {
        return "";
    };
}