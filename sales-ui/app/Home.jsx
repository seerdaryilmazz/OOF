import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell} from "susam-components/layout";
import {Calculator} from "./calculator/Calculator";

export class Home extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {}
    }
    handleSelectDiscount(discounts){
        this.setState({selectedDiscounts: discounts});
    }
    render(){
        return (
            <div>
                <PageHeader title="sales home page" />
                <Grid>
                    <GridCell width = "2-3">
                        <Card>
                            <Calculator onChange = {(discounts) => this.handleSelectDiscount(discounts) }
                                        selectedItems = {this.state.selectedDiscounts} />
                        </Card>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}