import React from 'react';
import {Card, Grid, GridCell, PageHeader} from 'susam-components/layout';

import {TaskCard} from '../Task';

export class VehiclePlanningHome extends React.Component {

    /*constructor(props) {
     super(props);
     this.state = {};
     if (this.props.location.query) {
     console.log("props.location.query: " + this.props.location.query.customId);
     //this.state.taskId = this.props.location.query.taskId;
     }
     }*/

    render() {
        let title = "Hello, vehicle planners ";
        if(this.props.params.country){
            title += this.props.params.country;
        }
        return (
            <div>
                <PageHeader title={title}/>
                <div className="uk-grid">
                    <div className="uk-width-medium-1-2">
                        <TaskCard />
                    </div>
                </div>
            </div>
        );
    }
}