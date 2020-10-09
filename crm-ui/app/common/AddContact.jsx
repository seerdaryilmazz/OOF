
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import {  Notify } from "susam-components/basic";
import {  Modal } from 'susam-components/layout';
import {  EmailUtils, PhoneNumberUtils, StringUtils} from "../utils";
import { CrmAccountService, CompanyService } from "../services";
import {Contact} from '../contact/Contact';

export class AddContact extends TranslatingComponent{
    state = {};
    
    openModal(){
        let companyId = _.get(this.props.account, 'company.id'); 
        CompanyService.getCompany(companyId).then(response=>{
            this.setState({company: response.data, contact: {active:true}}, ()=> this.contactModal.open());
        })
    }
    
    closeModal(){
        this.setState({contact: null}, ()=> this.contactModal.close());
    }

    handleChange(key, value){
        let contact = _.cloneDeep(this.props.contact);
        contact[key] = value;
        this.props.onChange && this.props.onChange(contact);
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    sanitizeContacts(){       
        let account = _.cloneDeep(this.props.account);     
        if(account){                                      
            if(!account.accountContacts){                   
                account.accountContacts = [];          
            }
            account.accountContacts = account.accountContacts.map(item => {    
                let contact = this.sanitizeContact(item, company.country);      
                contact._key = contact.id;
                return contact;
            });
            account.accountContacts = account.accountContacts.sort((first, second) => this.localizedSort(first, second)); 
            this.props.onChange && this.props.onChange(account.accountContacts);  
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

    localizedSort(first, second){
        let fullname1 = (first.firstName ? first.firstName : "") + (first.lastname ? first.lastname : "");
        let fullname2 = (second.firstName ? second.firstName : "") + (second.lastname ? second.lastname : "");
        return fullname1.toUpperCase().localeCompare(fullname2.toUpperCase());
    }

    handleContactCreate(){
        this.setState({busy: true});  
        let contact = _.cloneDeep(this.state.contact); 
        contact.company = this.state.company;        
        if(this.contactForm.validate()){              
            CompanyService.validateContact(contact).then(response => {     
                CompanyService.addContact(contact).then(response => {       
                    let companyContact = response.data;                     
                    this.sanitizeContact(companyContact, this.props.account.country);       

                    let companyContacts = _.cloneDeep(this.state.company.companyContacts) || []; 
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
            this.props.onAddContact && this.props.onAddContact(data);

        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }



    renderContactForm(){
        return(
           
            <Modal ref={(c) => this.contactModal = c} title = {"Create Contact"}
                   closeOnBackgroundClicked={false}
                   large={true}
                   minHeight="800px"
                   actions={[
                       {label: "SAVE", buttonStyle:"success", flat:false, action: () =>  this.handleContactCreate()},   
                       {label: "CLOSE", buttonStyle:"danger", flat:false, action: () =>this.closeModal()}]}>

                {this.state.contact && <Contact ref={(c) => this.contactForm = c}     
                        contact = {this.state.contact || undefined}                     
                        country = {this.state.company.country}                     
                        locations = {this.state.company.companyLocations}      
                        onChange={(value) => this.updateState("contact", value)}/>    }  
            </Modal>
           
        );
       
    }
    

    render(){

        return(
                            
            <div>
            {this.renderContactForm()}     
        </div>
        );
       
    }

}
