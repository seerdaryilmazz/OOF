import React from "react";
import {AgreementService} from "../services/AgreementService";
import {TranslatingComponent} from 'susam-components/abstract';
import {Notify} from "susam-components/basic";
import {ActionHeader, StringUtils} from "../utils";
import * as DataTable from 'susam-components/datatable';
import { Card, GridCell, LoaderWrapper, Grid, CardHeader } from 'susam-components/layout';



export class HistoryUnitPrice extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        AgreementService.getHistoryUnitPricesByUnitPriceId(this.props.unitPriceData.id).then(response=>{
            this.setState({historyUnitPrices:response.data})
        }).catch(e=>{
            Notify.showError(e);
        })
    }

    renderDataTable(){
        return(
            <Grid divider = {true}>
                <GridCell width="1-1" margin="small">
                    <DataTable.Table data={this.state.historyUnitPrices}>
                        <DataTable.Text header="BillingItem" field="billingItem" printer={new BillingItemPrinter()}/>
                        <DataTable.Text header="Service Name" field="serviceName"/>
                        <DataTable.Numeric header="Price" field="price" printer={new NumericPrinter(2)}/>
                        <DataTable.Text header="Currency" field="currency"/>
                        <DataTable.Text header="Based On" field="basedOn.name"/>
                        {/*<DataTable.Numeric header="EUR Ref" field="eurRef" printer={new NumericPrinter(2)}/>*/}
                        {/*<DataTable.Numeric header="USD Ref" field="usdRef" printer={new NumericPrinter(2)}/>*/}
                        {/*<DataTable.Numeric header="Minimum Wage Ref" field="minimumWageRef" printer={new NumericPrinter(2)}/>*/}
                        {/*<DataTable.Numeric header="Inflation Ref(%)" field="inflationRef" printer={new NumericPrinter(0)}/>*/}
                        <DataTable.Text header="Validity Start Date" field="validityStartDate"/>
                        <DataTable.Text header="Update Period" reader={new UpdatePeriodReader()}/>
                        <DataTable.Text header="Validity End Date" field="validityEndDate"/>
                        <DataTable.Text header="Price Model" field="priceModel.name"/>
                        <DataTable.DateTime header="Last Updated" field="lastUpdated" printer={new DatePrinter()}/>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        )
    }

    render(){
        let title= "Unit Price Changes --> "+ this.props.unitPriceData.billingItem.code +" "
            +this.props.unitPriceData.billingItem.description +" - "+this.props.unitPriceData.serviceName;
        return(
            <div>
                <CardHeader title={title}/>
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    {this.renderDataTable()}
                </LoaderWrapper>
            </div>
        )
    }
}

class BillingItemPrinter {
    print(data){
        if(data){
            data.label=data.code+" - "+data.description
        }
        return data.label;
    }
}

class NumericPrinter {

    constructor(scale) {
        this.scale = scale;
        this.displayData = "---";
    }

    print(data) {
        if (data || data === 0) {
            if (this.scale || this.scale === 0) {
                this.displayData = StringUtils.formatNumber(Number(data),this.scale);
            } else {
                this.displayData = data;
            }
            return (<span>{this.displayData}</span>)
        }
    }
}

class UpdatePeriodReader {
    readCellValue(row) {
        if (row.updatePeriod && row.renewalDateType) {
            return row.updatePeriod + " " + row.renewalDateType.id;
        }
        return "";
    }

    readSortValue(rowData){
        return this.readCellValue(rowData);
    }
}

class DatePrinter {
    constructor(){
    }
    print(data){
        data=data.substring(0,16);
        return data;
    }
}
