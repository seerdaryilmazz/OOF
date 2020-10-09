import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, Span, Form} from 'susam-components/basic';
import {Chip, NumericInput} from 'susam-components/advanced';

export class TrailerParkAttributes extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        this.initializeState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {
        let state =  _.cloneDeep(this.state);
        if (props.place) {
            state.place =  props.place;
        }
        this.setState(state);
    }

    updateState(field, value) {
        let place = this.state.place;
        place[field] = value;
        this.updateData(place);
    }


    updateData(place) {
        this.setState({place: place});
    }

    next() {
        let data = this.state.data;
        return new Promise(
            (resolve, reject) => {
                if(!this.form.validate()) {
                    Notify.showError("There are eori problems");
                    reject();
                }else {
                    this.props.handleSave && this.props.handleSave(this.state.place);
                    resolve(true);
                }
            });
    }

    render() {
        if (!this.state.place) {
            return null;
        }
        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Security Information"/>
                </GridCell>
                <GridCell width="1-2">
                    <Form ref={(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-1">
                                <Checkbox label="Has Security Staff"
                                          value = {this.state.place.hasSecurityStaff}
                                          onchange = {(value) => this.updateState("hasSecurityStaff", value)} />
                            </GridCell>
                            <GridCell width="1-1">
                                <Checkbox label="Has Camera"
                                          value = {this.state.place.hasCamera}
                                          onchange = {(value) => this.updateState("hasCamera", value)} />
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
            </Grid>
        );
    }
}