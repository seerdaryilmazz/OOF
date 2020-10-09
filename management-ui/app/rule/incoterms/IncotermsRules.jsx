import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown} from "susam-components/basic";
import {Chip} from "susam-components/advanced";
import * as DataTable from 'susam-components/datatable';

import {IncotermService} from "../../services";

export class IncotermsRules extends TranslatingComponent{

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        axios.all([
            IncotermService.list(),
            IncotermService.listRules(),
            IncotermService.listFreightCostTypes(),
            IncotermService.listCustomsClearanceTypes(),
            IncotermService.listLocationTypes(),
            IncotermService.listCustomResponsibilityTypes()
        ]).then(axios.spread((incoterms, incotermRules, freightCostTypes, customsClearanceTypes, locationTypes, custRespTypes) => {
            let state = _.cloneDeep(this.state);

            state.lookups = {};
            state.lookups.incoterms = incoterms.data;
            state.lookups.freightCostTypes = freightCostTypes.data;
            state.lookups.customsClearanceTypes = customsClearanceTypes.data;
            state.lookups.locationTypes = locationTypes.data;
            state.rules = incotermRules.data;
            state.lookups.customResponsibilityTypes = custRespTypes.data;
            this.addMissingIncoterms(state);
            this.setState(state);
        })).catch((error) => {
            Notify.showError(error);
        });
    }

    refreshRules(){
        IncotermService.listRules().then(response => {
            let state = _.cloneDeep(this.state);
            state.rules = response.data;
            this.addMissingIncoterms(state);
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        })
    }

    addMissingIncoterms(state){
        state.rules.forEach(item => {
            let found = _.find(state.lookups.incoterms, {code: item.incoterm});
            if(!found){
                item._deleted = true;
            }
        });
        _.remove(state.rules, {_deleted: true});
        state.lookups.incoterms.forEach(item => {
            let found = _.find(state.rules, {incoterm: item.code});
            if(!found){
                state.rules.push({incoterm: item.code, active: item.active});
            }else{
                found.active = item.active;
            }
        });
    }

    handleRowDelete(data){
        IncotermService.deleteRule(data).then(response => {
            Notify.showSuccess("Incoterm rule deleted");
            this.refreshRules();
        }).catch(error => {
            Notify.showError(error);
        })
    }
    handleRowUpdate(data){
        IncotermService.saveRule(data).then(response => {
            Notify.showSuccess("Incoterm rule saved");
            this.refreshRules();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render(){
        if(!this.state.rules){
            return null;
        }
        if(this.state.rules){
            console.log(this.state.rules[0].active);
        }

        return (
            <div>
                <PageHeader title="Incoterm Rules" />
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin = {true}>
                            <DataTable.Table data={this.state.rules}
                                             editable = {true} deletable = {true}
                                             filterable = {false} sortable = {true}
                                             ondelete = {(data) => this.handleRowDelete(data)}
                                             onupdate = {(data) => this.handleRowUpdate(data)}>
                                <DataTable.Text field="incoterm" header="Incoterm" width="10" sortable = {true} editable = {false}/>
                                <DataTable.Bool field="active" header="Active" width="5" sortable = {true} editable = {false}/>
                                <DataTable.Text header="Freight cost issued at" width="10" sortable = {false}
                                                reader = {new FreightCostReader()} printer = {new EnumPrinter()}>
                                    <DataTable.EditWrapper>
                                        <DropDown options = {this.state.lookups.freightCostTypes} />
                                    </DataTable.EditWrapper>
                                </DataTable.Text>
                                <DataTable.Text header="TR Departure Customs Resp." width="15" sortable = {false}
                                                reader = {new CustomResponsibilityReader("trDepartureCustomResponsibilityRule")}
                                                printer = {new EnumPrinter()}>
                                    <DataTable.EditWrapper>
                                        <DropDown options = {this.state.lookups.customResponsibilityTypes} />
                                    </DataTable.EditWrapper>
                                </DataTable.Text>
                                <DataTable.Text header="TR Arrival Customs Resp." width="15" sortable = {false}
                                                reader = {new CustomResponsibilityReader("trArrivalCustomResponsibilityRule")}
                                                printer = {new EnumPrinter()}>
                                    <DataTable.EditWrapper>
                                        <DropDown options = {this.state.lookups.customResponsibilityTypes} />
                                    </DataTable.EditWrapper>
                                </DataTable.Text>
                                <DataTable.Text header="Non-TR Departure Customs Resp." width="15" sortable = {false}
                                                reader = {new CustomResponsibilityReader("nonTRDepartureCustomResponsibilityRule")}
                                                printer = {new EnumPrinter()}>
                                    <DataTable.EditWrapper>
                                        <DropDown options = {this.state.lookups.customResponsibilityTypes} />
                                    </DataTable.EditWrapper>
                                </DataTable.Text>
                                <DataTable.Text header="Non-TR Arrival Customs Resp." width="15" sortable = {false}
                                                reader = {new CustomResponsibilityReader("nonTRArrivalCustomResponsibilityRule")}
                                                printer = {new EnumPrinter()}>
                                    <DataTable.EditWrapper>
                                        <DropDown options = {this.state.lookups.customResponsibilityTypes} />
                                    </DataTable.EditWrapper>
                                </DataTable.Text>
                            </DataTable.Table>
                        </GridCell>

                    </Grid>
                </Card>

            </div>
        );
    }
}
class FreightCostReader{
    readCellValue(row) {
        return row.freightCostRule ? row.freightCostRule.freightCostType : "";
    }
    readSortValue(row) {
        return this.readCellValue(row);
    }
    setValue(row, value){
        if(!row.freightCostRule){
            row.freightCostRule = {};
        }
        row.freightCostRule.freightCostType = value;
    }
}

class CustomResponsibilityReader{
    constructor(key) {
        this.key = key;
    }

    readCellValue(row) {
        return row[this.key] ? row[this.key].customResponsibilityType : "";
    }
    readSortValue(row) {
        return this.readCellValue(row);
    }
    setValue(row, value) {
        if (!row[this.key]) {
            row[this.key] = {};
        }
        row[this.key].customResponsibilityType = value;
    }
}

class EnumPrinter{
    print(data) {
        if(!data){
            return "";
        }
        return data.name;
    }
}
class ListPrinter{
    print(data) {
        if(!data || data.length == 0){
            return "";
        }
        return <ul>{data.map(item => <li style = {{listStyleType: "none"}} key = {item.code}>{item.name}</li>)}</ul>;
    }
}
class CustomsClearanceReader{
    constructor(key){
        this.key = key;
    }
    readCellValue(row) {
        return row[this.key] ? row[this.key].customsClearanceTypes : [];
    }
    readSortValue(row) {
        return "";
    }
    setValue(row, value){
        if(!row[this.key]){
            row[this.key] = {};
        }
        row[this.key].customsClearanceTypes = value;
    }
}
class LocationReader{
    constructor(key){
        this.key = key;
    }
    readCellValue(row) {
        return row[this.key] ? row[this.key].locationTypes : [];
    }
    readSortValue(row) {
        return "";
    }
    setValue(row, value){
        if(!row[this.key]){
            row[this.key] = {};
        }
        row[this.key].locationTypes = value;
    }
}