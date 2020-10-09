import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, Span} from 'susam-components/basic';

import {BurnDownChart} from './home/BurnDownChart';
import {UserKpiChart} from './home/UserKpiChart';
import {TopPriorityQueue} from './home/TopPriorityQueue';
import {QueuePerformance} from './home/QueuePerformance';
import {withAuthorization} from './security';

export class Home extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
    }

    render(){
        return(
            <div>
                <Grid>
                    <GridCell width="1-3">
                        <UserKpiChart />
                    </GridCell>
                    <GridCell width="1-3">
                        <SecuredBurnDownChart />
                    </GridCell>
                    <GridCell width="1-3">
                        <SecuredQueuePerformance />
                    </GridCell>
                    <GridCell width="1-1">
                        <SecuredTopPriorityQueue />
                    </GridCell>
                </Grid>
            </div>
        );
    }
}

const SecuredBurnDownChart = withAuthorization(BurnDownChart, "kartoteks.import-queue.get-statistics");
const SecuredQueuePerformance = withAuthorization(QueuePerformance, "kartoteks.import-queue.get-statistics");
const SecuredTopPriorityQueue = withAuthorization(TopPriorityQueue, "kartoteks.import-queue.list");
