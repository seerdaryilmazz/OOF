import * as axios from 'axios';
import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Form, Notify, Span, TextInput } from "susam-components/basic";
import { Grid, GridCell, Modal } from "susam-components/layout";
import { AuthorizationService, UserService } from '../services';
import { UserMembership } from './UserMembership';
import { UserLoginSearch} from '../user-login/UserLoginSearch'


export class UserForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            user: {}
        };
    }

    componentDidMount() {
        axios.all([
            AuthorizationService.getAllNodeLabelsForAuthorization(),
            UserService.getUserAuthenticationTypes(),
            UserService.getTimeZones()
        ]).then(axios.spread((nodeLabels, authTypes, timezones) => {
            this.setState(
                {
                    nodeLabels: nodeLabels.data,
                    authTypes: authTypes.data,
                    timezones: timezones.data
                }
            );
        })).catch((error) => {
            Notify.showError(error);
        });
    }

    updateUser(key, value){
        let user = _.cloneDeep(this.props.user);
        user[key] = value;
        this.props.onChange && this.props.onChange(user);
    }

    handleGetUserInfoClick(username){
        if(!username){
            Notify.showError("Please enter an account to search");
            return;
        }
        UserService.getUserInfo(username).then(response => {
            let user = _.cloneDeep(this.props.user);
            user.username = response.data.username;
            user.displayName = response.data.displayName;
            user.phoneNumber = response.data.phoneNumber;
            user.mobileNumber = response.data.mobileNumber;
            user.sapNumber = response.data.sapNumber;
            user.thumbnail = response.data.thumbnail;
            user.email = response.data.email;
            user.office = response.data.office;
            this.props.onChange && this.props.onChange(user);
            if(user.office){
                this.getOfficeTimezone(user.office);
            }
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    getOfficeTimezone(office){
        UserService.getOfficeTimezone(office).then(response => {
            if(response.data){
                let user = _.cloneDeep(this.props.user);
                user.timeZoneId = response.data;
                this.props.onChange && this.props.onChange(user);
            }
        }).catch(error => {
            Notify.showError(error);
        })
    }

    handleGeneratePassword(){
        let user = _.cloneDeep(this.props.user);
        user.password = this.generatePassword();
        this.props.onChange && this.props.onChange(user);
    }
    handleResetPassword(){
        let user = _.cloneDeep(this.props.user);
        user.password = this.generatePassword();
        user._showPasswordField = true;
        this.props.onChange && this.props.onChange(user);
    }
    generatePassword(){
        let length = 32,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            password = "";

        for (let i = 0; i < length; i++) {
            password += charset.charAt(_.random(0, charset.length));
        }
        return password;
    }
    handleTogglePassword(){
        this.setState({showPassword: !this.state.showPassword});
    }

    handleSave(){
        if(!this.form.validate()){
            return;
        }
        this.props.onSave && this.props.onSave();
    }

    renderDatabaseUser(){
        let passwordComponent = <Button label="Reset password" style="success"
                                        size="small" onclick = {() => this.handleResetPassword()} />;
        if(this.props.user._showPasswordField){
            passwordComponent =
                <Grid>
                    <GridCell width="3-4" noMargin = {true}>
                        <TextInput label="Password" required = {true} password = {!this.state.showPassword}
                                   value = {this.props.user.password}
                                   onchange = {(value) => this.updateUser("password", value)}
                                   button = {{style:"success",
                                       label: this.state.showPassword ? "hide" : "show",
                                       onclick: () => {this.handleTogglePassword()}}
                                   }/>
                    </GridCell>
                    <GridCell width="1-4" noMargin = {true}>
                        <Button label="Generate password" style="success" flat = {true}
                                size="small" onclick = {() => this.handleGeneratePassword()} />
                    </GridCell>
                </Grid>;
        }
        return(
            <Grid>
                <GridCell width="1-2">
                    <TextInput label="Username" required = {true}
                               value = {this.props.user.username}
                               onchange = {(value) => this.updateUser("username", value)} />
                </GridCell>
                <GridCell width="1-2">
                    <TextInput label="Description" required = {true}
                               value = {this.props.user.displayName}
                               onchange = {(value) => this.updateUser("displayName", value)} />
                </GridCell>
                <GridCell width="1-1">
                    <DropDown label="Timezone" value = {this.props.user.timeZoneId} required = {true}
                              options = {this.state.timezones}
                              onchange = {(value) => this.updateUser("timeZoneId", value.id)}/>
                </GridCell>
                <GridCell width="1-1">
                    {passwordComponent}
                </GridCell>
            </Grid>
        );
    }

    renderUserInfo(){
        let thumbnailSrc = baseResourceUrl + "/assets/img/user-placeholder.png";
        if(this.props.user.thumbnail){
            thumbnailSrc = "data:image/jpeg;base64," + this.props.user.thumbnail
        }else if(this.props.user.thumbnailPath){
            thumbnailSrc = baseResourceUrl + "/user-images/" + this.props.user.thumbnailPath;
        }
        let refreshButton = null;
        if(this.props.user.id){
            refreshButton =
                <Button label="Refresh User Info" size="small" style="success"
                            onclick = {() => this.handleGetUserInfoClick(this.props.user.username)}/>

        }
        return(
            <Grid>
                <GridCell width="4-5">
                    <Grid>
                        <GridCell width="1-3">
                            <Span label="Name" value = {this.props.user.displayName}/>
                        </GridCell>
                        <GridCell width="1-3">
                            <Span label="Username" value = {this.props.user.username}/>
                        </GridCell>
                        <GridCell width="1-3">
                            <Span label="SAP Number" value = {this.props.user.sapNumber}/>
                        </GridCell>
                        <GridCell width="1-3">
                            <Span label="Email" value = {this.props.user.email}/>
                        </GridCell>
                        <GridCell width="1-3">
                            <Span label="Phone" value = {this.props.user.phoneNumber}/>
                        </GridCell>
                        <GridCell width="1-3">
                            <Span label="Mobile" value = {this.props.user.mobileNumber}/>
                        </GridCell>
                        <GridCell width="1-3">
                            <Span label="Office" value = {this.props.user.office}/>
                        </GridCell>
                        <GridCell width="1-3">
                            <DropDown label="Timezone" value = {this.props.user.timeZoneId} required = {true}
                                      options = {this.state.timezones}
                                      onchange = {(value) => this.updateUser("timeZoneId", value.id)}/>
                        </GridCell>
                        <GridCell width="1-3">
                            <div className="uk-margin-top">
                            {refreshButton}
                            </div>
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-5">
                    <Grid>
                        <GridCell>
                            <img src = {thumbnailSrc} style = {{width:"96px", height: "auto"}} />       
                        </GridCell>
                        <GridCell />
                        {"ACTIVE_DIRECTORY" === _.get(this.props.user, 'authenticationType.code') && 
                        <GridCell>
                            <div className="uk-margin-top">
                                <Button label="login info" flat={true} size="small" style="warning" 
                                    onclick={()=>this.setState({loginInfoModalState: true}, ()=>this.loginInfoModal.open())} />
                            </div>
                        </GridCell>}
                    </Grid>
                </GridCell>
            </Grid>
        );
    }

    renderActiveDirectoryUser(){

        let userInfo = null;
        if(this.props.user.id || this.props.user.displayName){
            userInfo = this.renderUserInfo();
        }
        let domainSearch = null;
        if(!this.props.user.id){
            domainSearch =
                <Grid>
                <GridCell width="1-2" noMargin = {true}>
                    <TextInput label="Domain account to search"
                               value = {this.state.accountToSearch}
                               onchange = {(value) => this.setState({accountToSearch: value})} />
                </GridCell>
                <GridCell width="1-2">
                    <Button label="Get User Info" size="small" style="success" flat = {true}
                            onclick = {() => this.handleGetUserInfoClick(this.state.accountToSearch)}/>
                </GridCell>
                </Grid>;
        }
        return(
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    {domainSearch}
                </GridCell>
                <GridCell width="1-1">
                    {userInfo}
                </GridCell>
            </Grid>
        );
    }

    render(){
        if(!this.props.user){
            return null;
        }
        let user = null;
        let authenticationType = _.get(this.props.user, "authenticationType.code");
        if(authenticationType == "PASSWORD"){
            user = this.renderDatabaseUser();
        }else if(authenticationType == "ACTIVE_DIRECTORY"){
            user = this.renderActiveDirectoryUser();
        }

        let authType = null;
        let memberships = null;
        if(!this.props.user.id){
            authType =
                <GridCell width="1-1" noMargin = {true}>
                    <DropDown label="Authentication Type" options = {this.state.authTypes}
                              value = {this.props.user.authenticationType}
                              onchange = {(value) => this.updateUser("authenticationType", value)}/>
                </GridCell>;
        }else{
            memberships = <UserMembership user = {this.props.user}
                                          onChange = {(memberships) => this.updateUser("memberships", memberships)}/>
        }
        return(
            <Grid collapse={true} smallGutter={true}>
                {authType}
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                    {user}
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    {memberships}
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Save" style="primary" size="small" onclick = {() => this.handleSave()} />
                    </div>
                </GridCell>
                <GridCell>
                    <Modal ref={c=>this.loginInfoModal=c} onclose={()=>this.setState({loginInfoModalState: false})}>
                        {this.state.loginInfoModalState &&
                        <UserLoginSearch username={this.props.user.username} />}
                    </Modal>
                </GridCell>
            </Grid>
        );
    }

}