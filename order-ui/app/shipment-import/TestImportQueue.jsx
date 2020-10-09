import * as axios from 'axios';
import React from "react";
import { Button, Notify, TextArea } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from "susam-components/layout";

export class TestImportQueue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    handleSaveClick() {
        _.isjson
        axios.post(`/order-queue-service/import/shipment`, JSON.parse(this.state.data)).then(response => {
            Notify.showSuccess("Queue updated successfully");
            this.setState({ data: "" })
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updateState(value) {
        this.setState({ data: value });
    }

    isJsonString(str) {
        try {
            JSON.parse(str);
        }
        catch (e) {
            return false;
        }
        return true;
    }

    render() {

        return (
            <div>
                <PageHeader title="Insert Shipment to Import Queue"  translate={true}/>
                <Card>
                    <Grid>
                        <GridCell width="1-1">
                            <TextArea rows="20" onchange={(value) => this.updateState(value)} value={this.state.data} />
                        </GridCell>
                        <GridCell width="1-1">
                            <Button waves={true} style="primary" label="Save" disabled={!this.isJsonString(this.state.data)} onclick={() => this.handleSaveClick()} />
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}