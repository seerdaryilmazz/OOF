import React from "react";
import {AgreementService} from "../services/AgreementService";
import {TranslatingComponent} from 'susam-components/abstract';
import {Notify} from "susam-components/basic";
import {ActionHeader, StringUtils} from "../utils";
import * as DataTable from 'susam-components/datatable';
import { Card, GridCell, LoaderWrapper, Grid, CardHeader } from 'susam-components/layout';



export class HistoryModel extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        AgreementService.getHistoryModelsByModelId(this.props.priceModelData.id).then(response=>{
            this.setState({historyModels:response.data})
        }).catch(e=>{
            Notify.showError(e);
        })
    }

    renderDataTable(){
        return(
            <Grid divider = {true}>
                <GridCell width="1-1" margin="small">
                    <DataTable.Table data={this.state.historyModels}>
                        <DataTable.Text header="Validity Start Date" field="validityStartDate"/>
                        <DataTable.Text header="Validity End Date" field="validityEndDate"/>
                        <DataTable.Numeric header="EUR (%)" field="eur" printer={new NumericPrinter(0)}/>
                        <DataTable.Numeric header="USD (%)" field="usd" printer={new NumericPrinter(0)}/>
                        <DataTable.Numeric header="Inflation (%)" field="inflation" printer={new NumericPrinter(0)}/>
                        <DataTable.Numeric header="Minimum Wage (%)" field="minimumWage" printer={new NumericPrinter(0)}/>
                        <DataTable.DateTime header="Last Updated" field="lastUpdated" printer={new DatePrinter()}/>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        )
    }

    render(){
        if(!this.state.historyModels){
            return null;
        }else{
            let title= "Price Adaptation Model Changes - "+ this.props.priceModelData.name;
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

class DatePrinter {
    constructor(){
    }
    print(data){
        data=data.substring(0,16);
        return data;
    }
}
