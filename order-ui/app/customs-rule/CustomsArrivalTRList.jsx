import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {Grid, GridCell, CardHeader} from 'susam-components/layout'
import {Span, Button, Notify} from 'susam-components/basic'
import {TranslatingComponent} from 'susam-components/abstract'
import {CompanySearchAutoComplete} from 'susam-components/oneorder'
import * as DataTable from 'susam-components/datatable';
import {ProjectService} from "../services";

export class CustomsArrivalTRList extends TranslatingComponent{


    handleNewDefinition(){
        this.props.onCreateNew();
    }

    handleEditDefinition(value){
        this.props.onEdit(value);
    }
    handleDeleteDefinition(value){
        this.props.onDelete(value);
    }

    render(){
        if(!this.props.data){
            return null;
        }
        return(
            <Grid>
                <GridCell width = "1-1"><CardHeader title = "Consignee Customs Definitions" /></GridCell>
                <GridCell width = "1-1">
                    <Button label = "new definition" flat = {true} style ="success" size = "small"
                            onclick = {() => this.handleNewDefinition()} />
                </GridCell>
                <GridCell width = "1-1">
                    <DataTable.Table data={this.props.data}>
                        <DataTable.Text width="15" header="Loading Company / Locations" reader = {new LocationReader()} printer = {new LocationPrinter()}/>
                        <DataTable.Text width="10" header="" reader = {new RowReader()} printer = {new IconPrinter()}/>
                        <DataTable.Text width="15" header="Customs Office" field="outputList" printer = {new CustomsOfficePrinter()}/>
                        <DataTable.Text width="10" header="Type" field="outputList" printer = {new CustomsTypePrinter()}/>
                        <DataTable.Text width="15" header="Location" field="outputList" printer = {new CustomsLocationPrinter()}/>
                        <DataTable.Text width="15" header="Agent" field="outputList" printer = {new CustomsAgentPrinter()}/>
                        <DataTable.ActionColumn >
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleEditDefinition(data)}}>
                                <Button label="Edit" flat={true} style="success" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleDeleteDefinition(data)}}>
                                <Button label="Delete" flat={true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }
}

class LocationReader{
    readCellValue(row) {
        return row.locations;
    }
    readSortValue(row) {
        return "";
    }
}

class LocationPrinter{
    print(data){
        if(!data || data.length === 0){
            return "All Locations";
        }
        return (
            <ul className = "md-list">
                {data.map(item => <li key = {uuid.v4()}>{truncate(item.company.name, 3)} / {truncate(item.location.name, 2)}</li>)}
            </ul>
        );
    }

}

function printAsList(data, field){
    if(!data || data.length === 0){
        return "No details";
    }
    return (
        <ul className = "md-list">
            {
                data.map(item => <li key = {item._key}>{truncate(_.get(item, field), 3)}</li>)
            }
        </ul>
    );
}
function truncate(str, wordCount){
    if(!str){
        return "";
    }
    let split = str.split(" ");
    return split.splice(0, wordCount).join(" ") + (split.length > wordCount ? "..." : "");
}
class CustomsOfficePrinter{
    print(data){
        return printAsList(data, "customsOffice.name");
    }
}
class CustomsTypePrinter{
    print(data){
        return printAsList(data, "customsType.name");
    }
}
class CustomsLocationPrinter{
    print(data){
        return printAsList(data, "customsLocation.name");
    }
}
class CustomsAgentPrinter{
    print(data){
        return printAsList(data, "customsAgent.name");
    }
}
class RowReader{
    readCellValue(row) {
        return row;
    }
    readSortValue(row) {
        return "";
    }
}
class IconPrinter{
    print(data){
        let icons = [];
        if(data.dangerousGoods){
            icons.push(<i className = "mdi mdi-24px mdi-alert-octagon" key = "dangerous"
                          data-uk-tooltip="{pos:'bottom'}" title="Dangerous Goods"/>)
        }
        if(data.temperatureControlledGoods){
            icons.push(<i className = "mdi mdi-24px mdi-thermometer" key = "temperature"
                          data-uk-tooltip="{pos:'bottom'}" title="Temperature Controlled"/>)
        }
        return <div>{icons}</div>

    }
}