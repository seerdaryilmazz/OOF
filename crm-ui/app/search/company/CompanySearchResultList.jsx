import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import {Grid, GridCell, Loader} from "susam-components/layout";
import {TranslatingComponent} from "susam-components/abstract";
import {Notify, Button} from "susam-components/basic";
import {CompanyService} from '../../services/CompanyService';
import *  as DataTable from 'susam-components/datatable';
import {CrmAccountService} from "../../services";

export class CompanySearchResultList extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {page: 1, size: 6};
    }

    search(query){
        this.setState({busy: true});
        if(query){
            let params = {q: query, page: this.state.page, size: this.state.size};
            CompanyService.search(params).then(response => {
                this.setState({result: response.data, busy: false});
            }).catch(error => {
                Notify.showError(error);
                this.setState({result: null, busy: false});
            });
        }else{
            this.setState({result: null, busy: false});
        }
    }
    componentWillReceiveProps(nextProps){
        if(!_.isEqual(this.props.query, nextProps.query)){
            this.setState({page: 1}, () => this.search(nextProps.query));
        }
    }
    previousPage(){
        this.setState({page: --this.state.page});
        this.search(this.props.query);
    }
    nextPage(){
        this.setState({page: ++this.state.page});
        this.search(this.props.query);
    }

    handleSelectedItem(id){
        let company = _.find(this.state.result.content, {id});
        CrmAccountService.checkIfCompanyHasAccount(company.id).then(response => {
            if (response.data === true) {
                Notify.showError("This company already has an account");
            } else {
                this.props.onItemSelected && this.props.onItemSelected(company);
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render(){
        if(this.state.busy){
            return <Loader title="Searching"/>
        }
        let result = this.state.result;
        if(!result){
            return null;
        }
        let nextPage = null;
        let prevPage = null;
        if(!result.last){
            nextPage = <Button label="Next Page" style="primary" size="medium" waves = {true} onclick = {() => this.nextPage()}/>;
        }
        if(!result.first){
            prevPage = <Button label="Previous Page" style="primary" size="medium" waves = {true} onclick = {() => this.previousPage()}/>
        }
        let summary = result.totalElements + " " + super.translate("results") + ", " + result.totalPages + " " + super.translate("pages");
        let pageInfo = (result.number + 1) + "/" + result.totalPages;

        if(result.content){
            return (
                    <div>
                        <div>
                            <div className="md-card-list-header heading_list"> {summary}</div>
                            <DataTable.Table data={result.content}>
                                <DataTable.Text field="name" header="Name" width="30"
                                                printer = {new CompanyNamePrinter()}/>
                                <DataTable.Text field="shortName" header="Short Name" width="10" />
                                <DataTable.Text field="countryCode" header="Country" width="10" />
                                <DataTable.Text field="taxOffice" header="Tax Office" width="10" />
                                <DataTable.Text field="taxId" header="Tax ID" width="10" />
                                <DataTable.Text field="defaultLocation.formattedAddress"
                                                header="Address" width="20" reader = {new LocationReader()}
                                                printer = {new LocationPrinter()}/>
                                <DataTable.ActionColumn>
                                    <DataTable.ActionWrapper key="selectCompany" track="onclick"
                                                             onaction = {(data) => this.handleSelectedItem(data.id)}>
                                        <Button label="select" flat={true} style="success" size="small"/>
                                    </DataTable.ActionWrapper>
                                </DataTable.ActionColumn>
                            </DataTable.Table>
                        </div>
                        <Grid>
                            <GridCell width="1-4">
                                {result.totalPages === 0 || result.totalPages - 1 === result.number
                                    ? <Button label="Add New" style="success" size="medium" flat={true} labelStyle={{fontWeight: "bold"}}
                                              onclick={() => this.props.onAddNew && this.props.onAddNew()}/>
                                    : ""
                                }
                            </GridCell>
                            <GridCell width="1-4">
                                <div style={{textAlign: "center"}}>
                                {prevPage}
                                </div>
                            </GridCell>
                            <GridCell width="1-4">
                                <div style={{textAlign: "center"}}>
                                {nextPage}
                                </div>
                            </GridCell>
                            <GridCell width="1-4">
                                <div className="uk-align-right">
                                    <h3>{pageInfo}</h3>
                                </div>
                            </GridCell>
                        </Grid>
                    </div>
            );
        }else{
            return (
                <div>{super.translate("No records match this find criteria")}</div>
            );
        }


    }
}
CompanySearchResultList.contextTypes = {
    translator: PropTypes.object
};


class LocationReader{
    readCellValue(row) {
        let defaultLocation = _.find(row.locations, {default:true});
        return defaultLocation ? defaultLocation.formattedAddress : "";
    }
    readSortValue(row) {
        return this.readCellValue(row);
    }
}
class LocationPrinter{

    print(data){
        return(
            <div style = {{whiteSpace: 'pre-wrap', width: "400px"}}>{data}</div>
        );
    }
}
class CompanyNamePrinter{

    print(data){
        return(
            <div style = {{whiteSpace: 'pre-wrap', width: "400px"}}>{data}</div>
        );
    }
}