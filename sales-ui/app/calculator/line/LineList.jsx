import _ from "lodash";
import * as axios from 'axios';
import React from "react";
import PropTypes from "prop-types";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {TextInput, Button} from "susam-components/basic";
import {Grid, GridCell, CardHeader} from "susam-components/layout";


export class LineList extends TranslatingComponent {

    constructor(props){
        super(props);
    }

    handleEditScales(line){
        this.props.onEdit && this.props.onEdit(line);
    }

    renderLine(lineScales){
        return(
            <li key = {lineScales.line.id}>
                <div className="md-list-content">
                    <Grid smallGutter = {true} collapse = {true}>
                        <GridCell width="2-4" noMargin = {true} >
                            {lineScales.line.fromCountry.name} - {lineScales.line.toCountry.name}
                        </GridCell>
                        <GridCell width="1-4" noMargin = {true}>
                            {lineScales.scales.length} {super.translate("scales")}
                        </GridCell>
                        <GridCell width="1-4" noMargin = {true} >
                            <div className="uk-align-right uk-margin-bottom">
                                <Button label="edit scales" size="small" style="success" flat = {true}
                                        onclick = {() => this.handleEditScales(lineScales.line)} />
                            </div>
                        </GridCell>
                    </Grid>
                </div>
            </li>
        );
    }

    render(){

        let list = <div>{super.translate("There are no lines")}</div>;
        if(this.props.lines && this.props.lines.length > 0){
            list = this.props.lines.map(line => {
                return this.renderLine(line);
            });
        }

        return (
            <div>
                <CardHeader title="Lines"/>
                <ul className="md-list md-list-compact">
                    {list}
                </ul>
            </div>
        );
    }

}
LineList.contextTypes = {
    translator: PropTypes.object
};