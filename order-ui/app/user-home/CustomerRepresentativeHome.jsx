import React from 'react';
import { Grid, GridCell, PageHeader } from 'susam-components/layout';
import { CustomerRepresentativeOrderRequestList } from './CustomerRepresentativeOrderRequestList';
import { CustomerRepTasks } from './CustomerRepTasks';

export class CustomerRepresentativeHome extends React.Component {

    render() {
        return (
            <div>
                <PageHeader title="Hello, customer reps, have a nice day" translate={true}/>

                <Grid>
                    <GridCell width="1-2">
                        <CustomerRepTasks />
                    </GridCell>
                    <GridCell width="1-1">
                        <CustomerRepresentativeOrderRequestList />
                    </GridCell>
                </Grid>
            </div>
        );
    }
}