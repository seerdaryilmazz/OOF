import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import {GridCell, Grid} from "susam-components/layout";
import * as DataTable from 'susam-components/datatable';
import PropTypes from "prop-types";
import {StringUtils} from "../utils";
import {LookupService} from "../services/LookupService";
import { Notify} from 'susam-components/basic';

export class CompanyDebt extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        LookupService.getServiceAreas().then(response=>{
            this.setState({serviceAreas: response.data})
        }).catch(e=>{
            console.log(e);
            Notify.showError(e);
        })
    }

    render(){
        return (
            <Grid divider = {true} nomargin={true}>
                <GridCell width="1-1">
                    <DataTable.Table data={this.props.companyDebts}>
                        <DataTable.Text field="businessArea" header="Service Area" reader={new ServiceAreaReader(this.state.serviceAreas)} translator={this} reRender={true}/>
                        <DataTable.Text field="debitTotal" header="Debit" printer={new DebitPrinter()} />
                        <DataTable.Text field="limitAmount" header="Limit" printer={new LimitPrinter()} />
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }
}

class DebitPrinter {
    printUsingRow(row){
        let displayData = StringUtils.formatMoney(row.debitTotal, row.currency);
        return <span>{displayData}</span>
    }
}

class LimitPrinter {
    printUsingRow(row){
        let displayData = StringUtils.formatMoney(row.limitAmount, row.currency || "");
        let warning = !_.isNil(row.limitAmount) && row.debitTotal > row.limitAmount ? <span style={{color: 'red', fontWeight: 'bold'}}>&#33;</span> : "";
        return <span>{warning} {displayData}</span>
    }
}

class ServiceAreaReader {
    constructor(serviceAreas){
        this.serviceAreas = serviceAreas || [];
    }

    readCellValue(row){
        return _.get(_.find(this.serviceAreas, i=> i.code === row.businessArea), "name") || row.businessArea;
    }

    readSortValue(row){
        return this.readCellValue(row)
    }
}

CompanyDebt.contextTypes = {
    translator: PropTypes.object
};
