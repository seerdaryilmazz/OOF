import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Notify, Button, DropDown} from 'susam-components/basic';
import {NumericInput} from 'susam-components/advanced';

import {CardHeader, Grid, GridCell} from "susam-components/layout";

import * as DataTable from 'susam-components/datatable';

export class EquipmentRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: {},
            selectedItem: {},
            lookup: []
        }
    }

    componentDidMount() {
        this.initializeState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {
        let state = this.state;
        if (props.data) {
            state.data = props.data;
        }
        if (props.lookup) {
            state.lookup = props.lookup;
        }
        this.setState(state);
    }

    updateToBeAdded(field, value) {
        let selectedItem = this.state.selectedItem;
        selectedItem[field] = value;
        this.setState({selectedItem: selectedItem});
    }

    validate(item){
        if(!_.isNumber(item.amount)) {
            Notify.showError("Amount should not be empty");
            return false;
        }
        if(!item.type) {
            Notify.showError("Type should not be empty");
            return false;
        }
        return true;
    }

    handleSaveAsset() {
        let selectedItem = this.state.selectedItem;
        if(!this.validate(selectedItem)){
            return;
        }

        if(this.state.selectedItem._key){
            this.handleUpdateAsset(selectedItem);
        }else{
            this.handleAddAsset(selectedItem);
        }
    }

    handleAddAsset(selectedItem) {
        let assets = _.cloneDeep(this.state.data);

        let existingItemIndex = assets.findIndex(item => {
            return parseInt(item.type.id) === parseInt(selectedItem.type.id)
        });

        if (existingItemIndex >= 0) {
            assets[existingItemIndex] = selectedItem;
        }else{
            selectedItem._key = uuid.v4();
            assets.push(selectedItem);
        }
        this.setState({data: assets, selectedItem: {}});
    }
    handleUpdateAsset(selectedItem) {
        let assets = _.cloneDeep(this.state.data);

        if(!this.validate(selectedItem)){
            return;
        }

        let itemWithSameType = assets.find(item => {
            return item.type.id === selectedItem.type.id &&
                item._key !== selectedItem._key
        });
        if(itemWithSameType){
            Notify.showError("There's an item with the same type");
            return;
        }

        let existingItemIndex = assets.findIndex(item => {
            return item._key === selectedItem._key;
        });

        if (existingItemIndex >= 0) {
            assets[existingItemIndex] = selectedItem;
        }
        this.setState({data: assets, selectedItem: {}});
    }

    handleSelectItem(asset) {
        this.setState({selectedItem: _.cloneDeep(asset)});
    }

    handleDeleteAsset(asset) {
        let assets = _.cloneDeep(this.state.data);

        let index = assets.findIndex(item => {return item.type.id === asset.type.id});
        assets.splice(index, 1);

        this.setState({data: assets, selectedItem: {}});
    }

    updateData(data) {
        this.setState({data: data});
    }


    renderEdit() {
        let lookup = this.state.lookup;
        let selectedItem = this.state.selectedItem;

        return (
            <Grid>
                <GridCell width="1-3" noMargin={true}>
                    <DropDown label="Type" value={selectedItem.type} options={lookup.vehicleEquipmentType}
                              onchange={(data) => this.updateToBeAdded("type", data)}/>
                </GridCell>
                <GridCell width="1-6" noMargin={true}>
                    <NumericInput label = "Amount" value={selectedItem.amount} onchange={(data) => this.updateToBeAdded("amount", data)}/>
                </GridCell>
                <GridCell width="1-6">
                    <Button label={this.state.selectedItem._key ? "Update" : "Add"} style = "success" size = "small"
                            onclick={() => this.handleSaveAsset()}/>
                </GridCell>
            </Grid>
        );
    }

    renderList() {
        let data = this.state.data;
        let lookup = this.state.lookup;

        return (
            <DataTable.Table data={data} filterable={false} sortable={false}>
                <DataTable.Text width="30" field="type.name" header="Type"/>
                <DataTable.Numeric width="30" field="amount" header="Amount"/>
                <DataTable.ActionColumn>
                    <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleSelectItem(data)}}>
                        <Button label="Edit" flat={true} style="success" size="small"/>
                    </DataTable.ActionWrapper>
                    <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleDeleteAsset(data)}}>
                        <Button label="Delete" flat={true} style="danger" size="small"/>
                    </DataTable.ActionWrapper>
                </DataTable.ActionColumn>
            </DataTable.Table>
        );
    }

    render() {
        return (
            <div>
                <CardHeader title="Equipment" />
                <Grid>
                    <GridCell width="1-2" noMargin={true}>
                        <Grid>
                            <GridCell width="1-1" noMargin={true}>
                                {this.renderEdit()}
                            </GridCell>
                            <GridCell width="1-1">
                                {this.renderList()}
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-2"/>
                    <GridCell >
                        <Button label="Save" style="primary" size="small"
                                onclick={() => {this.props.saveHandler(this.state.data)}}/>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}