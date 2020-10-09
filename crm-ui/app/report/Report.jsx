import React from "react";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, PageHeader, Card, CardHeader} from "susam-components/layout";
import {Notify, Button, Form, DropDown} from "susam-components/basic";
import {Date} from "susam-components/advanced";
import {CrmReportService} from '../services';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

export class Report extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {
            frequencies: [
                {id:"1", code:"3d", name:"3 days"},
                {id:"2", code:"1w", name:"1 week"},
                {id:"3", code:"1m", name:"1 month"}
            ]
        };
        this.moment = require("moment");
    }

    handleChange(key, value){
        let state = _.cloneDeep(this.state);
        state.dataByStatus = undefined;
        state.dataByShipmentLoadingType = undefined;
        _.set(state, key, value);
        this.setState(state);
    }


    enquireQuoteCounts(){
        if(this.form.validate()){
            axios.all([
                CrmReportService.enquireForQuoteCount(this.state.enquiryDate, this.state.frequency.code, ["status"]),
                CrmReportService.enquireForQuoteCount(this.state.enquiryDate, this.state.frequency.code, ["shipmentLoadingType"])
            ]).then(axios.spread((statusResponse, shipmentLoadingTypeResponse) => {
                this.adjustData(statusResponse);
                this.adjustData(shipmentLoadingTypeResponse);
            })).catch(error => {
                Notify.showError(error);
            })
        }
    }

    adjustData(response){
        let state = _.cloneDeep(this.state);
        let data  = [];
        let series = response.data.series;
        for (let key in series){
            if (series.hasOwnProperty(key)) {
                let point = {};
                point.name = key;
                series[key].forEach(scale =>{
                    point[scale.tags[0]] = scale.value;
                });
                data.push(point);
            }
        }
        if(data && data[0].WON){
            state.dataByStatus = data;
        }else if(data && data[0].FTL){
            state.dataByShipmentLoadingType = data;
        }
        this.setState(state);
    }

    renderChartByStatus(){
        if(this.state.dataByStatus){
            return (
                <Grid>
                    <GridCell width="1-1">
                        <Card>
                            <CardHeader title="Quotes By Status"/>
                            <BarChart width={1200} height={300} data={this.state.dataByStatus}
                                      margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend />
                                <Bar dataKey="WON" fill="#8884d8" />
                                <Bar dataKey="LOST" stackId="a" fill="#82ca9d" />
                                <Bar dataKey="CANCELED" stackId="a" fill="#ffc658"/>
                            </BarChart>
                        </Card>
                    </GridCell>
                </Grid>
            );
        }
    }

    renderChartByShipmentLoadingType(){
        if(this.state.dataByShipmentLoadingType){
            return (
                <Grid>
                    <GridCell width="1-1">
                        <Card>
                            <CardHeader title="Quotes By Shipment Loading Type"/>
                            <BarChart width={1200} height={300} data={this.state.dataByShipmentLoadingType}
                                      margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend />
                                <Bar dataKey="FTL" fill="#8884d8" />
                                <Bar dataKey="LTL" stackId="a" fill="#82ca9d" />
                            </BarChart>
                        </Card>
                    </GridCell>
                </Grid>
            );
        }
    }


    render(){
        let today = this.moment().format('DD/MM/YYYY');
        return (
            <div>
                <PageHeader title="Crm Report"/>
                <Form ref = {c => this.form = c}>
                    <Grid>
                        <GridCell width="1-4">
                            <Date label="Enquiry Date" required={true} maxDate={today} hideIcon={true}
                                  value={this.state.enquiryDate ? this.state.enquiryDate : null}
                                  onchange={(value) => this.handleChange("enquiryDate", value)} />
                        </GridCell>
                        <GridCell width="1-4">
                            <DropDown options = {this.state.frequencies} label="Frequency"
                                      value = {this.state.frequency} required={true}
                                      onchange = {(frequency) => {frequency ? this.handleChange("frequency", frequency) : null}}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <div className="uk-align-left">
                                <Button label="Enquire" style = "success"
                                        onclick = {() => this.enquireQuoteCounts()}/>
                            </div>
                        </GridCell>
                    </Grid>
                </Form>
                {this.renderChartByStatus()}
                {this.renderChartByShipmentLoadingType()}
            </div>
        );
    }
}