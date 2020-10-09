import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {Grid, GridCell, CardHeader} from 'susam-components/layout'
import {Span, Button, Notify} from 'susam-components/basic'
import {TranslatingComponent} from 'susam-components/abstract'
import * as DataTable from 'susam-components/datatable';

export class CustomsGenericList extends TranslatingComponent{


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
        let companyAndLocationTitle = this.props.isSender ? "Loading Company / Locations" : "Unloading Company / Locations";
        let cardTitle = this.props.isSender ? "Sender Customs Definitions" : "Consignee Customs Definitions";
        return(
            <Grid>
                <GridCell width = "1-1"><CardHeader title = {cardTitle} /></GridCell>
                <GridCell width = "1-1">
                    <Button label = "new definition" flat = {true} style ="success" size = "small"
                            onclick = {() => this.handleNewDefinition()} />
                </GridCell>
                <GridCell width = "1-1">
                    <DataTable.Table data={this.props.data}>
                        <DataTable.Text width="20" header={companyAndLocationTitle} reader = {new LocationReader()} printer = {new LocationPrinter()}/>
                        {this.props.isSender?<DataTable.Text width="20" header="Customs Info" field="option" printer = {new CustomsOptionPrinter()}/>:null}
                        <DataTable.Text width="20" header="Customs Agent / Location" field="outputList" printer = {new CustomsAgentPrinter()}/>
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
class CustomsAgentPrinter{
    print(data){
        if(!data || data.length === 0){
            return "No details";
        }
        return (
            <ul className = "md-list">
                {
                    data.map(item => <li key = {item._key}>{truncate(_.get(item, "customsAgent.name"), 3)} / {truncate(_.get(item, "customsAgentLocation.name"), 3)}</li>)
                }
            </ul>
        );
    }
}
class CustomsOptionPrinter{
    print(data){
        if(data){
            if(data.code === "NEVER"){
                return "Don't Ask"
            } else {
                return "Ask";
            }
        } else {
            return "";
        }
    }
}
