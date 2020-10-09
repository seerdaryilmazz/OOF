import React from "react";

import {TextInput, Button} from 'susam-components/basic';
import {TranslatingComponent} from "susam-components/abstract";
import {Grid, GridCell} from 'susam-components/layout';
import *  as DataTable from 'susam-components/datatable';

export class QuadroCompanySearch extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {};
    }

    handleSelectedItem(value){
        this.updateState("query", null);
        this.props.onItemSelected && this.props.onItemSelected(value);
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    searchCompany(){

    }

    render(){
        return (
                <div>
                    <Grid divider = {true}>
                        <GridCell width = "1-2" margin="small">
                            <Grid noMargin = {true}>
                                <GridCell width = "3-4" margin="small">
                                    <TextInput placeholder="Search for company..." required = {true}
                                               value = {this.state.query}
                                               onchange = {(value) => this.updateState("query", value)}/>
                                </GridCell>
                                <GridCell width="1-4" margin="small">
                                    <Button label="Search" size="small" style="success" onaction = {() => this.searchCompany()}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width = "1-1" margin="small">
                            <DataTable.Table data={this.state.quotes}>
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
                                    <DataTable.ActionWrapper key="viewQuote" track="onclick" onaction = {(data) => this.handleSelectedItem(data)}>
                                        <Button label="select" flat={true} size="small"/>
                                    </DataTable.ActionWrapper>
                                </DataTable.ActionColumn>
                            </DataTable.Table>
                        </GridCell>
                    </Grid>

                </div>

        );
    }
}

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