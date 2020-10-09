import React from "react";
import _ from 'lodash';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis,ReferenceLine } from 'recharts';

import {Notify, DropDown} from 'susam-components/basic';
import {Card, Grid, GridCell, LoaderWrapper} from 'susam-components/layout';
import {KpiService} from '../services/KpiService';

export class UserKpiChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount(){
        KpiService.listQueueCompleteKpisAssignedToMe().then(response => {
            let selectedKpi = null;
            if(response.data.length > 0){
                selectedKpi = response.data[0];
            }
            this.setState({kpis: response.data, selectedKpi: selectedKpi});
            if(selectedKpi){
                this.getKpiArchive(selectedKpi);
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }
    getKpiArchive(kpi){
        this.setState({busy: true});
        KpiService.getKpiArchive(kpi.id).then(response => {
            this.setState({kpiArchive: response.data, busy: false});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }
    handleKpiSelection(value){
        this.setState({selectedKpi: value});
        this.getKpiArchive(value);
    }

    render(){
        let chart = null;
        if(this.state.kpiArchive){
            let maxValue = this.state.selectedKpi.objective.value * 2;
            chart =
                <ResponsiveContainer height={200}>
                    <LineChart data={this.state.kpiArchive.archives}>
                        <ReferenceLine y={this.state.selectedKpi.objective.value} label="KPI" stroke="#d32f2f" strokeDasharray="3 3"/>
                        <Line type="monotone" dataKey="value" stroke="#8884d8" />
                        <XAxis dataKey="label" />
                        <YAxis domain = {[0, maxValue]}/>
                    </LineChart>
                </ResponsiveContainer>;
        }
        return (
            <Card title="KPI Charts">
                <Grid>
                    <GridCell width="1-1">
                        <DropDown label="Assigned Kpis" options = {this.state.kpis}
                                  value = {this.state.selectedKpi} labelField="description"
                                  onchange = {(value) => this.handleKpiSelection(value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <LoaderWrapper busy = {this.state.busy} size="S">
                            {chart}
                        </LoaderWrapper>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}
