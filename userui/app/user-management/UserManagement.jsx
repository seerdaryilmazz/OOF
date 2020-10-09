import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from "susam-components/basic";
import { Card, CardHeader, Grid, GridCell, PageHeader } from "susam-components/layout";
import { AuthorizationService, UserService } from '../services';
import { SearchFilter } from './SearchFilter';
import { UserForm } from './UserForm';
import { UsersTable } from './UsersTable';



export class UserManagement extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            user: null
        }
    }

    componentDidMount(){
        $(window).on('scroll', function(){
            let top = $(this).scrollTop();
            let calculated = top < 68 ? 142-top : 68;
            $(`#userForm`).css("top", `${calculated}px`)
        })
    }

    updateUser(value){
        this.setState({user: value});
    }

    handleSearchClick(filter) {
        UserService.searchUsers(filter).then(response => {
            this.setState({users: response.data, filter: filter});
        }).catch((error) => {
            console.log(error);
            Notify.showError(error);
        });
    }
    handleCreateNewUser(){
        this.setState({user: {_showPasswordField: true}});
    }
    handleEditClick(item) {
        let user = _.cloneDeep(item);
        AuthorizationService.getUserDetails(item.username).then(response => {
            user.graphId = response.data.id;
            user.memberships = response.data.memberships ? response.data.memberships.map(membership => {
                return {
                    id: membership.id,
                    level: membership.level,
                    to: membership.entity,
                    startDate: membership.startDate,
                    endDate: membership.endDate
                }
            }) : [];
            this.setState({user: user});
        }).catch(error => {
            Notify.showError(error);
        });

    }
    handleDeactivateClick(user) {
        UserService.deactivate(user).then(response => {
            Notify.showSuccess("User deactivated");
            this.handleSearchClick(this.state.filter);
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }
    handleActivateClick(user){
        UserService.activate(user).then(response => {
            Notify.showSuccess("User activated");
            this.handleSearchClick(this.state.filter);
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleSaveUserClick(){
        UserService.save(this.state.user).then(response => {
            if(this.state.user.id){
                this.saveUserMemberships();
            }else{
                this.saveUserAuthorization(response.data);
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }
    saveUserAuthorization(userResponse){
        let user = {
            name: userResponse.username,
            externalId: userResponse.id
        };
        AuthorizationService.saveUser(user).then(response => {
            Notify.showSuccess("User saved");
            this.setState({user: userResponse});
        }).catch(error => {
            Notify.showError(error);
        });
    }
    saveUserMemberships(){
        let memberships = this.state.user.memberships.map(membership => {
            return {
                level: membership.level,
                startDate: membership.startDate,
                endDate: membership.endDate,
                entity: membership.to
            };
        });
        AuthorizationService.saveUserMemberships(this.state.user.username, memberships).then(response => {
            Notify.showSuccess("User saved");
            let users = _.cloneDeep(this.state.users);
            if(users){
                let userInSearchResult = _.findIndex(users, {username: this.state.user.username});
                if(userInSearchResult >= 0){
                    users[userInSearchResult] = this.state.user;
                }
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render(){

        return(
            <div>
                <PageHeader title="User Management" />
                <Card style={{minHeight: `${window.innerHeight-150}px`}}>
                    <Grid divider = {true}>
                        <GridCell width="1-2" noMargin = {true}>
                            <Grid>
                                <GridCell width="1-1" noMargin = {true}>
                                    <div className="uk-align-right">
                                        <Button label="Create New" size="small" style="success" onclick = {() => this.handleCreateNewUser()}/>
                                    </div>
                                </GridCell>
                                <GridCell width="1-1">
                                    <SearchFilter onSearch = {(filter) => this.handleSearchClick(filter)}/>
                                </GridCell>
                                <GridCell width="1-1">
                                    <CardHeader title="Users"/>
                                </GridCell>
                                <GridCell width="1-1">
                                    <UsersTable users = {this.state.users}
                                                selectedUser = {this.state.user}
                                                onEdit = {(user) => this.handleEditClick(user)}
                                                onActivate = {(user) => this.handleActivateClick(user)}
                                                onDeactivate = {(user) => this.handleDeactivateClick(user)} />
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-2" noMargin = {true}>
                            <div id="userForm" style={{float: 'left', position: 'fixed', margin:"0 32px 0 8px"}}>
                                <UserForm user = {this.state.user}
                                      onChange = {(value) => this.updateUser(value)}
                                      onSave = {() => this.handleSaveUserClick()}/>
                            </div>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }

}