import React from "react";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown, Notify} from 'susam-components/basic';

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";

import * as DataTable from 'susam-components/datatable';

import {DSLRuleEdit} from '../common/DSLRuleEdit';

export class SenderDSLRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selectedData:null,
            isHidden: true
        }
    }

    componentDidMount() {
        let data = [];
        let lookup = {}
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

            this.setState({selectedData: null}, () => {this.props.updateHandler(data)});

            return true;

        } else {
            incData._uikey = uuid.v4();
            data.push(incData);
            this.setState({selectedData: null}, () => {this.props.updateHandler(data)});

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

        Notify.confirm("Are you sure you want to delete?", () => {
            let data = this.state.data;

            let elemIndex = data.findIndex(e => e._uikey == incData._uikey);
            if (elemIndex < 0) return false;
            data.splice(elemIndex, 1);

            this.setState({selectedData: null}, () => {
                this.props.updateHandler(data)
            });
        });
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

        return (
            <Card title="Advanced Rule Definition"
                  toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]}>
                <Grid hidden={this.state.isHidden}>
                    <GridCell noMargin={true}>
                        <DSLRuleEdit data={this.state.selectedData} lookup={lookup}
                                     saveClickHandler={(data) => {return this.handleSaveClick(data)}}
                                     schemaServiceUrlPrefix={this.props.schemaServiceUrlPrefix}
                                     rootClass={this.props.rootClass}/>
                    </GridCell>
                    <GridCell>
                        <DataTable.Table data={data} filterable={true} sortable={true} insertable={false}>
                            <DataTable.Text field="name" header="Name" sortable={true} filterable={true}/>
                            <DataTable.Text field="type.name" header="DSL Type" sortable={true}
                                            filterable={true}/>
                            <DataTable.Text field="description" header="Description" sortable={true}
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
                </Grid>
            </Card>
        );
    }
}