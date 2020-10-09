import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, CardHeader} from "susam-components/layout";
import {Notify, DropDown, Form, Span, TextInput, Button} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";

import * as DataTable from 'susam-components/datatable';

export class SeawayTariffList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {selectedLegId: null, tariffs: []};
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
        let tariffs =  null;
        if(nextProps) {
            tariffs = nextProps.tariffs
        }

       this.setState({tariffs: tariffs})
    }

    render() {
        let tariffs = this.state.tariffs;

        if (!tariffs) {
            return null;
        }

        return  (
        <DataTable.Table data={tariffs} filterable={false} sortable={true} insertable={false}
                                 editable={false}>
            <DataTable.Text width="15" field="code" header="Code"/>
            <DataTable.Text width="15" field="status.name" header="Status" />
            <DataTable.Text width="20" field="parentSchedule.companyName" header="Company Name" />
            <DataTable.Text width="20" field="departure" header="Departure" />
            <DataTable.Text width="20" field="arrival" header="Arrival" />
            <DataTable.Text width="20" header="Planned/Capacity" reader = {new CapacityReader()} printer = {new CapacityPrinter()}/>
            <DataTable.ActionColumn width="20">
                <DataTable.ActionWrapper track="onclick"
                                         onaction={(data) => this.props.detailsClicked(data)}>
                    <Button label="Details" flat={true} style="primary" size="small"/>
                </DataTable.ActionWrapper>
            </DataTable.ActionColumn>
        </DataTable.Table>
        )

    }
}

class CapacityReader{
    readCellValue(row) {
        return row;
    }
    readSortValue(row) {
        return row.capacityUsage;
    }
}

class CapacityPrinter{
    print(data) {
        let usage = data.capacityUsage;
        let capacity = data.parentSchedule.capacity;
        let text = usage + " / " + (capacity ? capacity : "-");

        let className;
        if(usage == 0) {
            className = "uk-text-muted";
        }
        else if(!capacity) {
            className = "";
        }
        else if(usage > capacity) {
            className = "uk-text-danger uk-text-bold";
        }
        return (<span className={className + " uk-align-right"}>{text}</span>
        );
    }
}

SeawayTariffList.contextTypes = {
    translator: React.PropTypes.object,
};