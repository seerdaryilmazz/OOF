import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, DropDownButton} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";

import {QueueItemSaveSettings} from './QueueItemSaveSettings';

export class Settings extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render(){
        return(
            <div>
                <PageHeader title="Settings"/>
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin = {true}>
                            <CardHeader title="When i save a queue item"/>
                        </GridCell>
                        <GridCell width="1-1">
                            <QueueItemSaveSettings showSuccessMessage = {true}/>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}