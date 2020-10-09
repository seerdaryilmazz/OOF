import React from 'react';

import {TranslatingComponent} from 'susam-components/abstract';
import {Modal} from 'susam-components/layout';
import {PhoneNumberUtils} from 'susam-components/utils/PhoneNumberUtils';

export class ContactDetailsModal extends TranslatingComponent{
    constructor(props){
        super(props);
    }

    open(){
        this.modal && this.modal.open();
    }

    renderPhoneNumbers(){
        let {data} = this.props;
        if(data.phoneNumbers.length === 0){
            return <div className="uk-margin-left uk-margin-top">{super.translate("No phone numbers")}</div>;
        }
        let counter = 0;
        let phoneNumberList = data.phoneNumbers.map(phone => {
            let isPhoneDefault = phone.default ? <i className="uk-badge uk-text-small uk-badge-success uk-margin-left">{super.translate("Default")}</i> : "";
            let numberType = "";
            if(phone.numberType.code === "FAX"){
                numberType =  <i className="md-list-addon-icon uk-icon-fax " style = {{fontSize: "120%"}} title={super.translate("Fax")} data-uk-tooltip="{pos:'bottom'}"/>;
            }else if(phone.numberType.code === "PHONE"){
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

        return <div className="md-list-content"><ul className="md-list md-list-addon">{phoneNumberList}</ul></div>;
    }

    renderEmails(){
        let {data} = this.props;
        if(data.emails.length === 0){
            return <div className="uk-margin-left">{super.translate("No emails")}</div>;
        }
        let counter = 0;
        let emailList = data.emails.map(email => {
            let isEmailDefault = email.default ? <i className="uk-badge uk-text-small uk-badge-success uk-margin-left">{super.translate("Default")}</i> : "";
            let usageType = <i className="uk-badge uk-text-small uk-badge-outline uk-margin-left">{email.usageType.name}</i>;
            return (
                <li key = {counter++}>
                    <div className="md-list-addon-element">
                        <i className="md-list-addon-icon uk-icon-at" style = {{fontSize: "120%"}} title="Email" data-uk-tooltip="{pos:'bottom'}"/>
                    </div>
                    <div className="md-list-content">
                                    <span className="md-list-heading">
                                        <a href = {"mailto:" + email.email.account + "@" + email.email.domain}>
                                            {email.email.account + "@" + email.email.domain}
                                            </a>
                                        {isEmailDefault}
                                        {usageType}
                                    </span>
                    </div>
                </li>
            );
        });
        return <div className="md-list-content"><ul className="md-list md-list-addon">{emailList}</ul></div>;
    }

    render(){
        if(!this.props.data){
            return null;
        }
        let {data} = this.props;
        let department = data.department ? data.department.name : super.translate("No Department");
        let title = data.title ? data.title.name : super.translate("No title");
        let isDefault = data.default ? <i className="uk-badge uk-text-small uk-badge-success uk-margin-left">{super.translate("Default")}</i> : "";
        let types = _.defaultTo(data.companyServiceTypes,[]).map(type => {
            return <i key = {type.name} className="uk-badge uk-badge-outline uk-text-small uk-margin-right">{type.name}</i>;
        });
        let gender = "";
        if(data.gender.code === "MALE"){
            gender = <i className="uk-icon-mars uk-icon-medsmall uk-margin-left" title={super.translate("Male")} data-uk-tooltip="{pos:'bottom'}" />;
        }else if(data.gender.code === "FEMALE"){
            gender = <i className="uk-icon-venus uk-icon-medsmall uk-margin-left" title={super.translate("Female")} data-uk-tooltip="{pos:'bottom'}"/>;
        }
        return(
            <Modal ref={(c) => this.modal = c}
                   closeOtherOpenModals = {false}
                   actions={[
                       {label:"Close", action:() => this.modal.close()}
                   ]}>


                <div className="uk-text-bold">{data.firstName} {data.lastName} {gender} {isDefault} </div>
                <div className="uk-text-small uk-text-muted uk-margin-small-top">
                    {title}, {department}
                </div>
                <div className="uk-margin-small-top">{types}</div>

                {this.renderPhoneNumbers()}
                {this.renderEmails()}

            </Modal>
        );
    }

}