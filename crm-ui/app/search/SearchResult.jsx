import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Notify } from "susam-components/basic";
import { Grid, GridCell, Loader, Pagination } from "susam-components/layout";
import { CompanyService, CrmSearchService } from '../services';
import { AccountSearchResult } from './AccountSearchResult';
import { AgreementSearchResult } from "./AgreementSearchResult";
import { ContactSearchResult } from './ContactSearchResult';
import { QuoteSearchResult } from './QuoteSearchResult';
import {OpportunitySearchResult} from "./OpportunitySearchResult";


export class SearchResult extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {
            page: 1,
            size: 10,
            documentType:""
        };
    }

    search(query, documentTypes){
        this.setState({busy: true});
        if(query){
            let params = {
                q: query,
                page: this.state.page,
                size: this.state.size,
                documentType: this.state.documentType
            };
            CrmSearchService.search(params).then(response => {

                let result = response.data;
                let companyIds = [];
                let thereIsAtLeastOneAccount = false;

                result.content.forEach((item) => {
                    if (item.documentType == "account") {
                        thereIsAtLeastOneAccount = true;
                        companyIds.push(item.company.id);
                    }
                });

                if (thereIsAtLeastOneAccount) {
                    CompanyService.getDefaultLocations(companyIds).then(defaultLocationsResponse => {
                        let defaultLocations = defaultLocationsResponse.data;
                        result.content.forEach((item) => {
                            if (item.documentType == "account") {
                                let defaultLocation = _.find(defaultLocations, (location) => location.company.id == item.company.id);
                                item.defaultLocation = defaultLocation;
                            }
                        });
                        this.setState({result: result, busy: false});
                    }).catch(error => {
                        Notify.showError(error);
                        this.setState({result: {}, busy: false});
                    });
                } else {
                    this.setState({result: result, busy: false});
                }

            }).catch(error => {
                console.log(error);
                Notify.showError(error);
                this.setState({result: {}, busy: false});
            });
        }
    }

    componentDidMount(){
        this.search(this.props.query);
    }

    componentWillReceiveProps(nextProps){
        if(!_.isEqual(this.props.query, nextProps.query)){
            this.setState({page: 1}, () => this.search(nextProps.query));
        }
    }

    goToPage(page) {
        this.setState({page: page}, () => this.search(this.props.query));
    }

    handleAccountClick(result){
        this.setState({result: result});
    }

    renderSearchResultItem(item){
        if(item.documentType === 'account'){
            return (
                <AccountSearchResult key = {"account-" + item.id}
                                     result = {this.state.result}
                                     account={item}
                                     onAccountClick={(result) =>this.handleAccountClick(result)}/>
            );
        }else if(item.documentType === 'quote'){
            return (
                <QuoteSearchResult key = {"quote-" + item.id} quote={item}/>
            );
        }else if(item.documentType === 'contact'){
            return (
                <ContactSearchResult key = {"contact-" + item.id} contact={item}/>
            );
        }else if(item.documentType === 'agreement'){
            return (
                <AgreementSearchResult key = {"agreement-" + item.id} agreement={item}/>
            )
        }else if(item.documentType === 'opportunity'){
            return (
                <OpportunitySearchResult key = {"opportunity-"+ item.id} opportunity={item}/>
            )
        }
    }

    handleButtonClick(e, documentType){
        if (this.state.documentType == documentType){
            this.setState({documentType: ""}, () => this.search(this.props.query));
        }else{
            this.setState({documentType: documentType}, () => this.search(this.props.query));
        }
    }

    render(){
        if(this.state.busy){
            return <Loader title="Searching"/>
        }
        let result = this.state.result;
        if(!result){
            return null;
        }
        let summary = result.totalElements + " " + super.translate("results") + ", " + result.totalPages + " " + super.translate("pages");
        let results = [];
        if(result.content){
            results = result.content.map(item => {
                return this.renderSearchResultItem(item);
            })
        }

        let [accountClass, quoteClass, contactClass, agreementClass, opportunityClass] = Array(5).fill('md-btn md-btn-block md-btn-flat-primary');

        let [accountCount, quoteCount, agreementCount, contactCount, opportunityCount] = Array(5).fill("");


        let facets = result.facets;
        if(!_.isEmpty(facets)){
            accountCount = _.find(facets[0].terms, {'term': 'account'}) ? `(${_.find(facets[0].terms, {'term': 'account'}).count})` : "";
            quoteCount = _.find(facets[0].terms, {'term': 'quote'}) ? `(${_.find(facets[0].terms, {'term': 'quote'}).count})` : "";
            agreementCount = _.find(facets[0].terms, {'term': 'agreement'}) ? `(${_.find(facets[0].terms, {'term': 'agreement'}).count})` : "";
            contactCount = _.find(facets[0].terms, {'term': 'contact'}) ? `(${_.find(facets[0].terms, {'term': 'contact'}).count})` : "";
            opportunityCount = _.find(facets[0].terms, {'term': 'opportunity'}) ? `(${_.find(facets[0].terms, {'term': 'opportunity'}).count})` : "";
        }
        
        let documentType = this.state.documentType;
        if(documentType){
            if(documentType == "account"){
                accountClass += " uk-active";
            } else if(documentType == "quote"){
                quoteClass += " uk-active";
            } else if(documentType == "contact"){
                contactClass += " uk-active";
            } else if(documentType == "agreement"){
                agreementClass += " uk-active";
            } else if(documentType == "opportunity"){
                opportunityClass += " uk-active";
            }
        }
        
        return (
            <div className="md-card-list-wrapper" id="mailbox">
                <div className="uk-width-large-8-10 uk-container-center">
                    <Grid>
                        <GridCell width="1-5" noMargin={true}>
                            <a className={accountClass}
                               onClick={(e)=> this.handleButtonClick(e, "account")}>{`${super.translate("Account")} ${accountCount}`}</a>
                        </GridCell>
                        <GridCell width="1-5" noMargin={true}>
                            <a className={quoteClass}
                               onClick={(e)=> this.handleButtonClick(e, "quote")}>{`${super.translate("Quote")} ${quoteCount}`}</a>
                        </GridCell>
                        <GridCell width="1-5" noMargin={true}>
                            <a className={contactClass}
                               onClick={(e)=> this.handleButtonClick(e, "contact")}>{`${super.translate("Contact")} ${contactCount}`}</a>
                        </GridCell>
                        <GridCell width="1-5" noMargin={true}>
                            <a className={agreementClass}
                               onClick={(e)=> this.handleButtonClick(e, "agreement")}>{`${super.translate("Agreement")} ${agreementCount}`}</a>
                        </GridCell>
                        <GridCell width="1-5" noMargin={true}>
                            <a className={opportunityClass}
                               onClick={(e)=> this.handleButtonClick(e, "opportunity")}>{`${super.translate("Opportunity")} ${opportunityCount}`}</a>
                        </GridCell>
                    </Grid>
                    <div className="md-card-list">

                        <div className="md-card-list-header heading_list"> {summary}</div>
                        <ul>
                            {results}
                        </ul>
                    </div>
                    <Grid>
                        <GridCell width="1-1">
                            <Pagination page={this.state.page}
                                        totalPages={result.totalPages}
                                        onPageChange={(pageNumber) => this.goToPage(pageNumber)}
                                        range={10}/>
                        </GridCell>
                    </Grid>
                </div>
            </div>
        );
    }
}
SearchResult.contextTypes = {
    translator: PropTypes.object
};


