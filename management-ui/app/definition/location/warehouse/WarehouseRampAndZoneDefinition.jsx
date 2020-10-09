import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form, RadioGroup} from 'susam-components/basic';
import {Chip, NumericInput, WorkingHour} from 'susam-components/advanced';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';

import {RampNumberEdit} from "./RampNumberEdit";
import {MultipleSelector} from "./MultipleSelector";

import * as DataTable from 'susam-components/datatable';

export class WarehouseRampAndZoneDefinition extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: []
        }

    }

    componentDidMount() {
        this.initializeState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {
        let state = _.cloneDeep(this.state);
        if (props.data) {
            state.data = _.cloneDeep(props.data);

            if(state.data.rampGroup) {
                state.data.rampGroup.map(d => {if(!d._guiKey) {d._guiKey = uuid.v4();}})
            } if(state.data.zone) {
                state.data.zone.map(d => {if(!d._guiKey) {d._guiKey = uuid.v4();}})
            }
        }
        if (props.lookup) {
            state.lookup = props.lookup;
        }

        state.data = this.unformatData(state.data);


        this.setState(state, () => {this.initializeRampOptions()});
    }

    handleAddRampGroup(dataEntry) {
        let data = this.state.data;
        dataEntry._guiKey = uuid.v4();
        dataEntry.active =true;
        data.rampGroup.push(dataEntry);
        this.setState({data: data}, () => {this.initializeRampOptions()})
    }

    handleEditRampGroup(dataEntry) {
        let data = this.state.data;

        let elemIndex = data.rampGroup.findIndex(e => e._guiKey == dataEntry._guiKey);
        if (elemIndex < 0) return false;

        data.rampGroup[elemIndex] = dataEntry;

        this.setState({data: data}, () => {this.initializeRampOptions()})
    }

    handleDeleteRampGroup(dataEntry) {
        let data = this.state.data;

        let elemIndex = data.rampGroup.findIndex(e => e._guiKey == dataEntry._guiKey);
        if (elemIndex < 0) return false;
        data.rampGroup.splice(elemIndex, 1);

        this.setState({data: data})
    }

    handleAddZone(dataEntry) {
        let data = this.state.data;
        dataEntry._guiKey = uuid.v4();
        data.zone.push(dataEntry);
        this.setState({data: data})
    }

    handleEditZone(dataEntry) {
        let data = this.state.data;

        let elemIndex = data.zone.findIndex(e => e._guiKey == dataEntry._guiKey);
        if (elemIndex < 0) return false;

        data.zone[elemIndex] = dataEntry;

        this.setState({data: data})
    }

    handleDeleteZone(dataEntry) {
        let data = this.state.data;

        let elemIndex = data.zone.findIndex(e => e._guiKey == dataEntry._guiKey);
        if (elemIndex < 0) return false;
        data.zone.splice(elemIndex, 1);

        this.setState({data: data})
    }

    next() {
        let data = this.formatData(this.state.data);

        return this.props.handleSave(data);
    }

    formatData(originalData) {

        let data = _.cloneDeep(originalData);

        if (!data || !data.zone) {
            return data;
        }

        data.zone.forEach(z => {

            let inRamps = z.goodsInRamps;
            let outRamps = z.goodsOutRamps;

            if (inRamps) {
                let elem = inRamps.find(r => r.id == MultipleSelector.RAMPSELECTION_ALL_RAMPS.id || r.id == MultipleSelector.RAMPSELECTION_REMAINING_RAMPS.id);

                if (elem) {
                    z.rampSelectionForGoodsIn = elem.id;
                    z.goodsInRamps = null;
                } else {
                    z.rampSelectionForGoodsIn = MultipleSelector.RAMPSELECTION_SPECIFIC_RAMPS.id;
                    z.goodsInRamps = inRamps.map(r => {return {rampNo: r.id}});
                }
            }

            if (outRamps) {
                let elem = outRamps.find(r => r.id == MultipleSelector.RAMPSELECTION_ALL_RAMPS.id || r.id == MultipleSelector.RAMPSELECTION_REMAINING_RAMPS.id);

                if (elem) {
                    z.rampSelectionForGoodsOut = elem.id;
                    z.goodsOutRamps = null;
                } else {
                    z.rampSelectionForGoodsOut = MultipleSelector.RAMPSELECTION_SPECIFIC_RAMPS.id;
                    z.goodsOutRamps = outRamps.map(r => { return {rampNo: r.id}});
                }
            }
        });

        return data;
    }

    unformatData(originalData) {

        let data = _.cloneDeep(originalData);

        if (!data || !data.zone) {
            return data;
        }

        data.zone.forEach(z => {

            if (z.goodsInRamps) {

                if (z.rampSelectionForGoodsIn == MultipleSelector.RAMPSELECTION_ALL_RAMPS.id) {
                    z.goodsInRamps = [];
                    z.goodsInRamps.push({
                        id: MultipleSelector.RAMPSELECTION_ALL_RAMPS.id,
                        name: MultipleSelector.RAMPSELECTION_ALL_RAMPS.name
                    });
                } else if (z.rampSelectionForGoodsIn == MultipleSelector.RAMPSELECTION_REMAINING_RAMPS.id) {
                    z.goodsInRamps = [];
                    z.goodsInRamps.push({
                        id: MultipleSelector.RAMPSELECTION_REMAINING_RAMPS.id,
                        name: MultipleSelector.RAMPSELECTION_REMAINING_RAMPS.name
                    });
                } else if (z.goodsInRamps) {
                    z.goodsInRamps = z.goodsInRamps.map(r => {
                        return {id: r.rampNo, name: r.rampNo}
                    });
                }
            }

            if (z.goodsOutRamps) {

                if (z.rampSelectionForGoodsOut == MultipleSelector.RAMPSELECTION_ALL_RAMPS.id) {
                    z.goodsOutRamps = [];
                    z.goodsOutRamps.push({
                        id: MultipleSelector.RAMPSELECTION_ALL_RAMPS.id,
                        name: MultipleSelector.RAMPSELECTION_ALL_RAMPS.name
                    });
                }
                else if (z.rampSelectionForGoodsOut == MultipleSelector.RAMPSELECTION_REMAINING_RAMPS.id) {
                    z.goodsOutRamps = [];
                    z.goodsOutRamps.push({
                        id: MultipleSelector.RAMPSELECTION_REMAINING_RAMPS.id,
                        name: MultipleSelector.RAMPSELECTION_REMAINING_RAMPS.name
                    });
                } else if (z.goodsOutRamps) {
                    z.goodsOutRamps = z.goodsOutRamps.map(r => {
                        return {id: r.rampNo, name: r.rampNo}
                    });
                }
            }
        });

        return data;
    }


    initializeRampOptions() {

        let options = [];

        let data = this.state.data;

        if (data && data.rampGroup) {
            data.rampGroup.forEach(r => {
                let start = r.rampFrom;
                let end = r.rampTo;
                let index;
                for(index = start; index<=end; index++) {
                    options.push({id: index, name: index});
                }
            })
        }

        this.setState({ramps: options, zoneDefinitionTableKey: uuid.v4()});

    }


    render() {

        let data = this.state.data;
        let lookup = this.state.lookup;

        if (!data || !lookup) {
            return null;
        }

        return (
                <Grid>
                    <GridCell width="1-1">
                        <DataTable.Table title="Dock Definition" data={data.rampGroup} filterable={true} sortable={true} insertable={true} editable={true}
                                         deletable={true}
                                         oncreate={(data) => this.handleAddRampGroup(data)}
                                         onupdate={(data) => this.handleEditRampGroup(data)}
                                         ondelete={(data) => this.handleDeleteRampGroup(data)}>
                            <DataTable.Text width="40" field="ramp" header="Dock No" sortable={true}
                                            filterable={true}
                                            reader={new RampNumberReader()}
                                            printer={new RampNumberPrinter()}>
                                <DataTable.EditWrapper>
                                    <RampNumberEdit></RampNumberEdit>
                                </DataTable.EditWrapper>
                            </DataTable.Text>
                            <DataTable.Bool field="active" header="Active" width="5" sortable = {true} default={true}/>
                            <DataTable.Text width="20" field="property" header="Dock Property" sortable={true}
                                            filterable={true}
                                            reader={new RampDefinitionReader()}
                                            printer={new RampDefinitionPrinter()}>
                                <DataTable.EditWrapper>
                                    <DropDown options={lookup.warehouseRampProperty}/>
                                </DataTable.EditWrapper>
                            </DataTable.Text>
                            <DataTable.Numeric width="15" field="floorNumber" header="Floor Number" sortable={true}
                                               filterable={true}>
                                <DataTable.EditWrapper>
                                    <NumericInput/>
                                </DataTable.EditWrapper>
                            </DataTable.Numeric>
                        </DataTable.Table>
                    </GridCell>
                    <GridCell key={this.state.zoneDefinitionTableKey}width="1-1">
                        <DataTable.Table title="Zone Definition" data={data.zone} filterable={true} sortable={true} insertable={true} editable={true}
                                         deletable={true}
                                         oncreate={(data) => this.handleAddZone(data)}
                                         onupdate={(data) => this.handleEditZone(data)}
                                         ondelete={(data) => this.handleDeleteZone(data)}>
                            <DataTable.Text width="15" field="name" header="Name" sortable={true} filterable={true}>
                                <DataTable.EditWrapper>
                                    <TextInput/>
                                </DataTable.EditWrapper>
                            </DataTable.Text>
                            <DataTable.Text width="15" field="type.id" header="Zone Type" sortable={true}
                                            filterable={true}
                                            reader = {new ZoneDefinitionReader()}
                                            printer = {new ZoneDefinitionPrinter()}>
                                <DataTable.EditWrapper>
                                    <DropDown options={lookup.warehouseZoneType}/>
                                </DataTable.EditWrapper>
                            </DataTable.Text>
                            <DataTable.Numeric width="6" field="area" header="Area" sortable={true} filterable={true}>
                                <DataTable.EditWrapper>
                                    <NumericInput/>
                                </DataTable.EditWrapper>
                            </DataTable.Numeric>
                            <DataTable.Numeric width="6" field="height" header="Height" sortable={true} filterable={true}>
                                <DataTable.EditWrapper>
                                    <NumericInput/>
                                </DataTable.EditWrapper>
                            </DataTable.Numeric>
                            <DataTable.Numeric width="4" field="floorNumber" header="Floor" sortable={true} filterable={true}>
                                <DataTable.EditWrapper>
                                    <NumericInput/>
                                </DataTable.EditWrapper>
                            </DataTable.Numeric>
                            <DataTable.Text width="20" field="goodsInRamps" header="Docks for Goods In" sortable={false}
                                            filterable={true}
                                            reader = {new RampInReader()}
                                            printer = {new RampPrinter()}>
                                <DataTable.EditWrapper>
                                    <MultipleSelector options={this.state.ramps}/>
                                </DataTable.EditWrapper>
                            </DataTable.Text>
                            <DataTable.Text width="20" field="goodsOutRamps" header="Docks for Goods Out" sortable={false}
                                            filterable={true}
                                            reader = {new RampOutReader()}
                                            printer = {new RampPrinter()}>
                                <DataTable.EditWrapper>
                                    <MultipleSelector options={this.state.ramps}/>
                                </DataTable.EditWrapper>
                            </DataTable.Text>
                        </DataTable.Table>
                    </GridCell>
                </Grid>
        );
    }
}

class RampNumberReader {
    setValue(row, value){
        row = value;
    }
    readCellValue(row){
        return row;
    }
    readSortValue(row){
        let data = row;
        if(data.rampFrom || _.isNumber(data.rampFrom) || data.rampTo || _.isNumber(data.rampTo)) {
            if(data.rampFrom  == data.rampTo) {
                return data.rampFrom;
            }else {
                return "Between " + (data.rampFrom ? data.rampFrom : "" ) + " and " + (data.rampTo ? data.rampTo : "") ;
            }
        } else {
            return "";
        }
    }
}
class RampNumberPrinter {
    print(data) {
        if (data.rampFrom || _.isNumber(data.rampFrom) || data.rampTo || _.isNumber(data.rampTo)) {
            if (data.rampFrom == data.rampTo) {
                return data.rampFrom;
            } else {
                return "Between " + (data.rampFrom ? data.rampFrom : "" ) + " and " + (data.rampTo ? data.rampTo : "");
            }
        } else {
            return "";
        }
    }
}
class RampDefinitionReader {
    setValue(row, value){
        row.property = value;
    }
    readCellValue(row){
        return row ? (row.property ? row.property : "" ) : "";
    }
    readSortValue(row){
        return row ? (row.property ? row.property.name : "" ) : "";
    }
}
class RampDefinitionPrinter {
    print(data) {
        return data? data.name : "";
    }
}


class ZoneDefinitionReader {
    setValue(row, value){
        return row.type = value;
    }
    readCellValue(row){
        return row ? (row.type ? row.type : "" ) : "";
    }
    readSortValue(row){
        return row ? (row.type ? row.type.name : "" ) : "";
    }
}
class ZoneDefinitionPrinter {
    print(data) {
        return data ? data.name : "" ;
    }
}

class RampInReader {
    setValue(row, value){
        return row.goodsInRamps = value;
    }
    readCellValue(row){
        return row ? (row.goodsInRamps ? row.goodsInRamps : "" ) : "";
    }
    readSortValue(row){
        return "";
    }
}
class RampOutReader {
    setValue(row, value){
        return row.goodsOutRamps = value;
    }
    readCellValue(row){
        return row ? (row.goodsOutRamps ? row.goodsOutRamps : "" ) : "";
    }
    readSortValue(row){
        return "";
    }
}
class RampPrinter {
    print(data) {
        return data ? data.map( d => d.name).join(",") : "" ;
    }
}
