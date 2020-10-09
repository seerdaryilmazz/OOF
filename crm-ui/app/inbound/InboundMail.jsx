import * as axios from 'axios';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { DropDown, Form, Notify } from 'susam-components/basic';
import { Button } from 'susam-components/basic/Button';
import { Grid, GridCell } from 'susam-components/layout';
import { Card } from 'susam-components/layout/Card';
import { LoaderWrapper } from 'susam-components/layout/Loader';
import { AccountManager } from '../account';
import { AccountSearchAutoComplete } from '../common';
import { CrmInboundService } from '../services';

export class InboundMail extends TranslatingComponent {
    tabContent = {
        selectAccount: {
            key: 'selectAccount',
            label: "Select Account",
            component: () => <DropDown 
                label="Account"
                required={true}
                options={this.state.accounts}
                labelField="name"
                valueField="id"
                value={this.state.account}
                onchange={value => this.setState({ account: value })} />
        },
        searchAccount: {
            key: 'searchAccount',
            label: "Search Account",
            component: () => <AccountSearchAutoComplete 
                label="Account"
                required={true}
                value={this.state.account}
                onchange={value => this.setState({ account: value })} />
        },
        newAccount: {
            key: 'newAccount',
            label: "New Account",
            component: () => <AccountManager 
                route={{options: {mode: 'new', noCard: true}}}
                redirectOnCreate={false}
                onAccountCreated={account => this.setState({ account: account, active: 'searchAccount' })} />
        }
    }

    state = {
        tabs: [],
        active: 'selectAccount'
    };

    constructor(props) {
        super(props);
        this.init();
    }

    generateTabs(accounts) {
        let tabs = [this.tabContent.newAccount, this.tabContent.searchAccount]
        if (!_.isEmpty(accounts)) {
            tabs.push(this.tabContent.selectAccount);
        }
        return _.reverse(tabs);
    }

    renderTabs() {
        return (
            <Card>
                <Grid>
                    <GridCell width="1-1">
                        <div className="md-btn-group">
                            {this.state.tabs.map(tab => <Button key={tab.key}
                                onclick={() => this.setState({ active: tab.key, account: undefined, newCompany: false })}
                                style={tab.key === this.state.active && "primary"}
                                label={tab.label} flat={true} />
                            )}
                        </div>
                    </GridCell>
                </Grid>
                {this.renderTabContent()}
            </Card>
        );
    }

    renderTabContent() {
        let content = _.find(this.state.tabs, i => i.key === this.state.active);
        if (content) {
            let fullContent = (
                <Grid>
                    <GridCell width="1-1">
                        {content.component()}
                    </GridCell>
                    {this.renderOtherInfo()}
                </Grid>);
            if ('newAccount' !== this.state.active) {
                return (
                    <Form ref={c => this.form = c} >
                        {fullContent}
                    </Form>)
            }
            return fullContent;
        }
        return null;
    }

    listQuoteTypes(){
        if(!this.state.serviceArea){
            this.setState({
                quoteTypes: [], 
                quoteType: undefined
            });
            return;
        }

        CrmInboundService.getLookup("quote-type", {serviceArea: this.state.serviceArea.code}).then(response=>{
            this.setState({
                quoteTypes: response.data,
                quoteType: undefined
            });
        }).catch(error=>Notify.showError(error));
    }

    init() {
        axios.all([
            CrmInboundService.getLookup("service-area"),
            CrmInboundService.getInbound(this.props.params.id)
        ]).then(axios.spread((serviceArea, inbound) => {
            this.setState({
                serviceAreas: serviceArea.data,
                quoteTypes: [],
                inbound: inbound.data
            });
            return CrmInboundService.findAccount(inbound.data.message.from);
        })).then(response => {
            let tabs = this.generateTabs(response.data);
            this.setState({
                accounts: response.data,
                account: this.defaultValue(response.data),
                tabs: tabs,
                active: tabs[0].key
            });
        });
    }

    defaultValue(options) {
        if(!_.isEmpty(options) && 1 === options.length){
            return _.first(options);
        }
        return null;
    }

    handleProposeQuote() {
        if(this.form && !this.form.validate()){
            return;
        }
        let params = {
            quoteType: _.get(this.state, 'quoteType.code'),
            serviceArea: _.get(this.state, 'serviceArea.code'),
            account: _.get(this.state, 'account.id'),
            inbound: _.get(this.state, 'inbound.id')
        };
        CrmInboundService.proposeQuote(params).then(response => {
            window.location = response.data;
        }).catch(e => Notify.showError(e));
    }

    renderOtherInfo() {
        if ('newAccount' === this.state.active) {
            return [];
        }
        return [
            <GridCell width="1-2" key={0}>
                <DropDown label="Service Area"
                    required={true}
                    value={this.state.serviceArea}
                    options={this.state.serviceAreas}
                    onchange={value => this.setState({ serviceArea: value }, () => this.listQuoteTypes())}
                    labelField="name"
                    valueField="code" />
            </GridCell>,
            <GridCell width="1-2" key={1}>
                <DropDown label="Quote Type"
                    required={true}
                    value={this.state.quoteType}
                    options={this.state.quoteTypes}
                    onchange={value => this.setState({ quoteType: value })}
                    labelField="name"
                    valueField="code" />
            </GridCell>,
            <GridCell width="1-1" key={2}>
                <Button label="Propose Quote" fullWidth={true} style="primary" onclick={() => this.handleProposeQuote()} />
            </GridCell>
        ];
    }

    render() {
        return (
            <LoaderWrapper busy={_.isNil(this.state.accounts)}>
                {this.renderTabs()}
            </LoaderWrapper>);
    }
}

InboundMail.contextTypes = {
    user: React.PropTypes.object,
    router: React.PropTypes.object.isRequired,
    translator: React.PropTypes.object
};