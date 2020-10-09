import React from "react";
import PropTypes from 'prop-types';
import _ from "lodash";

import {Notify, Button} from "susam-components/basic";
import {Grid, GridCell, Loader} from "susam-components/layout";
import {TranslatingComponent} from "susam-components/abstract";
import {CrmSearchService} from '../services';
import {QuoteSearchResult} from './QuoteSearchResult';

export class AccountSearchResult extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {page: 1, size: 10};
    }

    navigateToAccountView(e, item){
        e.preventDefault();
        this.context.router.push(`/ui/crm/account/${item.id}/view`);
    }

    handleToggleDetails(e, item){
        e.preventDefault();
        let results = _.cloneDeep(this.props.result);
        let selectedItem =_.find(results.content, (result) => item.id == result.id);
        selectedItem._showDetails = !selectedItem._showDetails;
        if(selectedItem._showDetails) {
            let otherItems =_.filter(results.content, (result) => item.id !== result.id);
            otherItems.forEach(result => result._showDetails = false);
            this.props.onAccountClick && this.props.onAccountClick(results);
            this.setState({accountId: selectedItem.id, busy: true}, ()=>this.search());
        }
    }

    search(){
        let request = {
            page: this.state.page,
            size: this.state.size,
            matchFilters: [{name: "Account", val: this.state.accountId}]};
        CrmSearchService.searchDocument(request).then(response => {
            this.setState({result: response.data, busy: false});

        }).catch(error => {
            Notify.showError(error);
            this.setState({result: {}, busy: false});
        });
    }

    previousPage(){
        this.setState({page: --this.state.page});
        this.search(this.props.query);
    }
    nextPage(){
        this.setState({page: ++this.state.page});
        this.search(this.props.query);
    }

    renderQuoteResults(item){
        if(item._showDetails){
            if(this.state.busy){
                return <Loader title="Searching"/>
            }
            if(!this.state.result){
                return null;
            }
            let results = [];
            if(this.state.result.content){
                results = this.state.result.content.map(item => {
                    return (
                        <QuoteSearchResult key = {item.id} quote={item}/>
                    );})
            }
            let nextPage = null;
            let prevPage = null;
            if(!this.state.result.last){
                nextPage = <Button label="Next Page" style="primary" size="medium" waves = {true} onclick = {() => this.nextPage()}/>;
            }
            if(!this.state.result.first){
                prevPage = <Button label="Previous Page" style="primary" size="medium" waves = {true} onclick = {() => this.previousPage()}/>
            }
            let summary = this.state.result.totalElements + " " + super.translate("results") + ", " + this.state.result.totalPages + " " + super.translate("pages");
            let pageInfo = (this.state.result.number + 1) + "/" + this.state.result.totalPages;

            return (
                <div key={"account-" + item.id} className="md-card-list-wrapper" id="aa">
                    <div className="uk-width-large-8-10 uk-container-center">
                        <div className="md-card-list">
                            <div className="md-card-list-header heading_list"> {summary}</div>
                            <ul>
                                {results}
                            </ul>
                        </div>
                        <Grid>
                            <GridCell width="1-3"/>
                            <GridCell width="1-3">
                                <div class="uk-button-group">
                                    {prevPage}
                                    {nextPage}
                                </div>
                            </GridCell>
                            <GridCell width="1-3">
                                <div className="uk-align-right">
                                    <h3>{pageInfo}</h3>
                                </div>
                            </GridCell>
                        </Grid>
                    </div>
                </div>
            );
        }

    }

    renderDefaultLocation(account) {
        let defaultLocation = account.defaultLocation;
        if (defaultLocation) {
            let administrativeAreas = [];
            if (defaultLocation.postaladdress.district) {
                administrativeAreas.push(defaultLocation.postaladdress.district);
            }
            if (defaultLocation.postaladdress.city) {
                administrativeAreas.push(defaultLocation.postaladdress.city);
            }
            administrativeAreas.push(defaultLocation.postaladdress.country.countryName);
            // Format: PostalCode - District/City/Country
            let displayedString = defaultLocation.postaladdress.postalCode + " - " + _.join(administrativeAreas, '/');
            return (
                <span className="uk-text-small uk-text-italic">
                    {displayedString}
                </span>
            );
        } else {
            return null;
        }
    }

    render(){
        let item = this.props.account;
        let icon;
        if(!_.isEmpty(this.props.account.details)&& this.props.account.details.global==true){
            icon=<i className="uk-icon-globe" style={{color:"blue", padding: "0 8px", fontSize: "170%"}} title="GLOBAL"/>;
        }
        return (
            <li style={{margin: "0px", minHeight: "34px"}}>
                <div onClick={(e) => this.handleToggleDetails(e, item)}>
                    <Grid>
                        <GridCell width="1-10" noMargin={true}>
                            <div className="md-card-list-item-avatar-wrapper">
                                <span className="md-card-list-item-avatar md-bg-orange">Ac</span>
                            </div>
                        </GridCell>
                        <GridCell width="4-10" noMargin={true}>
                            <div className="md-card-list-item-subject">
                                <span>{item.name}{icon}</span>
                                {this.renderDefaultLocation(item)}
                            </div>
                        </GridCell>
                        <GridCell width="1-10" noMargin={true}>
                            <div className="md-card-list-item-subject">
                                <span>{item.accountType ? item.accountType.name : ""}</span>
                            </div>
                        </GridCell>
                        <GridCell width="1-10" noMargin={true}>
                            <div className="md-card-list-item-subject">
                                <span>{item.segment ? item.segment.name : ""}</span>
                            </div>
                        </GridCell>
                        <GridCell width="2-10" noMargin={true}>
                            <div className="md-card-list-item-subject">
                                <span>{item.accountOwner}</span>
                            </div>
                        </GridCell>
                        <GridCell width="1-10" noMargin={true}>
                            <div className="uk-align-right">
                                <Button name = {super.translate("View")} icon="eye"flat={true}
                                        size="small"  onclick = {(e) => this.navigateToAccountView(e, item)} />
                            </div>
                        </GridCell>
                    </Grid>
                    {this.renderQuoteResults(item)}
                </div>
            </li>
        );
    }
}
AccountSearchResult.contextTypes = {
    translator: PropTypes.object,
    router: PropTypes.object.isRequired
};

