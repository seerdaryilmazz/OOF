import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from "react-dom";
import { Helmet } from 'react-helmet';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from "susam-components/basic";
import { Card, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { ActivityList } from "../activity";
import { AccountAgreementList } from "../agreement";
import { ContactList } from "../contact";
import { OpportunityList } from "../opportunity";
import { PotentialList } from "../potential";
import { QuoteList } from "../quote";
import { CompanyService, CrmAccountService } from '../services';
import { LoadingIndicator, ObjectUtils } from '../utils';
import { Account } from "./";
import _ from "lodash";

export class AccountManager extends TranslatingComponent {
    static defaultProps = {
        redirectOnCreate: true
    };

    state = {
        serviceArea: 'ROAD',
        account: {
            accountType: {}
        },
        company: undefined,
        companyBlockage: undefined
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.retrieveAccountInfo();

    }

    componentWillReceiveProps(nextProps) {
        if (!_.get(nextProps,'params.accountId')) {
            this.setState({account: {accountType: {}}, company: null, companyBlockage: null});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        this.initAccordion();
        if (!_.isEqual(prevProps.params, this.props.params)) {
            this.retrieveAccountInfo();
        }
    }

    initAccordion() {
        if(this.acc){
            let options = {
                showfirst: false,
                collapse: false,
            };
            var accordion = UIkit.accordion(ReactDOM.findDOMNode(this.acc), options);
            accordion.find('.uk-accordion-initial-open').parent().each(function (index) {
                if ('false' === UIkit.$(this).attr('aria-expanded')) {
                    accordion.toggleItem(UIkit.$(this), false, false); // animated true and collapse false
                }
            });
            accordion.update();
        }
    }

    retrieveAccountInfo() {
        let accountId=null;
        if(_.get(this.props,'params.accountId')){
            accountId = this.props.params.accountId;
        }else if(_.get(this.state,'account.account.id')){
            accountId = this.state.account.id;
        }
        if (accountId) {
            this.setState({busy: true});
            CrmAccountService.getAccountById(accountId).then(response => {
                let account = response.data;
                account.readOnly = true;
                this.retrieveCompany(account.company.id, account);
            }).catch(error => {
                this.setState({busy: false});
                console.log(error);
                Notify.showError(error);
            });
        }
    }

    retrieveCompany(companyId, account) {
        this.setState({busy: true});
        let state = _.cloneDeep(this.state);
        CompanyService.getCompany(companyId).then(response => {
            let company = response.data;
            this.setState({
                account: account ? account : state.account,
                company: company,
                busy: false
            }, () => this.retrieveGlobalAccountInfo());
            return CrmAccountService.getCompanyBlockage(companyId);
        }).then(response => {
            this.setState({companyBlockage: response.data});
        }).catch(error => {
            this.setState({busy: false});
            console.log(error);
            Notify.showError(error);
        });
    }

    retrieveGlobalAccountInfo() {
        let details = _.cloneDeep(this.state.account.details);
        if (!_.isEmpty(details) && !_.isNil(details.globalAccountId)) {
            this.setState({busy: true});
            CrmAccountService.getAccountById(details.globalAccountId).then(response => {
                this.setState({globalAccount: response.data, busy: false});
            }).catch(error => {
                this.setState({busy: false});
                console.log(error);
                Notify.showError(error);
            });
        }
    }

    updateState(key, value, callback) {
        let setStateCallback = () => {
            if (callback) {
                callback();
            }
        };
        let state = _.cloneDeep(this.state);
        _.set(state, key, value);
        this.setState(state, setStateCallback);
    }

    handleAccountChange(account){
        if(account.id){
            if(this.props.redirectOnCreate){
                this.updateState("account", account, () => this.context.router.push(`/ui/crm/account/${account.id}/view`));
            }
            this.props.onAccountCreated && this.props.onAccountCreated(account);
        }else{
            this.updateState("account", account);
        }
    }

    handleServiceAreaChange(e, value) {
        e.stopPropagation();
        this.setState({serviceArea: value})
    }

    goToAccountPage(id) {
        window.open(`/ui/crm/account/${id}/view`, "_blank");
    }

    renderAccountForm() {
        return (
            <Account options = {this.props.route.options}
                        account={this.state.account}
                        company={this.state.company}
                        onAccountChange={(account) => this.handleAccountChange(account)}
                        onCompanyChange={(value) => this.retrieveCompany(value)}
                        onEditCancel={()=>this.retrieveAccountInfo()}/>

        );
    }

    renderServiceAreas() {
        if (!(this.state.account && this.state.account.id)) {
            return null;
        }
        let [roadButtonClass, seaButtonClass, airButtonClass, domesticButtonClass, customsButtonClass, warehouseButtonClass] = Array(6).fill('md-btn md-btn-flat md-btn-block md-btn-flat-primary');

        if (this.state.serviceArea === "ROAD") {
            roadButtonClass += " uk-active";
        } else if (this.state.serviceArea === "SEA") {
            seaButtonClass += " uk-active";
        } else if (this.state.serviceArea === "AIR") {
            airButtonClass += " uk-active";
        } else if (this.state.serviceArea === "DTR") {
            domesticButtonClass += " uk-active";
        } else if (this.state.serviceArea === "CCL") {
            customsButtonClass += " uk-active";
        }
        else if (this.state.serviceArea === "WHM" ) {
            warehouseButtonClass += "uk-active";
        }
        return (
            <GridCell width="1-1">
                <Grid>
                    <GridCell width="1-6" noMargin={true}>
                        <a className={roadButtonClass}
                           onClick={(e) => this.handleServiceAreaChange(e, "ROAD")}>{super.translate("Road")}</a>
                    </GridCell>
                    <GridCell width="1-6" noMargin={true}>
                        <a className={seaButtonClass}
                           onClick={(e) => this.handleServiceAreaChange(e, "SEA")}>{super.translate("Sea")}</a>
                    </GridCell>
                    <GridCell width="1-6" noMargin={true}>
                        <a className={airButtonClass}
                           onClick={(e) => this.handleServiceAreaChange(e, "AIR")}>{super.translate("Air")}</a>
                    </GridCell>
                    <GridCell width="1-6" noMargin={true}>
                        <a className = {warehouseButtonClass}
                            onClick= {(e) => this.handleServiceAreaChange(e, "WHM")} > {super.translate("WAREHOUSE")}</a>
                    </GridCell>
                    <GridCell width="1-6" noMargin={true}>
                        <a className={domesticButtonClass}
                           onClick={(e) => this.handleServiceAreaChange(e, "DTR")}>{super.translate("Domestic")}</a>
                    </GridCell>
                    <GridCell width="1-6" noMargin={true}>
                        <a className={customsButtonClass}
                           onClick={(e) => this.handleServiceAreaChange(e, "CCL")}>{super.translate("Customs")}</a>
                    </GridCell>

                </Grid>
            </GridCell>
        );
    }

    renderPotentialList() {
        if ( 'DTR' !== this.state.serviceArea && 'WHM' !==this.state.serviceArea) {
            return (
                <Card>
                    <PotentialList account={this.state.account}
                                   serviceArea={this.state.serviceArea}/>
                </Card>
            );
        }
    }

    renderLists(component, key){
        if(!this.context.getOption(key, false)){
            return null;
        }
        let props = {
            account: this.state.account
        };
        return <Card>{React.createElement(component, props)}</Card>
    }

    renderAccountRelationships() {
        if (!(this.state.account && this.state.account.id)) {
            return null;
        }
        return (
            <div>
                <Card>
                    <ContactList account={this.state.account}
                                 company={this.state.company}
                                 onChange={(data) => this.updateState("company.companyContacts", data)}/>
                </Card>
                {this.renderLists(AccountAgreementList, "ENABLE_AGREEMENT")}
                {this.renderLists(OpportunityList, "ENABLE_OPPORTUNITY")}
                {this.renderServiceAreas()}
                <Card>
                    <QuoteList account={this.state.account}
                               serviceArea={this.state.serviceArea}/>
                </Card>
                <Card>
                    <ActivityList account={this.state.account}
                                  serviceArea={this.state.serviceArea}/>
                </Card>
                {this.renderPotentialList()}
            </div>
        );
    }

    renderIcon() {
        if (!_.isEmpty(this.state.account)) {
            if (!_.isEmpty(this.state.account.details) && this.state.account.details.global == true) {
                return (
                    <i className="uk-icon-globe" style={{color: "blue", padding: "0 8px", fontSize: "150%"}}
                       title="GLOBAL"/>
                )
            } else if (!_.isEmpty(this.state.globalAccount)) {
                let title = "Member of " + this.state.globalAccount.name;
                return (
                    <a><i className="uk-icon-dot-circle-o" style={{color: "blue", padding: "0 8px", fontSize: "130%"}}
                          title={title} onClick={() => this.goToAccountPage(this.state.globalAccount.id)}/></a>
                )
            } else {
                return null;
            }
        }
    }

    renderCompanyBlockage() {
        if (!this.state.companyBlockage) {
            return;
        }
        if (this.state.companyBlockage.code === 'NO_BLOCKAGE') {
            return;
        }
        return <div className={"uk-alert uk-alert-danger"} style={{padding:"10px"}}>{`${super.translate("Has Blockage")}: ${this.translate(this.state.companyBlockage.name)}`} </div>
    }

    render() {
        let account = this.state.account;
        let title = account.id ? `${super.translate("Account") + " - " + account.name}` : `${super.translate("New Account")}`;
        return (
            <div>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <LoadingIndicator busy={this.state.busy}/>

                <div style={{top:"36px", right:"22px", left:"262px", paddingTop:"25px",position:"fixed",zIndex:999,background:"#eeeeee"}}>
                    <Grid>
                        <GridCell width="3-4" noMargin={true}>
                            <PageHeader title={account ? account.name : null}
                                        icon={this.renderIcon()}/>
                        </GridCell>
                        <GridCell width="1-4" noMargin={true}>
                            {this.renderCompanyBlockage()}
                        </GridCell>
                    </Grid>
                </div>
                <div className="uk-accordion" ref={c=>this.acc=c}>
                    {this.renderAccountForm()}
                    {this.renderAccountRelationships()}
                </div>
            </div>
        );
    }
}

AccountManager.contextTypes = {
    getOption: PropTypes.func,
    router: PropTypes.object.isRequired,
    translator: PropTypes.object
};

