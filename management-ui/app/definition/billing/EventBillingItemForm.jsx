import React from "react";
import _ from 'lodash';
import * as axios from 'axios';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, CardHeader} from "susam-components/layout";
import {Notify, DropDown, Form, Span, TextInput} from "susam-components/basic";

import {BillingService} from '../../services';

export class EventBillingItemForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount(){
        this.initialize(this.props);
    }

    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }

    initialize(props) {
        if (props) {
            this.setState({activePeriod: props.selectedItem.code, activeLabel: props.selectedItem.name});
        }else{
            this.setState({activePeriod: "", activeLabel: ""});
        }

        axios.all([
            BillingService.listBillingEvents(),
            BillingService.listBillingItems()
        ]).then(axios.spread((events, items) => {
            let state = _.cloneDeep(this.state);
            state.billingEvents = events.data;
            state.billingItems = items.data;
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
        })
    }

    updateState(key, value){
        this.props.onchange && this.props.onchange(key, value);
    }

    validate(){
        return this.form.validate();
    }

    reset(){
        return this.form.reset();
    }

    render(){
        if(!this.props.selectedItem){
            return null;
        }

        return (
            <div>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <CardHeader title="Event Billing Item Definition"/>
                    </GridCell>
                </Grid>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <Form ref = {(form) => this.form = form}>
                            <Grid>
                                <GridCell width="1-3">
                                    <DropDown label="Event"
                                              options = {this.state.billingEvents}
                                               value = {this.props.selectedItem.event}
                                               onchange = {(value) => this.updateState("event", value)}
                                               required = {true} />
                                </GridCell>
                                <GridCell width="2-3">
                                    <DropDown label="Billing Item"
                                              options = {this.state.billingItems}
                                              value = {this.props.selectedItem.billingItem}
                                              onchange = {(value) => this.updateState("billingItem", value)}
                                              required = {true} />
                                </GridCell>
                            </Grid>
                        </Form>
                    </GridCell>
                </Grid>
            </div>

        );
    }
}
