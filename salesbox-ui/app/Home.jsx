import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, Span} from 'susam-components/basic';

export class Home extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
    }

    render(){
        return(
            <div>
                <Grid>
                    <GridCell width="1-1">
                        Welcome home salesbox
                    </GridCell>
                </Grid>
            </div>
        );
    }
}
