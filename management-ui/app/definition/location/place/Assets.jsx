import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {Notify, Button, DropDown} from 'susam-components/basic';
import {NumericInput} from 'susam-components/advanced';

import * as DataTable from 'susam-components/datatable';

export class Assets extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            toBeAdded: {}
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
        if (props.assets) {
            state.assets = props.assets;
            state.assets.forEach(d => { if(!d._gkey) {d._gkey = uuid.v4()} })
        }
        this.setState(state);
    }

    addAsset(asset) {
        let assets = this.state.assets;

        if(!asset.type) {
            Notify.showError("Type can not be empty");
            return;
        }

        if(!_.isNumber(asset.amount)) {
            Notify.showError("Amount can not be empty");
            return;
        }

        let existedAsset = assets.find(a => {
            return a.type.id == asset.type.id
        });

        if (existedAsset) {
            Notify.showError("Asset Type already exist.");
            return;
        }

        asset._gkey = uuid.v4();

        assets.push(asset);

        this.setState({assets: assets});
    }

    editAsset(asset) {
        let assets = this.state.assets;

        if(!asset.type) {
            Notify.showError("Type can not be empty");
            return;
        }

        if(!_.isNumber(asset.amount)) {
            Notify.showError("Amount can not be empty");
            return;
        }

        if(assets.find(a => {return (a.type.id == asset.type.id && a._gkey != asset._gkey)})) {
            Notify.showError("Asset with given type already exist.");
            return;
        }

        let existedAsset = assets.find(a => {
            return a._gkey == asset._gkey
        });

        existedAsset.amount = asset.amount;
        existedAsset.type = asset.type;

        this.setState({assets: assets});
    }

    deleteAsset(asset) {
        let assets = this.state.assets;

        if(!_.isNumber(asset.amount)) {
            Notify.showError("Amount can not be empty");
            return;
        }

        let index = assets.findIndex(a => {return a.type == asset.type});

        assets.splice(index, 1);

        this.setState({assets: assets, toBeAdded: {}});
    }

    updateData(data) {
        this.setState({assets: data});
    }

    next() {
        this.props.handleSave && this.props.handleSave(this.state.assets);
    }

    renderList() {
        if(!this.props.assetTypes){
            return null;
        }
        return (
            <DataTable.Table title="Assets" data={this.state.assets} filterable={true} sortable={true}
                             insertable={true} editable={true} deletable={true} add
                             oncreate={(data) => this.addAsset(data)}
                             onupdate={(data) => this.editAsset(data)}
                             ondelete={(data) => this.deleteAsset(data)}>
                <DataTable.Lookup width="30" field="type" header="Type" sortable={true} filterable={true}>
                    <DataTable.EditWrapper>
                        <DropDown options={this.props.assetTypes}> </DropDown>
                    </DataTable.EditWrapper>
                </DataTable.Lookup>
                <DataTable.Numeric width="30" field="amount" header="Amount" sortable={true} filterable={true}>
                    <DataTable.EditWrapper>
                        <NumericInput/>
                    </DataTable.EditWrapper>
                </DataTable.Numeric>
            </DataTable.Table>
        );

    }

    render() {
        return (
            <Grid>
                <GridCell width="1-2" noMargin={true}>
                    <Grid>
                        <GridCell width="1-1">
                            {this.renderList()}
                        </GridCell>
                    </Grid>
                </GridCell>

            </Grid>
        );
    }
}