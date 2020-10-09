import _ from "lodash";
import * as axios from 'axios';
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Span, Form} from "susam-components/basic";

export class RegionForm extends TranslatingComponent {

    constructor(props){
        super(props);
    }

    handleSave(){
        if(!this.form.validate()){
            return;
        }
        this.props.onSave && this.props.onSave();
    }
    update(key, value){
        let region = _.cloneDeep(this.props.region);
        region[key] = value;
        this.props.onChange && this.props.onChange(region);
    }

    render(){
        if(!this.props.region){
            return null;
        }
        return (
            <Grid>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                        <GridCell width="1-3">
                            <TextInput label="Region Name" required = {true} uppercase = {true}
                                       value = {this.props.region.regionName}
                                       onchange = {(value) => this.update("regionName", value)} />
                        </GridCell>
                        <GridCell width="1-1">
                            <TextInput label="Postal Codes" required = {true}
                                       value = {this.props.region.separatedPostalCodes}
                                       onchange = {(value) => this.update("separatedPostalCodes", value)} />
                        </GridCell>
                            <GridCell width="1-1">
                                <TextInput label="Message"
                                           value = {this.props.region.regionMessage}
                                           onchange = {(value) => this.update("regionMessage", value)} />
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Save" style="primary" size="small" onclick = {() => this.handleSave()} />
                    </div>
                </GridCell>
            </Grid>
        );
    }

}