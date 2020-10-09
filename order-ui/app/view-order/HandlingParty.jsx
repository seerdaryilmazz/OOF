import React from 'react';

import {TranslatingComponent} from 'susam-components/abstract';
import {Loader, Grid, GridCell, CardHeader} from 'susam-components/layout';

export class HandlingParty extends TranslatingComponent{

    state = {};

    constructor(props){
        super(props);
    }

    render(){
        let {handlingParty, title} = this.props;
        if(!handlingParty){
            return null;
        }
        let companyContact = handlingParty.companyContact && handlingParty.companyContact.name ?
            ("(" + handlingParty.companyContact.name + ")") : "";
        let handlingContact = handlingParty.handlingContact && handlingParty.handlingContact.name ?
            ("(" + handlingParty.handlingContact.name + ")") : "";
        return (
            <Grid>
                <GridCell width = "1-1">
                    <CardHeader title = {title} />
                </GridCell>
                <GridCell width = "1-1">
                    <span className = "uk-text-bold" title = {handlingParty.company.name}>
                        {handlingParty.company.name}
                    </span>
                    <span className = "uk-text-muted">{companyContact}</span>
                </GridCell>
                <GridCell width = "1-1">
                    <span>Location:</span>
                </GridCell>
                <GridCell width = "1-1">
                    <span className = "uk-text-bold" title = {handlingParty.handlingLocation.name}>
                        {handlingParty.handlingLocation.name}
                    </span>
                    <span className = "uk-text-muted">{handlingContact}</span>
                </GridCell>
                <GridCell width = "1-1">
                    {handlingParty.handlingCompany.name}
                </GridCell>
                <GridCell width = "1-1">
                    {handlingParty.handlingLocationCountryCode}-{handlingParty.handlingLocationPostalCode}
                </GridCell>
            </Grid>
        );
    }
}