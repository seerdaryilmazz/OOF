import React from "react";

import {Card, Grid, GridCell, PageHeader} from "susam-components/layout";
import {Notify, TextArea, Button} from 'susam-components/basic';

import {ImportQueueService} from '../services/KartoteksService';
import {withAuthorization} from '../security';

const SecuredCard = withAuthorization(Card, "kartoteks.import-queue.insert");

export class TestImportQueue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    handleSaveClick(){
        ImportQueueService.testImportQueue(JSON.parse(this.state.data)).then(response => {
            Notify.showSuccess("Queue updated successfully");
            this.setState({data: ""})
        }).catch(error => {
            Notify.showError(error);
        });
    }
    updateState(value){
        this.setState({data: value});
    }

    render(){

        return (
            <div>
                <PageHeader title="Insert Company to Merge Queue"/>
                <SecuredCard>
                    <Grid>
                        <GridCell width="1-1">
                            <TextArea rows = "20" onchange = {(value) => this.updateState(value)} value = {this.state.data}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <Button waves = {true} style="primary" label="Save" onclick = {() => this.handleSaveClick()}/>
                        </GridCell>
                    </Grid>
                </SecuredCard>
            </div>
        );
    }
}