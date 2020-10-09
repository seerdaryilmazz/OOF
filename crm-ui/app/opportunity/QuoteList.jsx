import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, LoaderWrapper, Pagination, Card } from "susam-components/layout";
import { QuoteTypePrinter, QuoteStatusPrinter } from '../common';
import { CrmSearchService } from '../services';
import { ActionHeader } from '../utils';

export class QuoteList extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            page: 1, size: 10,
            quotes: { content: null }
        };
    }

    componentDidMount() {
        if(this.props.opportunityId){
            this.retrieveQuotes(1);
        }
    }

    componentDidUpdate(prevProps){
        if(!_.isEqual(this.props.opportunityId, prevProps.opportunityId)){
            this.retrieveQuotes(1);
        }
    }

    handleViewQuote(data){
        this.context.router.push(`/ui/crm/quote/view/${data.id}`);
    }

    retrieveQuotes(pageNumber) {
        let params = {
            page: pageNumber - 1,
            quoteAttributeKey: "opportunity",
            quoteAttributeValue: `${this.props.opportunityId}`
        };
        CrmSearchService.searchQuotes(params).then(response=> {
            this.setState({
                quotes: response.data,
                pageNumber: pageNumber,
                pageCount: response.data.totalPages
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    getActionHeaderTools(){
        return [];
    }

    renderQuotes() {
        if(!this.props.opportunityId){
            return null
        } else {
            return (
                <Grid divider={true}>
                    <GridCell width="1-1">
                        <DataTable.Table data={this.state.quotes.content}>
                            <DataTable.Text header="Number" field="number"/>
                            <DataTable.Text header="Quadro Number" field="mappedIds.QUADRO"/>
                            <DataTable.Text header="Name" field="name" printer={new QuoteNamePrinter()}/>
                            <DataTable.Badge header="Type" field="type.name" printer={new QuoteTypePrinter(this)}/>
                            <DataTable.Text header="Status" field="status.name" translator={this}
                                            printer={new QuoteStatusPrinter(this)}/>
                            <DataTable.Text header="Pay Weight" field="payWeight"/>
                            <DataTable.Text header="Created By" field="createdBy" reRender={true}
                                            printer={new UserPrinter(this.context.getUsers())}/>
                            <DataTable.ActionColumn width={1}>
                                <DataTable.ActionWrapper key="viewQuote" track="onclick"
                                                         onaction={(data) => this.handleViewQuote(data)}>
                                    <Button icon="eye" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                    <GridCell width="1-1">
                        <Pagination totalElements={this.state.quotes.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={this.state.pageCount}
                                    onPageChange={(pageNumber) => this.retrieveQuotes(pageNumber)}
                                    range={10}/>
                    </GridCell>
                </Grid>
            );
        }
    }

    render() {
        if(!this.props.readOnly){
            return null;
        }
        return (
            <Card>
                <ActionHeader title="Related Quotes" tools={this.getActionHeaderTools()} removeTopMargin={true}/>
                <LoaderWrapper busy={this.state.busy} title="" size="S">
                    {this.renderQuotes()}
                </LoaderWrapper>
            </Card>
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
