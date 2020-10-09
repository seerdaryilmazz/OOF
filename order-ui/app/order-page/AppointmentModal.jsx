import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, Span} from 'susam-components/basic';
import {DateTime} from 'susam-components/advanced';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';

export class AppointmentModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            dateRange: {},
            start: null,
            end: null
        };
    }

    componentDidMount() {
        if (this.props) {
            this.prepareState(this.props);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps) {
            this.prepareState(nextProps);
        }
    }

    handleStateChange(key, value) {
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handleSave() {

        let dateRange = _.cloneDeep(this.state.dateRange);

        dateRange.start = this.state.start;
        dateRange.end = this.state.end;

        this.setState({dateRange: dateRange});

        this.props.onsave && this.props.onsave(this.state.dateRange);

        this.modal.close();
    };

    close() {
        this.modal.close();
    }

    show() {
        this.prepareState(this.state.dateRange);
        this.modal.open();
    }

    prepareState(props) {
        let state = {};
        if(props.value) {
            state.dateRange = props.value;
            state.start = props.value.start;
            state.end = props.value.end;
        }
        if(props.baseValue) {
            state.baseValue = props.baseValue;
        }
        this.setState(state);
    }

    renderBaseValueContent() {
        let baseValue = this.state.baseValue;
        if(baseValue) {
            return <GridCell width="1-1" noMargin = {true}>
                <Span label={baseValue.title} value={baseValue.value}/>
            </GridCell>
        }
        return null;
    }

    render() {
        return(
            <Modal ref={(c) => this.modal = c} title="Set Appointment"
                   actions = {[{label:"Close", action:() => this.close()},
                       {label:"Save", buttonStyle:"primary", action:() => this.handleSave()}]}>
                <Grid>
                    {this.renderBaseValueContent()}
                    <GridCell width="1-1" noMargin = {true}>
                        <DateTime label = "Start Date" timezone={this.props.timezone}
                                  onchange={(value) => this.handleStateChange("start", value)}
                                  value={this.state.start} />
                    </GridCell>
                    <GridCell width="1-1">
                        <DateTime label = "End Date" timezone={this.props.timezone}
                                  onchange={(value) => this.handleStateChange("end", value)}
                                  value={this.state.end} />
                    </GridCell>

                </Grid>
            </Modal>
        );
    }
}