import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Wizard, Loader, CardHeader, OverflowContainer} from "susam-components/layout";
import {Notify, TextInput, Button, Span} from 'susam-components/basic';

import {PhoneNumberUtils} from '../../utils/PhoneNumberUtils';

export class CompanyContacts extends TranslatingComponent{
    constructor(props) {
        super(props);
        this.state = {};
    }
    handleExpandClick(e, item){
        e.preventDefault();
        this.props.onExpand && this.props.onExpand(item);
    }
    renderContactList(contacts){
        return contacts.map(item => {
            let department = item.department ? item.department.name : super.translate("No Department");
            let title = item.title ? item.title.name : super.translate("No title");
            let expandLink = item._expand ?
                <a href="#" onClick = {(e) => this.handleExpandClick(e, item)} className="md-list-action"><i className="md-icon uk-icon-chevron-up" /></a> :
                <a href="#" onClick = {(e) => this.handleExpandClick(e, item)} className="md-list-action"><i className="md-icon uk-icon-chevron-down" /></a>;
            let isDefault = item.default ? <i className="uk-badge uk-text-small uk-badge-success uk-margin-left">{super.translate("Default")}</i> : "";
            let types = item.companyServiceTypes.map(type => {
                return <i key = {uuid.v4()} className="uk-badge uk-badge-outline uk-text-small uk-margin-right">{type.name}</i>;
            });
            let linkedin = item.linkedinProfileUrl ?
                <a href={item.linkedinProfileUrl} target="_blank"><i className="uk-icon-linkedin-square uk-icon-medsmall uk-margin-left" title={super.translate("Linkedin")} data-uk-tooltip="{pos:'bottom'}" /></a>
                : "";
            let gender = "";
            if(item.gender.code == "MALE"){
                gender = <i className="uk-icon-mars uk-icon-medsmall uk-margin-left" title={super.translate("Male")} data-uk-tooltip="{pos:'bottom'}" />;
            }else if(item.gender.code == "FEMALE"){
                gender = <i className="uk-icon-venus uk-icon-medsmall uk-margin-left" title={super.translate("Female")} data-uk-tooltip="{pos:'bottom'}"/>;
            }

            let phoneNumbers = "";
            if(item._expand){
                phoneNumbers = <div className="md-list-content">{super.translate("No phone numbers")}</div>;
                if(item.phoneNumbers.length > 0){
                    let counter = 0;
                    let phoneNumberList = item.phoneNumbers.map(phone => {
                        let isPhoneDefault = phone.default ? <i className="uk-badge uk-text-small uk-badge-success uk-margin-left">{super.translate("Default")}</i> : "";
                        let numberType = "";
                        if(phone.numberType.code == "FAX"){
                            numberType =  <i className="md-list-addon-icon uk-icon-fax " style = {{fontSize: "120%"}} title={super.translate("Fax")} data-uk-tooltip="{pos:'bottom'}"/>;
                        }else if(phone.numberType.code == "PHONE"){
                            numberType =  <i className="md-list-addon-icon uk-icon-phone " style = {{fontSize: "120%"}} title={super.translate("Phone")} data-uk-tooltip="{pos:'bottom'}"/>;
                        }
                        let usageType = <i className="uk-badge uk-text-small uk-badge-outline uk-margin-left">{phone.usageType.name}</i>;
                        return (
                            <li key = {counter++}>
                                <div className="md-list-addon-element">
                                    {numberType}
                                </div>
                                <div className="md-list-content">
                                    <span className="md-list-heading">{PhoneNumberUtils.format(phone.phoneNumber)}
                                        {isPhoneDefault}
                                        {usageType}
                                    </span>
                                </div>
                            </li>
                        );
                    });
                    phoneNumbers = <div className="md-list-content"><ul className="md-list md-list-addon">{phoneNumberList}</ul></div>;
                }
            }
            let emails = "";
            if(item._expand){
                emails = <div className="md-list-content">{super.translate("No emails")}</div>;
                if(item.emails.length > 0){
                    let counter = 0;
                    let emailList = item.emails.map(email => {
                        let isEmailDefault = email.default ? <i className="uk-badge uk-text-small uk-badge-success uk-margin-left">{super.translate("Default")}</i> : "";
                        let usageType = <i className="uk-badge uk-text-small uk-badge-outline uk-margin-left">{email.usageType.name}</i>;
                        return (
                            <li key = {counter++}>
                                <div className="md-list-addon-element">
                                    <i className="md-list-addon-icon uk-icon-at" style = {{fontSize: "120%"}} title="Email" data-uk-tooltip="{pos:'bottom'}"/>
                                </div>
                                <div className="md-list-content">
                                    <span className="md-list-heading">{email.email.emailAddress}
                                        {isEmailDefault}
                                        {usageType}
                                    </span>
                                </div>
                            </li>
                        );
                    });
                    emails = <div className="md-list-content"><ul className="md-list md-list-addon">{emailList}</ul></div>;
                }
            }
            return(
                <li key={item.id} className="">
                    <div className="md-list-content">
                        {expandLink}
                        <span className="md-list-heading">{item.firstName} {item.lastName} {gender} {linkedin} {isDefault} </span>
                        <span className="uk-text-small uk-text-muted uk-margin-small-top">
                            {title}, {department}
                        </span>
                        <span className="uk-margin-small-top">{types}</span>
                    </div>
                    {phoneNumbers}
                    {emails}
                </li>
            );
        });
    }
    render(){
        let groupedContacts = _.groupBy(this.props.company.companyContacts, (item) => {return item.companyLocation ? item.companyLocation.name : super.translate("Unknown Location")});
        let contacts = [];
        _.forEach(groupedContacts, (value, key) => {
            contacts.push(
                <div key={key} className="uk-margin-small-bottom">
                    <CardHeader title={key} />
                    <ul className="md-list">{this.renderContactList(value)}</ul>
                </div>
            );
        });
        if(contacts.length == 0){
            return null;
        }
        return (
            <Card>
                <OverflowContainer height="700">
                    {contacts}
                </OverflowContainer>
            </Card>

        );
    }
}