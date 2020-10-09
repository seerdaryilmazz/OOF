import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Checkbox, TextInput, Button, Span, Notify} from "susam-components/basic";
import {Grid, GridCell} from 'susam-components/layout';
import {Chip} from "susam-components/advanced";
import {OutlookService} from '../services';
import {DocumentList} from "./DocumentList";
import {RichTextEditor} from "./RichTextEditor";

export class Mail extends TranslatingComponent{

    constructor(props) {
        super(props);
        this.state = {mail: {}};
    }

    componentDidMount(){
        this.adjustInitialValue();
    }

    adjustInitialValue(){
        let mail = _.cloneDeep(this.state.mail);
        mail.sender = {
            id: this.context.user.id,
            name: this.context.user.displayName,
            emailAddress: this.context.user.email
        }
        mail.subject = this.props.subject;
        mail.body = {contentType: 'Html', content: this.props.content};
        mail.internalRecipients = this.props.internalRecipients;
        mail.externalRecipients = this.props.externalRecipients;
        mail.attachments = this.props.attachments;
        this.setState({mail: mail})
    }

    updateState(key, value){
        let mail = _.cloneDeep(this.state.mail);
        _.set(mail, key, value)
        this.setState({mail: mail})
    }

    handleMailSend(){
        if(this.checkIfRecipientsValid()){
            this.checkIfOutlookAccountIsValid();
        }
    }

    checkIfRecipientsValid(){
        let invalidRecipients = [];
        if(this.state.mail.internalRecipients){
            this.state.mail.internalRecipients.forEach(item => {
                if(!item.emailAddress){
                    invalidRecipients.push(item.name);
                }
            });
        }
        if(this.state.mail.externalRecipients){
            this.state.mail.externalRecipients.forEach(item => {
                if(!item.emailAddress){
                    invalidRecipients.push(item.name);
                }
            });
        }
        if(!_.isEmpty(invalidRecipients)){
            Notify.showError(`User(s)/Contact(s): ` + invalidRecipients.join() + ` do not have email information. `);
            return false;
        }
        return true;
    }

    checkIfOutlookAccountIsValid(){
        let params = {
            sender: this.state.mail.sender.emailAddress
        };
        OutlookService.checkIfAccountIsValid(params).then(response => {
            if(response.data){
                this.sendMail();
            }else{
                this.getOutlookLoginUrl();
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }

    getOutlookLoginUrl(){
        let height = 640;
        let width = 800;
        let left = (window.innerWidth-width)/2;
        let top = (window.innerHeight-height)/2;
        let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${width},height=${height},left=${left},top=${top}`;
        OutlookService.getLoginUrl().then(response => {
            window.open(response.data, '_blank', params);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    sendMail(){
        OutlookService.sendMail(this.state.mail).then(response => {
           Notify.showSuccess("Mail send successfully");
           this.setState({mail: {}}, ()=>this.props.onClose());
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render(){
        if(_.isEmpty(this.state.mail.body)){
            return null;
        }
        return (
            <Grid>
                <GridCell width="3-5">
                    <Grid>
                        <GridCell width="1-2">
                            <Checkbox label="Send note to my outlook mailbox" value={this.state.mail.sendNoteToSender}
                                      onchange={(data) => {this.updateState("sendNoteToSender", data)}}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <Chip options={this.props.users} label="Internal Recipients"
                                  value={this.state.mail.internalRecipients}
                                  hideSelectAll={true}
                                  onchange={(data) => {this.updateState("internalRecipients", data)}}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <Chip options={this.props.contacts} label="External Recipients"
                                  value={this.state.mail.externalRecipients}
                                  onchange={(data) => {this.updateState("externalRecipients", data)}}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <TextInput label="Subject"
                                       value={this.state.mail.subject} required={true}
                                       onchange={(data) => {this.updateState("subject", data)}}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <RichTextEditor label="Content"
                                            asHtml={true}
                                            minHeight="200px"
                                            value={this.state.mail.body.content}
                                            readOnly={this.props.readOnly}
                                            onChange={(content) => this.updateState("body.content", content)}/>
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="2-5">
                    <Grid>
                        <GridCell width="1-1">
                           <Span label="Attachments"/>
                        </GridCell>
                        <GridCell width="1-1">
                            <DocumentList documents = {this.state.mail.attachments}
                                          onTheFly={true}
                                          operations={this.props.operations}
                                          onChange={(value) => this.updateState("attachments", value)}/>
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Send" flat={true}
                                onclick = {() => this.handleMailSend()}/>
                        <Button label="Close" flat={true}
                                onclick = {() => this.setState({mail: {}}, ()=>this.props.onClose())}/>
                    </div>
                </GridCell>
            </Grid>

        );
    }
}

Mail.contextTypes = {
    user: React.PropTypes.object,
};

