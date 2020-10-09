import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import {GridCell, Grid} from "susam-components/layout";
import * as DataTable from 'susam-components/datatable';
import PropTypes from "prop-types";

export class HistoryTable extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render(){
        return (
            <Grid divider = {true} nomargin={true}>
                <GridCell width="1-1">
                    <DataTable.Table data={this.props.changes}>
                        <DataTable.Text field="changedBy" header="Changed By" width="15"/>
                        <DataTable.Text field="changeTime" header="Change Time" width="15"/>
                        <DataTable.Text field="description" header="Changes" translator={this} width="70"/>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }
}

HistoryTable.contextTypes = {
    translator: PropTypes.object
};
