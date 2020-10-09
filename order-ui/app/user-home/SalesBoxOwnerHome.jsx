import React from 'react';
import {Card, Grid, GridCell, PageHeader} from 'susam-components/layout';

import {SalesBoxOwnerTasks} from "./SalesBoxOwnerTasks";

export class SalesBoxOwnerHome extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div>
                <PageHeader title="Hello, sales box owner!" translate={true}/>
                <div className="uk-grid">
                    <div className="uk-width-medium-1-2">
                        <SalesBoxOwnerTasks />
                    </div>
                </div>
            </div>
        );
    }
}