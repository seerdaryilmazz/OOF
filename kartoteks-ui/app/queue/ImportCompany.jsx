import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify, Span, TextInput } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, CardHeader, Grid, GridCell, LoaderWrapper, PageHeader } from "susam-components/layout";
import { withAuthorization } from '../security';
import { CompanyService, ImportQueueService } from '../services/KartoteksService';



const SecuredCard = withAuthorization(Card, "kartoteks.import-queue.import-company");
const SecuredMergeButton = withAuthorization(Button, "kartoteks.company.merge-with-queue", {hideWhenNotAuthorized:true});
const SecuredCreateButton = withAuthorization(Button, "kartoteks.company.create-company", {hideWhenNotAuthorized:true});

export class ImportCompany extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.initialize(this.props);
    }

    initialize(props){
        if(props.params.queueId){
            this.startQueueImport(props.params.queueId);
        }
        if(props.params.companyId){
            this.getCompanyItem(props.params.companyId);
        }
    }
    startQueueImport(queueId){
        ImportQueueService.startQueueImport(queueId).then(response => {
            if(response.data.alreadyStarted){
                this.setState({startedBy: response.data.startedBy});
            }else{
                this.getQueueItem(this.props.params.queueId);
                this.getCompanyFromQueue(this.props.params.queueId);
            }

        }).catch(error => {
            Notify.showError(error);
        });
    }
    getQueueItem(queueId){
        this.setState({busy: true});
        ImportQueueService.getQueueItem(queueId).then(response => {
            this.setState({queueItem: response.data, busy: false});

        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });

    }
    getCompanyItem(companyId){
        this.setState({busy: true});
        CompanyService.getCompany(companyId).then(response => {
            let companyFromQueue = response.data;
            companyFromQueue.defaultAddress = this.findDefaultAddress(companyFromQueue);
            this.setState({companyFromQueue: companyFromQueue, busy: false});
            this.getTaxOfficeDetails(response.data);
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }
    getCompanyFromQueue(queueId){
        ImportQueueService.getCompanyFromQueue(queueId).then(response => {
            let companyFromQueue = response.data;
            companyFromQueue.defaultAddress = this.findDefaultAddress(companyFromQueue);
            this.setState({companyFromQueue: companyFromQueue});
            this.getTaxOfficeDetails(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }
    getTaxOfficeDetails(company){
        if(company.taxOffice){
            CompanyService.getTaxOffice(company.taxOffice.code).then(response => {
                this.setState({taxOfficeDetails: response.data});
            }).catch(error => {
                Notify.showError(error);
            });
        }else{
            this.setState({taxOfficeDetails: {}});
        }
    }
    handleContinueClick(){
        this.setState({startedBy: null}, () => {
            this.getQueueItem(this.props.params.queueId);
            this.getCompanyFromQueue(this.props.params.queueId);
        });
    }
    handleBackToQueueClick(){
        this.context.router.push('/ui/kartoteks/import-queue');
    }
    findDefaultAddress(company){
        let address = "";
        company.companyLocations.forEach(item => {
            if(item.default){
                address = item.postaladdress.country.iso + "-" + item.postaladdress.postalCode + "," + item.postaladdress.city + " " + item.postaladdress.streetName;
            }
        });
        return address;
    }

    renderWarning(){
        return (
            <Card>
                <Grid>
                    <GridCell width="1-1">
                        <div className = "uk-width-medium-1-1 uk-text-large uk-text-center">
                            {super.translate("This import job is in progress, started by user ")}
                            <span className = "uk-text-bold">{this.state.startedBy}</span>
                        </div>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className = "uk-width-medium-1-1 uk-text-large uk-text-center">
                            {super.translate("Do you want to continue ?")}
                            </div>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className = "uk-width-medium-1-1 uk-text-center">
                            <Button label="No (Back to Queue)" style = "danger" size = "small"
                                    onclick = {() => this.handleBackToQueueClick()} />
                            <Button label="yes" style = "success" size = "small"
                                    onclick = {() => this.handleContinueClick()} />
                        </div>
                    </GridCell>
                </Grid>
            </Card>
        );
    }

    render(){
        let content = null;
        if(this.state.startedBy){
            content = this.renderWarning();
        }else{
            let search = null;
            if(this.state.companyFromQueue && this.state.taxOfficeDetails){
                search = <SearchResults companyFromQueue = {this.state.companyFromQueue}
                                        taxOfficeDetails = {this.state.taxOfficeDetails}
                                        queueItem = {this.state.queueItem} />;
            }
            content = <SecuredCard>
                <LoaderWrapper title="Fetching Queue Item" busy = {this.state.busy}>
                    <QueueItemDetails companyFromQueue={this.state.companyFromQueue}
                                      taxOfficeDetails = {this.state.taxOfficeDetails}
                                      queueItem = {this.state.queueItem} />
                </LoaderWrapper>
                {search}
            </SecuredCard>;
        }
        return (
            <div>
                <PageHeader title="Import Company"/>
                {content}
            </div>
        );
    }
}
class SearchResults extends React.Component{
    constructor(props){
        super(props);
        this.state = {searchResults: {}};
    }
    componentDidMount(){
        if(this.props.companyFromQueue){
            this.setState({textToSearch: this.props.companyFromQueue.name});
            this.resetAndSearch(this.props.companyFromQueue.name, this.props.companyFromQueue.taxOffice, this.props.companyFromQueue.taxId);
        }
    }

    handleMergeClick(company){
        if(this.props.queueItem){
            this.context.router.push('/ui/kartoteks/company/' + company.id + '/merge-with-queue/' + this.props.queueItem.id);
        }else{
            this.context.router.push('/ui/kartoteks/company/' + company.id + '/merge-with-other/' + this.props.companyFromQueue.id);
        }

    }
    buildSearchParams(companyName, taxoffice, taxId){
        let taxOfficeCode = taxoffice ? taxoffice.code : "";
        return {q: companyName, size: 10, page: 1, taxofficeCode: taxOfficeCode, taxId: taxId};
    }
    resetAndSearch(companyName, taxOffice, taxId) {
        let params = this.buildSearchParams(companyName, taxOffice, taxId);
        this.search(params);
    }

    search(params){
        this.setState({busy: true});
        CompanyService.moreLikeThis(params).then(response => {
            let searchResults = response.data;
            _.remove(searchResults.content, {id: this.props.companyFromQueue.id});
            this.setState({searchResults: searchResults, busy: false});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }
    render(){
        return(
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <CardHeader title="Similar Companies"/>
                </GridCell>
                <GridCell width="1-4">
                    <TextInput label="Search Text" value={this.state.textToSearch} onchange = {(value) => this.setState({textToSearch: value})}/>
                </GridCell>
                <GridCell width="3-4" verticalAlign="bottom">
                    <Button label="search" flat = {false} style="success" onclick = {() => this.resetAndSearch(this.state.textToSearch, null, null)}/>
                </GridCell>
                <GridCell width="1-1">
                    <LoaderWrapper title="Searching" busy = {this.state.busy}>
                        <DataTable.Table data={this.state.searchResults.content}
                                         editable = {false} insertable = {false} filterable = {false} sortable = {false}>
                            <DataTable.Text field="name" header="Company Name" width="30"
                                            classNameProvider = {new ValueMatchBgChanger(this.props.companyFromQueue.name)}/>
                            <DataTable.Text field="countryCode" header="Country" width="10"
                                            classNameProvider = {new ValueMatchBgChanger(this.props.companyFromQueue.country.iso)}/>
                            <DataTable.Text field="taxOffice" header="Tax Office" width="10"
                                            classNameProvider = {new ValueMatchBgChanger(this.props.taxOfficeDetails.name)}/>
                            <DataTable.Text field="taxId" header="Tax ID" width="10"
                                            classNameProvider = {new ValueMatchBgChanger(this.props.companyFromQueue.taxId)}/>
                            <DataTable.Text header="Default Address" width="20" reader = {new DefaultLocationReader()}/>
                            <DataTable.ActionColumn width="10">
                                <DataTable.ActionWrapper track="onclick" onaction = {(data) => this.handleMergeClick(data)}>
                                    <SecuredMergeButton label="merge" flat = {true} style="primary" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </LoaderWrapper>
                </GridCell>
            </Grid>
        );
    }
}
class QueueItemDetails extends React.Component{
    constructor(props){
        super(props);
    }
    handleCreateNewClick(){
        this.context.router.push('/ui/kartoteks/company/new-from-queue/' + this.props.queueItem.id);
    }
    render(){
        if(!(this.props.taxOfficeDetails && this.props.companyFromQueue)){
            return null;
        }
        let createButton = null;
        if(this.props.queueItem){
            createButton = <SecuredCreateButton label="Create new" style="primary" waves = {true} onclick = {() => this.handleCreateNewClick()}/>;
        }
        return(
            <Grid>
                <GridCell width="1-1" noMargin = {true}><CardHeader title="Company Information"/></GridCell>
                <GridCell width="3-10"><Span label="Name" value = {this.props.companyFromQueue.name}/></GridCell>
                <GridCell width="1-10"><Span label="Country" value = {this.props.companyFromQueue.country.iso}/></GridCell>
                <GridCell width="1-10"><Span label="Tax Office" value = {this.props.taxOfficeDetails.name}/></GridCell>
                <GridCell width="1-10"><Span label="Tax ID" value = {this.props.companyFromQueue.taxId}/></GridCell>
                <GridCell width="3-10"><Span label="Default Address" value = {this.props.companyFromQueue.defaultAddress}/></GridCell>
                <GridCell width="1-10">
                    {createButton}
                </GridCell>
            </Grid>
        );
    }
}
class ValueMatchBgChanger{
    constructor(value){
        this.value = value;
    }
    classNames(data){
        if(data == this.value){
            return "md-bg-light-green-100";
        }
        return "";
    }
}

class DefaultLocationReader{
    readCellValue(row) {
        let address = "";
        row.locations.forEach(item => {
            if(item.default){
                address = item.countryCode + "-" + item.postalCode + "," + item.city + " " + item.streetName;
            }
        });
        return address;
    };

    readSortValue(row) {
        return "";
    };
}
QueueItemDetails.contextTypes = {
    router: PropTypes.object.isRequired
};
SearchResults.contextTypes = {
    router: PropTypes.object.isRequired
};
ImportCompany.contextTypes = {
    router: PropTypes.object.isRequired
};