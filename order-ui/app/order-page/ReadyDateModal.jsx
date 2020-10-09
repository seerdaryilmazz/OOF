import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, Notify} from 'susam-components/basic';
import {DateTime} from 'susam-components/advanced';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';

export class ReadyDateModal extends TranslatingComponent {

    static moment = require("moment");
    static momentTimezone = require('moment-timezone');
    static momentFormat = "DD/MM/YYYY HH:mm";

    constructor(props) {
        super(props);
        this.state = {
            date: null,
            dateUI: null
        };
    }

    componentDidMount() {
        if (this.props.value) {
            this.prepareState(this.props.value);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value) {
            this.prepareState(nextProps.value);
        }
    }

    handleStateChange(value) {
        let state = _.cloneDeep(this.state);
        state.dateUI = value;
        this.setState(state);
    }

    handleSave() {
        if(this.state.dateUI) {

            let uiDateArr = this.state.dateUI.split(" ");

            let readyDateTime = uiDateArr[0] + " " + uiDateArr[1];
            let readyDateTimeTz = uiDateArr[2] ? uiDateArr[2] : 'UTC';

            
            let readyDateMoment = ReadyDateModal.momentTimezone.tz(readyDateTime, ReadyDateModal.momentFormat, true, readyDateTimeTz);

            let nowMoment = ReadyDateModal.moment().tz(readyDateTimeTz);

            if(readyDateMoment < nowMoment) {
                Notify.showError("Ready Date can not be earlier than current time.");
                return;
            }
        }
        this.setState({date: this.state.dateUI});
        this.props.onsave && this.props.onsave(this.state.date);
        this.modal.close();
    };

    show() {
        this.prepareState(this.state.date);
        this.modal.open();
    }

    close() {
        this.modal.close();
    }

    prepareState(date) {
        let state = {};
        state.date = date;
        state.dateUI = date;
        this.setState(state);
    }

    render() {
        return(
            <Modal ref={(c) => this.modal = c} title="Set Ready Date"
                   actions = {[{label:"Close", action:() => this.close()},
                       {label:"Save", buttonStyle:"primary", action:() => this.handleSave()}]}>
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        <DateTime label = "Ready at Date"
                                  timezone={this.props.timezone}
                                  onchange={(value) => this.handleStateChange(value)}
                                  value={this.state.dateUI} />
                    </GridCell>

                </Grid>
            </Modal>
        );
    }
}