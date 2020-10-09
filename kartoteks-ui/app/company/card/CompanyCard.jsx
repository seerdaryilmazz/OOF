import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify, Span } from 'susam-components/basic';
import { Card, CardHeader, Grid, GridCell, Loader } from "susam-components/layout";
import uuid from 'uuid';
import { withAuthorization } from '../../security';
import { CrmAccountService } from '../../services/CrmAccountService';
import { CompanyService } from '../../services/KartoteksService';
import { UserService } from '../../services/UserService';
import { FabToolbar } from '../FabToolbar';
import { CompanyContacts } from './CompanyContacts';
import { CompanyLocations } from './CompanyLocations';
import { CompanyRelations } from './CompanyRelations';





const SecuredFabToolbar = withAuthorization(FabToolbar, ["kartoteks.company.move-location","kartoteks.company.edit-company","kartoteks.company.edit-temp-company"], {hideWhenNotAuthorized: true});

export class CompanyCard extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {busy: true};
    }

    initialize(props){
        this.setState({busy: true});
        CompanyService.getCompany(props.params.companyId).then(response => {
            let company = response.data;
            company.companyContacts = _.sortBy(company.companyContacts, [(item) => item.firstName + item.lastName]);
            let callback = (account) => {
                company.account = account;
                this.setState({company: company, busy: false});
            };
            let callbackOnError = (error) => {
                Notify.showError(error);
                this.setState({busy: false});
            };
            this.findAccount(props.params.companyId, callback, callbackOnError);
        }).catch(error => {
            Notify.showError(error);
            this.setState({busy: false});
        });
    }

    findAccount(companyId, callback, callbackOnError) {
        CrmAccountService.findAccountByCompany(companyId, false).then(accountResponse => {
            let account = accountResponse.data;
            if (account && account.accountOwner) {
                let username = account.accountOwner;
                UserService.findUser(username).then(userResponse => {
                    account.accountOwner = userResponse.data;
                    callback(account);
                }).catch(error => {
                    callbackOnError(error);
                });
            } else {
                callback(null);
            }
        }).catch(error => {
            callbackOnError(error);
        });
    }

    componentDidMount(){
        this.initialize(this.props);
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.params.companyId !== this.props.params.companyId){
            this.initialize(nextProps);
        }
    }

    componentDidUpdate(){

    }
    handleEditButtonClick(e){
        e.preventDefault();
        CompanyService.ensureUpdateIsAllowed(this.state.company.id).then(response => {
            let url = "/ui/kartoteks/company/" + this.state.company.id + "/edit";
            let origin = this.getOrigin();
            if (origin) {
                url += "?origin=" + origin;
            }
            this.context.router.push(url);
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleMoveButtonClick(e){
        e.preventDefault();
        this.context.router.push('/ui/kartoteks/company/' + this.state.company.id + "/move-location");
    }
    handleLocationExpand(item){
        item._expand = !item._expand;
        let index = _.findIndex(this.state.company.companyLocations, {id: item.id});
        if(index != -1){
            let company = _.cloneDeep(this.state.company);
            company.companyLocations[index] = item;
            this.setState({company: company});
        }
    }
    handleContactExpand(item){
        item._expand = !item._expand;
        let index = _.findIndex(this.state.company.companyContacts, {id: item.id});
        if(index != -1){
            let company = _.cloneDeep(this.state.company);
            company.companyContacts[index] = item;
            this.setState({company: company});
        }
    }

    handleSaveLocation(location, modal) {
        let company = _.cloneDeep(this.state.company);
        if (location.id) {
            let index = _.findIndex(company.companyLocations, i => i.id === location.id);
            company.companyLocations[index] = location;
        } else {
            company.companyLocations.push(location);
        }
        CompanyService.saveCompany(company).then(response => {
            modal && modal.close();
            setTimeout(()=>this.initialize(this.props), 510);
            
        }).catch(error => Notify.showError(error));
    }

    getOrigin() {
        if (this.props.location.query && this.props.location.query.origin) {
            return this.props.location.query.origin;
        } else {
            return null;
        }
    }
    renderHeader(){
        let countryName = this.state.company.country ? this.state.company.country.countryName : "";
        let name = this.state.company.shortName ? this.state.company.shortName : this.state.company.name;
        let localName = this.state.company.name == this.state.company.localName ? "" :  this.state.company.localName;
        let fullName = this.state.company.shortName ? this.state.company.name : "";
        let logoUrl = this.state.company.logoFilePath ? baseResourceUrl + "/company-images/" + this.state.company.logoFilePath
            : baseResourceUrl + "/assets/img/logo-placeholder.png";
        let ownedByEkol = this.state.company.ownedByEkol ? ("(" + super.translate("Owned By Ekol") + ")") : "";
        let website = this.state.company.website && this.state.company.website.startsWith("https") ? this.state.company.website : ("http://" +  this.state.company.website);
        let actions = (
            <SecuredFabToolbar actions = {[
                {name:"Move Location", icon: "edit_location", onAction: (e) => this.handleMoveButtonClick(e), operationName:"kartoteks.company.move-location"},
                {name:"Edit", icon: "edit", onAction: (e) => this.handleEditButtonClick(e), operationName: ["kartoteks.company.edit-company", "kartoteks.company.edit-temp-company"]}
            ]}/>
        );

        return (
            <div className="user_heading">
                <div className="user_heading_avatar">
                    <div className="thumbnail">
                        <img src={logoUrl} />
                    </div>
                </div>
                <div className="user_heading_content" style = {{padding: "0 0 0 0"}}>
                    <h2 className="heading_b uk-margin-bottom">
                        <span className="uk-text-truncate">{name} {ownedByEkol}</span>
                        <span className="sub-heading">{fullName}</span>
                        <span className="sub-heading">{localName}</span>
                        <span className="sub-heading">{countryName}</span>
                        <span className="sub-heading"><a target="_blank" href={website}>{this.state.company.website}</a></span>
                    </h2>
                </div>
                {actions}
            </div>
        );
    }

    renderRole(role){
        let roles = _.filter(this.state.company.roles, (item) => {return item.roleType.code == role.code});
        let result = "";
        if(roles.length > 0){
            result =
                <div>
                    <h5 className="uk-margin-small-bottom uk-text-upper">{super.translate(role.name)}</h5>
                    <div>
                        {
                            roles.map(item => {
                                return <i className="uk-badge" title={"since " + item.dateRange.startDate}>{item.segmentType.name}</i>;
                            })
                        }
                    </div>
                </div>;
        }
        return result;
    }
    renderRolesCard(){
        let groupedByRole = _.groupBy(this.state.company.roles, (item) => {return item.roleType.name});
        let roles = [];
        _.forEach(groupedByRole, (value, key) => {
            let role =
                <div key = {key} className="uk-margin-small-bottom">
                    <h3 className="heading_c uk-margin-small-bottom">{key}</h3>
                    <ul className="md-list">
                        {value.map(item => {
                            return (
                                <li key = {item.id}>
                                    <div className="md-list-content">
                                        <span className="md-list-heading">{item.segmentType.name}</span>
                                        <span className="uk-text-small uk-text-muted uk-text-truncate">
                                            {super.translate("since")} {item.dateRange.startDate}
                                        </span>
                                    </div>
                                </li>
                            );
                        })
                        }
                    </ul>
                </div>;
            roles.push(role);
        });

        return (
            <GridCell width="1-1" noMargin = {true}>
                <Card>
                    {roles}
                </Card>
            </GridCell>
        );
    }
    render(){
        if(this.state.busy){
            return <Loader title="Fetching Company"/>;
        }
        let responsibles = [];
        if (this.state.company.account) {
            let accountOwner = this.state.company.account.accountOwner;
            responsibles.push({
                header: accountOwner.displayName + " (" + accountOwner.username +")",
                details: super.translate("Account Owner")
            });
        }
        let customerRoles = _.filter(this.state.company.roles, item => {return item.roleType.code == "CUSTOMER"});
        customerRoles.forEach(item => {
            item.employeeRelations.forEach(relation => {
                responsibles.push({
                    header: relation.employeeAccount,
                    details: relation.relation.name,
                    badge: item.segmentType ? item.segmentType.name : ""
                });
            })
        });
        let relations = [];
        let activeAgentRelations = _.filter(this.state.company.activeRelations, (item) => {return item.relationType.code == "ZCPG01"});
        let hasAgents = activeAgentRelations.map(item => {
            return <a key = {item.id} href="#" className="uk-margin-left" onClick = {(e) => this.handleRedirect(e, item.passiveCompany)}>{item.passiveCompany.name}</a>;
        });
        if(hasAgents.length > 0){
            relations.push(<p key = "hasAgent"><i className="uk-badge uk-badge-outline">{super.translate("Has Agents")}</i>{hasAgents}</p>);
        }

        let passiveAgentRelations = _.filter(this.state.company.passiveRelations, (item) => {return item.relationType.code == "ZCPG01"});
        let isAgentOf = passiveAgentRelations.map(item => {
            return <a key = {item.id} href="#" className="uk-margin-left" onClick = {(e) => this.handleRedirect(e, item.activeCompany)}>{item.activeCompany.name}</a>;
        });
        if(isAgentOf.length > 0){
            relations.push(<p key = "isAgentOf"><i className="uk-badge uk-badge-outline">{super.translate("Is Agent Of")}</i>{isAgentOf}</p>);
        }

        let responsibleCard = null;
        if(responsibles.length > 0){
            responsibleCard =
                <GridCell width="1-1" noMargin = {true}>
                    <Card>
                    <CardHeader title = "Responsibles" />
                    <ul className="md-list uk-margin-remove">
                        {responsibles.map(item => {
                            let badge = item.badge ? <i className="uk-badge uk-badge-outline">{item.badge}</i> : null;
                            return (
                                <li key = {uuid.v4()}>
                                    <div className="md-list-content">
                                        <span className="md-list-heading uk-text-truncate">{item.header}</span>
                                        <span className="uk-text-small uk-text-muted">{item.details} {badge}</span>

                                    </div>
                                </li>
                            );
                        })}

                    </ul>
                    </Card>
                </GridCell>;
        }

        let sectors = this.state.company.sectors.map(item => {
            let label = item.sector.parent ? item.sector.parent.name + "/" + item.sector.name : item.sector.name;
            return <i key = {item.sector.id} className="uk-badge uk-badge-primary uk-margin-right">{label}</i>;
        });
        let taxOffice = null;
        if(this.state.company.taxOffice){
            taxOffice =
                <GridCell width="1-4" >
                    <Span label="Tax Office" value = {this.state.company.taxOffice.name} />
                </GridCell>;
        }
        let taxOfficeCode = null;
        if(this.state.company.taxOfficeCode){
            taxOfficeCode =
                <GridCell width="1-4" >
                    <Span label="Tax Office Code" value = {this.state.company.taxOfficeCode} />
                </GridCell>;
        }
        let taxId = null;
        if(this.state.company.taxId){
            taxId =
                <GridCell width="1-4" >
                    <Span label="Tax ID" value = {this.state.company.taxId} />
                </GridCell>;
        }
        let tckn = null;
        if(this.state.company.tckn){
            tckn =
                <GridCell width="1-4" >
                    <Span label="TCKN" value = {this.state.company.tckn} />
                </GridCell>;
        }


        return (

            <Grid>
                <GridCell width="7-10">
                    <div className="md-card">
                        {this.renderHeader()}
                        <div className="user_content">
                            <Grid>
                                <GridCell width="1-1" noMargin = {true} style = {{marginTop: "-24px"}}>
                                    {sectors}
                                </GridCell>
                                <GridCell width="1-1" >
                                        <CompanyRelations company = {this.state.company}/>
                                </GridCell>
                                {taxOffice}
                                {taxOfficeCode}
                                {taxId}
                                {tckn}
                                <GridCell width="1-1">
                                    <CompanyLocations company = {this.state.company}
                                                      onSave = {(location, modal)=>this.handleSaveLocation(location, modal)}
                                                      onExpand = {(item) => this.handleLocationExpand(item)}/>
                                </GridCell>
                            </Grid>
                        </div>
                    </div>
                </GridCell>
                <GridCell width="3-10">
                    <Grid>
                        {responsibleCard}
                        <GridCell width="1-1" noMargin = {responsibleCard == null}>
                            <CompanyContacts company = {this.state.company}
                                             onExpand = {(item) => this.handleContactExpand(item)}/>
                        </GridCell>
                    </Grid>
                </GridCell>
            </Grid>

        );
    }
}
CompanyCard.contextTypes = {
    router: PropTypes.object.isRequired
};