import React from "react";
import _ from "lodash";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

import {TranslatingComponent} from 'susam-components/abstract';
import {Notify, DropDown} from 'susam-components/basic';
import {Card, Grid, GridCell, LoaderWrapper} from 'susam-components/layout';
import {ImportQueueService} from '../services/KartoteksService';

export class QueuePerformance extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.loadData();
    }

    loadData(){
        this.setState({busy: true});
        ImportQueueService.stats().then(response => {
            let data = {};
            Object.keys(response.data).forEach(key => {
                let line = {pending:0, success:0};
                let value = response.data[key];
                value.forEach(item => {
                    if(item[0].id == 'PENDING'){
                        line.pending = item[1];
                    }else if(item[0].id == 'SUCCESS'){
                        line.success = item[1];
                    }
                });

                line.ratio = 0;
                if((line.pending + line.success) > 0){
                    line.ratio = parseInt((line.success / (line.pending + line.success)) * 100);
                }
                if(line.ratio > 80){
                    line.label = "success";
                }else if(line.ratio > 50){
                    line.label = "warning";
                }else{
                    line.label = "danger";
                }
                data[key] = line;
            });

            this.setState({data: data, busy: false});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    render(){
        let chart = <div>{super.translate("There is no data available")}</div>;
        if(this.state.data){
            chart =
                <table className="uk-table">
                    <thead>
                    <tr>
                        <th className="uk-text-nowrap">Task</th>
                        <th className="uk-text-nowrap">Total</th>
                        <th className="uk-text-nowrap">Closed</th>
                        <th className="uk-text-nowrap">Progress</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        Object.keys(this.state.data).map(key => {
                            let value = this.state.data[key];
                            return (
                                <tr key = {key} className="uk-table-middle">
                                    <td className="uk-width-3-10 uk-text-nowrap">{key}</td>
                                    <td className="uk-width-1-10 uk-text-nowrap">{value.pending + value.success}</td>
                                    <td className="uk-width-1-10 uk-text-nowrap">{value.success}</td>
                                    <td className="uk-width-3-10" data-uk-tooltip="{pos:'bottom'}" title={value.ratio + '%'}>
                                        <div className={"uk-progress uk-progress-mini uk-progress-" + value.label + " uk-margin-remove"}>
                                            <div className="uk-progress-bar" style={{width:  value.ratio + '%'}}></div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    }

                    </tbody>
                </table>;
        }
        return <Card title="Performance Summary">
            <Grid>
                <GridCell width="1-1">
                    <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                        {chart}
                    </LoaderWrapper>
                </GridCell>
            </Grid>


        </Card>;
    }

}