import React from 'react';
import { Card, Grid, GridCell } from 'susam-components/layout';

export class AccountCard extends React.Component {
    render() {
        let { account } = this.props;
        return (<Card>
            <Grid collapse={true} removeTopMargin={true}>
                <GridCell width="1-1">
                    <a style={{color:'black'}} href={`/ui/crm/account/${account.id}/view`}><u>{account.name}</u></a>
                </GridCell>
                <GridCell width="1-1">
                    <div style={{float:"left", width:"34%"}}>
                        {account.country.name}
                    </div>
                    <div style={{float:"left", width:"33%", textAlign:"center"}}>
                        {account.accountType.name}
                    </div>
                    <div style={{float:"left", width:"33%", textAlign:"right"}}>
                        {account.segment.name}
                    </div>
                </GridCell>
            </Grid>
        </Card>);
    }
}