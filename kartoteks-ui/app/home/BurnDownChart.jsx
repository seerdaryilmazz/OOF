import React from "react";
import _ from "lodash";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

import {TranslatingComponent} from 'susam-components/abstract';
import {Notify, DropDown} from 'susam-components/basic';
import {Card, Grid, GridCell, LoaderWrapper} from 'susam-components/layout';
import {ImportQueueService} from '../services/KartoteksService';

export class BurnDownChart extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.timePeriods = [{id:"7", name:"Last 7 days"}, {id:"15", name:"Last 15 days"}, {id:"30", name:"Last 30 days"}, {id:"90", name:"Last 90 days"}]
    }

    componentDidMount(){
        this.handlePeriodSelection(this.timePeriods[0]);
    }

    loadBurnDownData(period){
        this.setState({busy: true});
        ImportQueueService.burnDown(period).then(response => {
            let data = [];
            _.forEach(response.data, (value, key) => {
                data.push({key: key, value: value[0]-value[1]});
            });
            this.setState({data: data, busy: false});

        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }
    handlePeriodSelection(value){
        this.setState({selectedPeriod: value});
        this.loadBurnDownData(value.id);
    }
    render(){
        let chart = <div>{super.translate("There is no data for selected period")}</div>;
        if(this.state.data && this.state.data.length > 0){
            chart =
                <ResponsiveContainer height={200}>
                    <LineChart data={this.state.data}>
                        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{r: 8}}/>
                        <XAxis dataKey="key" />
                        <YAxis />
                        <Tooltip/>
                    </LineChart>
                </ResponsiveContainer>;
        }
        return <Card title="Queue Burn down chart">
            <Grid>
                <GridCell width="1-1">
                    <DropDown label="Period" options = {this.timePeriods}
                              value = {this.state.selectedPeriod}
                              onchange = {(value) => this.handlePeriodSelection(value)}/>
                </GridCell>
                <GridCell width="1-1">
                    <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                        {chart}
                    </LoaderWrapper>
                </GridCell>
            </Grid>


        </Card>;
    }

}