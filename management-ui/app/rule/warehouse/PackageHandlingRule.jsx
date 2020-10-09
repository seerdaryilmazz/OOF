import React from "react";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown} from 'susam-components/basic';

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";

import * as DataTable from 'susam-components/datatable';

import {PackageHandlingRuleEdit} from './PackageHandlingRuleEdit';

export class PackageHandlingRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selectedData:null,
            lookup: {},
            isHidden: true
        }
    }

    componentDidMount() {
        let data = [];
        let lookup = {};
        if (this.props.data) {
            data = this.props.data;
        }
        if (this.props.lookup) {
            lookup = this.props.lookup;
        }
        this.setState({data: data, lookup: lookup, selectedData: null});
    }

    componentWillReceiveProps(nextProps) {
        let data = [];
        let lookup = {};
        if (nextProps.data) {
            data = nextProps.data;
        }
        if (nextProps.lookup) {
            lookup = nextProps.lookup;
        }
        this.setState({data: data, lookup: lookup, selectedData: null});

    }

    handleSaveClick(incData) {

        let data = this.state.data;

        if (incData._uikey) {
            let elemIndex = data.findIndex(e => e._uikey == incData._uikey);

            if (elemIndex < 0) return false;

            data[elemIndex] = incData;

            this.setState({data: data, selectedData: null});

            return true;

        } else {
            incData._uikey = uuid.v4();
            data.push(incData);
            this.setState({data: data, selectedData: null});

            return true;
        }

        return false;
    }


    handleEditClick(data) {
        if(this.state.selectedData && this.state.selectedData._uikey == data._uikey) {
            this.setState({selectedData: null});
        } else {
            this.setState({selectedData: data});
        }
    }

    handleDeleteClick(incData) {
        let data = this.state.data;

        let elemIndex = data.findIndex(e => e._uikey == incData._uikey);
        if (elemIndex < 0) return false;
        data.splice(elemIndex, 1);

        this.setState({data: data, selectedData: null});
    }

    handleShowHideClick() {
        if(this.state.isHidden) {
            this.setState({isHidden: false});
        } else {
            this.setState({isHidden: true});
        }
    }

    retrieveShowHideIcon() {
        if(this.state.isHidden) {
            return "angle-double-down";
        } else {
            return "angle-double-up";
        }
    }

    render() {

        let data = this.state.data;
        let lookup = this.state.lookup;

        let readonlyRangeType;
        if(data && data.length > 0  && lookup.rangeType ) {
            readonlyRangeType = lookup.rangeType.find((elem) => {return (elem.id == data[0].range.rangeType.id) });
        }

        return (
            <Card title="WH Handling Rule" toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]}>
                <Grid hidden={this.state.isHidden}>
                    <GridCell>
                        <PackageHandlingRuleEdit data={this.state.selectedData} lookup={lookup} readonlyRangeType={readonlyRangeType}
                                            saveClickHandler={(data) => {return this.handleSaveClick(data)}}/>
                    </GridCell>
                    <GridCell>
                        <DataTable.Table data={data} filterable={true} sortable={true} insertable={false}>
                            <DataTable.Text field="packageGroup.name" header="Package Group" sortable={true} filterable={true}/>
                            <DataTable.Text field="range.rangeType.name" header="Range Type" sortable={true}
                                            filterable={true}/>
                            <DataTable.Numeric field="range.minRange" header="Range - Min" sortable={true} filterable={true}/>
                            <DataTable.Numeric field="range.maxRange" header="Range - Max" sortable={true} filterable={true}/>
                            <DataTable.Text field="packageHandlingType.name" header="Handling" sortable={true}
                                            filterable={true}/>
                            <DataTable.Text field="responsibleUser" header="Responsible User" sortable={true}
                                            filterable={true}/>
                            <DataTable.ActionColumn >
                                <DataTable.ActionWrapper track="onclick"
                                                         onaction={(data) => {this.handleEditClick(data)}}>
                                    <Button label="Edit" flat={true} style="success" size="small"/>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper track="onclick"
                                                         onaction={(data) => {this.handleDeleteClick(data)}}>
                                    <Button label="Delete" flat={true} style="success" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                    <GridCell noMargin={true}>
                        <Button label="Save" flat={true} style="success" size="large"
                                onclick={() => {this.props.saveHandler(this.state.data)}}/>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}