import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip } from "susam-components/advanced";
import { Button, Notify, TextArea, TextInput } from 'susam-components/basic';
import { Grid, GridCell, PageHeader } from "susam-components/layout";
import { CompanyService, CrmAccountService } from "../services";
import { EmailUtils } from '../utils/EmailUtils';
import {RichTextEditor} from "./RichTextEditor";

const EMAIL_SEPARATOR = ";";

export class SimpleEmailForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        let data = _.cloneDeep(props.data);
        this.state = {
            emailsForTo: null,
            emailsForCc: null,
            to: data.to,
            cc: data.cc,
            bcc: data.bcc,
            subject: data.subject,
            body: data.body
        };
    }

    componentDidMount() {
        this.initialize();
    }

    initialize() {
        if(this.props.quote.type.code=="SPOT"){
            this.retrieveAccountContactIds();
            this.retrieveUsers();
        }
    }

    retrieveUsers() {
        this.setState({ users: this.context.getUsers() }, ()=>this.sanitizeCcEmails());
    };

    sanitizeCcEmails() {
        let ccEmails = [];
        this.state.users.forEach(user => {
            let fullName=user.displayName+ "<" + user.email + ">";
            ccEmails.push({fullName: fullName, email:user.email});
        });
        this.setState({emailsForCc: ccEmails}, () => this.initializeCcEmails())
    }

    initializeCcEmails() {
        let initialCcEmails = [];

        let accountOwner = _.find(this.state.users, {username: this.props.account.accountOwner});
        if(accountOwner){
            initialCcEmails.push(accountOwner.email);
        }

        let createdBy = _.find(this.state.users, {username: this.props.quote.createdBy});
        if(createdBy){
            initialCcEmails.push(createdBy.email);
        }
        this.setState({cc: initialCcEmails});
    }

    retrieveAccountContactIds() {
        this.setState({busy: true});
        CrmAccountService.retrieveContacts(this.props.quote.account.id).then(response => {
            let accountContacts = response.data.map(item=>item.companyContactId);
            this.setState({busy: false}, () => this.retrieveAccountContacts(accountContacts));
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    retrieveAccountContacts(accountContacts) {
        if(_.isEmpty(accountContacts)){
            return;
        }
        this.setState({busy: true});
        CompanyService.getContactsByAccount(accountContacts).then(response => {
            this.setState({busy: false, contacts: response.data}, () => this.sanitizeToEmails());
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    sanitizeToEmails() {
        let accountContacts = _.cloneDeep(this.state.contacts);
        let quoteContactId = _.get(this.props.quote,'contact.id');
        let formattedToEmails = [];
        let initialToEmails = [];

        accountContacts.forEach(contact => {
            let fullName = contact.fullname
            contact.emails.forEach(item => {
                let email=EmailUtils.format(item.email);
                let finalName = fullName + "<" + email + ">";
                formattedToEmails.push({fullName: finalName, email: email});
            });


            if (contact.id == quoteContactId) {
                //Teklifteki contact'ın mail adresini, Account içindeki contact'lardan bulur.
                initialToEmails.push(_.last(formattedToEmails));
            }
        });

        this.setState({emailsForTo: formattedToEmails, to: initialToEmails});
    }

    updateProperty(propertyName, propertyValue) {
        this.setState({[propertyName]: propertyValue});
    }

    cancel() {
        this.props.onCancel();
    }

    /**
     * @param addressType to, cc, bcc
     * @param addressString aaa@bbb.com;ccc@ddd.com;eee@fff.com
     */
    validateAddressesAndConvertToArray(addressType, addressString) {
        if(this.props.quote.type.code=="SPOT"&&(addressType==="to"||addressType==="cc")){
            //to ve cc den gelen veri farklı(<Chip>) olduğu için buraya uyarlıyoruz.
            let mails="";
            for(let i=0;i<addressString.length;i++){
                if(_.isObject(addressString[i])){
                    mails+=addressString[i].email+";";
                }else{
                    mails+=addressString[i]+";";
                }
            }
            addressString=mails;
        }

        let addresses = [];

        if (!_.isNil(addressString) && addressString.trim().length > 0) {
            addresses = addressString.trim().split(EMAIL_SEPARATOR);
        }

        _.remove(addresses, (address) => {
            return address.trim().length == 0;
        });

        let addressCount = addresses.length;

        if (addressCount == 0) {
            if (addressType == "to") {
                return {
                    valid: false,
                    message: "At least one address must be specified in the to field."
                };
            }
        } else {
            if (addressCount > 10) {
                return {
                    valid: false,
                    message: "At most 10 addresses can be specified in the " + addressType + " field."
                };
            } else {
                let invalidAddresses = [];
                for (let i = 0; i < addressCount; i++) {
                    addresses[i] = addresses[i].trim();
                    if (!EmailUtils.validateEmail(addresses[i])) {
                        invalidAddresses.push(addresses[i]);
                    }
                }
                if (invalidAddresses.length > 0) {
                    return {
                        valid: false,
                        message: "Check the addresses in the " + addressType + " field, these are not valid: " + invalidAddresses.join(", ")
                    };
                }
            }
        }
        return {
            valid: true,
            addresses: addresses
        };
    }

    send() {

        let state = _.cloneDeep(this.state);

        let toAddressesResult = this.validateAddressesAndConvertToArray("to", state.to);
        if (!toAddressesResult.valid) {
            Notify.showError(toAddressesResult.message);
            return;
        }

        let ccAddressesResult = this.validateAddressesAndConvertToArray("cc", state.cc);
        if (!ccAddressesResult.valid) {
            Notify.showError(ccAddressesResult.message);
            return;
        }

        let bccAddressesResult = this.validateAddressesAndConvertToArray("bcc", state.bcc);
        if (!bccAddressesResult.valid) {
            Notify.showError(bccAddressesResult.message);
            return;
        }

        if (_.isNil(state.subject) || state.subject.trim().length == 0) {
            Notify.showError("Subject cannot be empty.");
            return;
        }

        if (state.subject.length > 255) {
            Notify.showError("Subject can contain at most 255 characters.");
            return;
        }

        if (_.isNil(state.body) || state.body.trim().length == 0) {
            Notify.showError("Body cannot be empty.");
            return;
        }

        if(this.props.quote.type.code=="TENDER"){
            if (state.body.length > 20000) {
                Notify.showError("Body can contain at most 20000 characters.");
                return;
            }
        }else{
            if (state.body.length > 5000) {
                Notify.showError("Body can contain at most 5000 characters.");
                return;
            }
        }

        let data = _.cloneDeep(this.props.data);
        data.to = toAddressesResult.addresses;
        data.cc = ccAddressesResult.addresses;
        data.bcc = bccAddressesResult.addresses;
        data.subject = state.subject;
        data.body = state.body;

        this.props.onSend(data);
    }

    renderTo(){
        if(this.props.quote.type.code=="SPOT"){
            return(
                <Chip label="To" create={true} hideSelectAll={true} valueField="email" labelField="fullName"
                      value={this.state.to} options={this.state.emailsForTo}
                      onchange={(value) => this.updateProperty("to", value)}
                      placeholder={"Enter email addresses"}/>
            )
        }else{
            return(
                <TextInput label="To"
                           value={this.state.to}
                           onchange={(value) => this.updateProperty("to", value)}
                           placeholder={"Use " + EMAIL_SEPARATOR + " to separate addresses"}/>
            )
        }
    }

    renderCc(){
        if(this.props.quote.type.code=="SPOT"){
            return(
                <Chip label="Cc" create={true} hideSelectAll={true}
                      value={this.state.cc} options={this.state.emailsForCc} valueField="email" labelField="fullName"
                      onchange={(value) => this.updateProperty("cc", value)}
                      placeholder={"Enter email addresses"}/>
            )
        }else{
            return(
                <TextInput label="Cc"
                           value={this.state.cc}
                           onchange={(value) => this.updateProperty("cc", value)}
                           placeholder={"Use " + EMAIL_SEPARATOR + " to separate addresses"}/>
            )
        }
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <PageHeader title={this.props.title}/>
                </GridCell>
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="1-1">
                            {this.renderTo()}
                        </GridCell>
                        <GridCell width="1-1">
                            {this.renderCc()}
                        </GridCell>
                        <GridCell width="1-1">
                            <TextInput label="Bcc"
                                       value={this.state.bcc}
                                       onchange={(value) => this.updateProperty("bcc", value)}
                                       placeholder={"Use " + EMAIL_SEPARATOR + " to separate addresses"}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <TextInput label="Subject"
                                       value={this.state.subject}
                                       onchange={(value) => this.updateProperty("subject", value)}/>
                        </GridCell>
                        <GridCell width="1-1">
                            {this.props.asHtml ?
                                <RichTextEditor label="Body" value={this.state.body}
                                                asHtml={true}
                                                onChange={(value) => this.updateProperty("body", value)}
                                /> :
                                <TextArea label="Body"
                                          value={this.state.body}
                                          onchange={(value) => this.updateProperty("body", value)}
                                          noAutoSize={true}
                                          rows="8"/>}
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                         <Button label="Send" style="success" waves={true} onclick={() => this.send()}/>
                        <Button label="Cancel" style="danger" waves={true} onclick={() => this.cancel()}/>
                        
                    </div>
                </GridCell>
            </Grid>
        );
    }
}

SimpleEmailForm.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
}