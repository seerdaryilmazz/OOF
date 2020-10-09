import React from "react";
import PropTypes from 'prop-types';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, RadioButton, Checkbox} from "susam-components/basic";

export const wizardNextSetting = {name: "wizardNextSetting", options: {companyPage: 'company-page', nextQueueItem: 'nextQueueItem'}};
export class QueueItemSaveSettings extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    updateState(value){
        if(value == wizardNextSetting.options.companyPage){
            this.setState({companyPage: true, nextQueueItem: false});
        }else if(value == wizardNextSetting.options.nextQueueItem){
            this.setState({nextQueueItem: true, companyPage: false});
        }
    }

    componentDidMount(){
        let nextAction = this.context.storage.read(wizardNextSetting.name);
        this.updateState(nextAction);
    }

    handleSelectSetting(value, action){
        if(value) {
            this.context.storage.write(wizardNextSetting.name, action);
            this.updateState(action);
            if(this.props.showSuccessMessage){
                Notify.showSuccess("Setting saved");
            }

        }
    }

    render(){
        return(

            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <ul className="md-list md-list-addon">
                        <li key = "company-page">
                            <div className="md-list-addon-element">
                                <RadioButton name="queueItemSaveAction" checked = {this.state.companyPage}
                                             onchange = {(value) => this.handleSelectSetting(value, wizardNextSetting.options.companyPage)} />
                            </div>
                            <div className="md-list-content">
                                <span className="md-list-heading">{super.translate("Open company page")}</span>
                                <span className="uk-text-small uk-text-muted">{super.translate("You will be redirected to company view-only page")}</span>
                            </div>
                        </li>
                        <li key = "next-queue-item">
                            <div className="md-list-addon-element">
                                <RadioButton name="queueItemSaveAction" checked = {this.state.nextQueueItem}
                                             onchange = {(value) => this.handleSelectSetting(value, wizardNextSetting.options.nextQueueItem)} />
                            </div>
                            <div className="md-list-content">
                                <span className="md-list-heading">{super.translate("Continue with the queue")}</span>
                                <span className="uk-text-small uk-text-muted">{super.translate("You will be redirected to process next queue item in your latest import queue search results")}</span>
                            </div>
                        </li>
                    </ul>
                </GridCell>
            </Grid>

        );
    }
}
QueueItemSaveSettings.contextTypes = {
    storage: PropTypes.object.isRequired
};