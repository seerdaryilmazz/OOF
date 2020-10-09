import React from 'react';
import {Card, Grid, GridCell, PageHeader} from 'susam-components/layout';

import {TaskCard} from '../Task';

export class DataEntryHome extends React.Component {

    /*constructor(props) {
        super(props);
        this.state = {};
        if (this.props.location.query) {
            console.log("props.location.query: " + this.props.location.query.customId);
            //this.state.taskId = this.props.location.query.taskId;
        }
    }*/

    render() {
        return (
            <div>
                <PageHeader title="Hello, data entry" />
                <div className="uk-grid">
                    <div className="uk-width-medium-1-2">
                        <TaskCard />
                    </div>
                </div>
            </div>
        );
    }
}