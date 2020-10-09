import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, LoaderWrapper, Pagination } from "susam-components/layout";
import { QuoteTypePrinter, QuoteStatusPrinter } from '../common';
import { CrmSearchService } from '../services';
import { ActionHeader } from '../utils';
import { QuoteSearchPanel } from "./QuoteSearchPanel";

const QUOTE_MENU_SERVICE_AREA_MAP = {
    SPOT: [
        'ROAD', 'SEA', 'AIR', 'DTR'
    ],
    LONG_TERM: [
        'CCL', 'WHM', 'ROAD', 'SEA', 'AIR', 'DTR'
    ],
    TENDER: [
        'WHM', 'ROAD'
    ]
}
export class QuoteList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            page: 1, size: 10,
            searchParams: {},
            searchResult: { content: null }
        };
    }

    componentDidMount() {
        this.search(1, this.props.account.id, this.props.serviceArea);
    }

    componentWillReceiveProps(nextProps){
        let isAccountIdChanging = !_.isEqual(nextProps.account.id, this.props.account.id);
        let isServiceAreaChanging = !_.isEqual(nextProps.serviceArea, this.props.serviceArea);
        if (isAccountIdChanging || isServiceAreaChanging) {
            if (isServiceAreaChanging) {
                // serviceArea değerine göre değişen veya gösterilmeyen alanlar olduğundan arama kriterlerini de sıfırlıyoruz.
                this.setState({searchParams: {}}, () => this.search(1, nextProps.account.id, nextProps.serviceArea));
            } else {
                this.search(1, nextProps.account.id, nextProps.serviceArea);
            }
        }
    }

    handleViewQuote(data){
        this.context.router.push(`/ui/crm/quote/view/${data.id}`);
    }

    search(pageNumber, accountId, serviceArea) {

        let searchParams = this.state.searchParams;
        let params = {
            page: pageNumber - 1,
            accountId: accountId,
            serviceAreaCode: serviceArea
        };

        if (_.isNumber(searchParams.number)) {
            params.number = searchParams.number;
        }
        if (!_.isNil(searchParams.type)) {
            params.typeCode = searchParams.type.code;
        }
        if (!_.isNil(searchParams.createdBy)) {
            params.createdBy = searchParams.createdBy.username;
        }
        if (!_.isNil(searchParams.account)) {
            params.accountId = searchParams.account.id;
        }
        if (!_.isNil(searchParams.status)) {
            params.statusCode = searchParams.status.code;
        }
        if (!_.isEmpty(searchParams.minUpdateDate)) {
            params.minUpdateDate = searchParams.minUpdateDate;
        }
        if (!_.isEmpty(searchParams.maxUpdateDate)) {
            params.maxUpdateDate = searchParams.maxUpdateDate;
        }
        if (!_.isEmpty(searchParams.minCreatedAt)) {
            params.minCreatedAt = searchParams.minCreatedAt;
        }
        if (!_.isEmpty(searchParams.maxCreatedAt)) {
            params.maxCreatedAt = searchParams.maxCreatedAt;
        }
        if (!_.isEmpty(searchParams.fromCountry)) {
            params.fromCountry = searchParams.fromCountry.iso;
        }
        if (!_.isEmpty(searchParams.toCountry)) {
            params.toCountry = searchParams.toCountry.iso;
        }
        if (!_.isEmpty(searchParams.fromPoint)) {
            params.fromPoint = searchParams.fromPoint.id;
        }
        if (!_.isEmpty(searchParams.toPoint)) {
            params.toPoint = searchParams.toPoint.id;
        }
        if (!_.isNil(searchParams.shipmentLoadingType)) {
            params.shipmentLoadingType = searchParams.shipmentLoadingType.code;
        }

        // CrmQuoteService.searchQuotes(params).then(response => {
        CrmSearchService.searchQuotes(params).then(response=> {
            this.setState({
                searchResult: response.data,
                pageNumber: pageNumber,
                pageCount: response.data.totalPages
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    routeToQuoteForm(type){
        this.context.router.push(`/ui/crm/quote/new/${type}/${this.props.serviceArea}/${this.props.account.id}`);
    }

    handleSearchParamsChange(value) {
        this.setState({searchParams: value});
    }

    handleSearchParamsClear() {
        this.setState({searchParams: {}}, () => {
            this.search(1, this.props.account.id, this.props.serviceArea)
        });
    }

    showOrHideSearchPanel() {
        this.quoteSearchPanel.showOrHideSearchPanel();
    }

    get menuItems(){
        let { serviceArea } = this.props;
        let items = []
        for(let key in QUOTE_MENU_SERVICE_AREA_MAP) {
            QUOTE_MENU_SERVICE_AREA_MAP[key].includes(serviceArea) && items.push(key);
        } 
        return items;
    }

    getActionHeaderTools(){
        let actionHeaderTools = [];
        actionHeaderTools.push({icon: "search", flat: true, items: [{label: "", onclick: () => this.showOrHideSearchPanel()}]});
        let items = this.menuItems.map(item => ({label: _.startCase(item.toLowerCase()), onclick: () => this.routeToQuoteForm(item)}));
        actionHeaderTools.push({title: "New Quote", items });
        return actionHeaderTools;
    }

    renderQuotes() {
        let content;

        if (_.isEmpty(this.state.searchResult.content)) {
            content = (
                <GridCell width="1-1">
                    {super.translate("No quote")}
                </GridCell>
            );
        } else {
            content = (
                <GridCell width="1-1">
                    <DataTable.Table data={this.state.searchResult.content}>
                        <DataTable.Text header="Number" field="number"/>
                        <DataTable.Text header="Quadro Number" field="mappedIds.QUADRO"/>
                        <DataTable.Text header="Name" field="name" printer={new QuoteNamePrinter()}/>
                        <DataTable.Badge header="Type" field="type.name" printer={new QuoteTypePrinter(this)}/>
                        <DataTable.Text header="Status" field="status.name" translator={this}
                                        printer={new QuoteStatusPrinter(this)}/>
                        <DataTable.Text header="Pay Weight" field="payWeight"/>
                        <DataTable.Text header="Created By" field="createdBy" reRender={true}
                                        printer={new UserPrinter(this.context.getAllUsers())}/>
                        <DataTable.ActionColumn width={1}>
                            <DataTable.ActionWrapper key="viewQuote" track="onclick"
                                                     onaction={(data) => this.handleViewQuote(data)}>
                                <Button icon="eye" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            );
        }
        return (
            <div>
                {content}
                <Pagination totalElements={this.state.searchResult.totalElements}
                                page={this.state.pageNumber}
                                totalPages={this.state.pageCount}
                                onPageChange={(pageNumber) => this.search(pageNumber, this.props.account.id, this.props.serviceArea)}
                                range={10}/>
            </div>
        );
    }

    render(){
        return (
            <div>
                <QuoteSearchPanel ref={c => this.quoteSearchPanel = c}
                                  serviceArea={this.props.serviceArea}
                                  searchParams={this.state.searchParams}
                                  onSearchParamsChange={(value) => this.handleSearchParamsChange(value)}
                                  onSearchParamsClear={() => this.handleSearchParamsClear()}
                                  onSearchClick={() => this.search(1, this.props.account.id, this.props.serviceArea)}/>
                <ActionHeader title="Quotes" tools={this.getActionHeaderTools()} removeTopMargin={true}
                              operationName={["crm-quote.create"]}
                              className="uk-accordion-title"/>
                <div className="uk-accordion-content uk-accordion-initial-open">
                    <LoaderWrapper busy={this.state.busy} title="" size="S">
                            {this.renderQuotes()}
                    </LoaderWrapper>
                </div>
            </div>
        );
    }
}

QuoteList.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
    user: React.PropTypes.object,
    router: PropTypes.object.isRequired,
    translator: PropTypes.object
};

class QuoteNamePrinter {
    constructor(){
    }
    print(data){
        data=data.substring(data.indexOf('From')); //Deletes everything before 'From'
        if(data.length>35){
            data = data.substring(0, 32) + "...";
        }
        return data;
    }
}

class UserPrinter{
    constructor(userList){
        this.userList=userList || [];
    }
    print(data){
        return _.get(_.find(this.userList, u=>u.username == data),'displayName');
    }  
}
