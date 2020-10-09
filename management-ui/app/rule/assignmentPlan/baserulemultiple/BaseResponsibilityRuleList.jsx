import _ from "lodash";
import * as axios from 'axios';
import uuid from "uuid";

import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown} from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';

import {AssignmentPlanningRuleService} from "../../../services";

export class BaseResponsibilityRuleList extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            lookup: {},
        };
    };


    render() {

        if (!this.props.data || !this.props.ruleType) {
            return null;
        }

        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <DataTable.Table data={this.props.data} filterable={false} sortable={true}
                                     insertable={false} editable={false}>
                        <DataTable.Text printer={new RegionPrinter()} reader={new RegionReader()}
                                        header="Distribution Region" sortable={true} filterable={true}/>
                        <DataTable.Text field="responsible.name" header="Responsible" sortable={true}
                                        filterable={true}/>
                        <DataTable.ActionColumn width="10">
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => {
                                this.props.handleSelectItem(data)
                            }}>
                                <Button label="Edit" flat={true} style="primary" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => {
                                this.props.handleDeleteItem(data)
                            }}>
                                <Button label="Delete" flat={true} style="primary" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }
}

class RegionReader {
    readCellValue(row) {
        return row;
    }

    readSortValue(row) {
        return (row.operationRegion? row.operationRegion.name : "") + "-" + (row.region? row.region.name : "");
    }
}
class RegionPrinter {
    print(data) {
        return (data.region? data.region.name : "") + ", " + (data.operationRegion? data.operationRegion.name : "") ;
    }
}

