import './main.css';

import React from 'react';
import ReactDOM from 'react-dom';
import {Button} from 'susam-components/basic';
import {Grid, GridCell} from 'susam-components/layout';

ReactDOM.render(

            <Grid>
                <GridCell width="1-4">
                    <Button label="raised button"/>
                </GridCell>
                <GridCell width="1-4">
                    <Button label="raised waves button" waves={true}/>
                </GridCell>
                <GridCell width="1-4">
                    <Button label="flat button" flat={true}/>
                </GridCell>
                <GridCell width="1-4">
                    <Button label="flat waves button" flat={true} waves={true}/>
                </GridCell>
            </Grid>

    , document.getElementById('page_content_inner'));


