import React from 'react';
import {Card, Grid, GridCell, PageHeader} from 'susam-components/layout';

import {PortfolioOwnerTasks} from "./PortfolioOwnerTasks";

export class PortfolioOwnerHome extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div>
                <PageHeader title="Hello, portfolio owner!" translate={true}/>
                <div className="uk-grid">
                    <div className="uk-width-medium-1-2">
                        <PortfolioOwnerTasks />
                    </div>
                </div>
            </div>
        );
    }
}