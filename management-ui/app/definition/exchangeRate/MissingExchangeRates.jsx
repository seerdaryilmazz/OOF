import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader, Pagination, Modal} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import {Date as DateSelector} from 'susam-components/advanced';

import {CurrencyService} from "../../services";
import {DateUtils} from "../../utils";

export class MissingExchangeRates extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            publishers: [],
            publisher: null,
            publishDate: DateUtils.formatDate(DateUtils.getToday())
        };
    }

    componentDidMount() {
        axios.all([
            CurrencyService.findAllExchangeRatePublishers(),
        ]).then(axios.spread((response) => {
            this.setState({publishers: this.sortPublishers(response.data)});
        })).catch((error) => {
            Notify.showError(error);
        });
    }

    open(publisher) {
        this.setState({publisher: publisher});
        this.modalReference.open();
    }

    sortPublishers(publishers) {
        return _.sortBy(publishers, ["name"]);
    }

    updatePublisher(value) {
        this.setState({publisher: value});
    }

    updatePublishDate(value) {
        this.setState({publishDate: value});
    }

    handleCloseClick() {
        this.modalReference.close();
        this.props.onClose();
    }

    handleSaveClick() {

        let goon = true;
        let publisher = this.state.publisher;
        let publishDate = this.state.publishDate;

        if (!publisher) {
            goon = false;
            Notify.showError("A publisher must be specified.");
        }

        if (goon && !publishDate) {
            goon = false;
            Notify.showError("A publish date must be specified.");
        }

        if (goon) {
            CurrencyService.getExchangeRatesFromPublisherAndSave(publisher, publishDate).then(response => {
                Notify.showSuccess("Exchange rates retrieved and saved.");
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    render() {
        return (
            <Modal title=""
                   large={false}
                   ref={(c) => this.modalReference = c}>
                <Grid>
                    <GridCell width="1-1">
                        <DropDown label="Publisher"
                                  value={this.state.publisher}
                                  onchange={(value) => this.updatePublisher(value)}
                                  options={this.state.publishers}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <DateSelector label="Publish Date"
                                      value={this.state.publishDate}
                                      onchange={(value) => this.updatePublishDate(value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button label="Close" waves={true} onclick={() => this.handleCloseClick()}/>
                            <Button label="Retrieve From Publisher And Save" style="primary" waves={true} onclick={() => this.handleSaveClick()}/>
                        </div>
                    </GridCell>
                </Grid>
            </Modal>
        );
    }
}

MissingExchangeRates.contextTypes = {
    router: React.PropTypes.object.isRequired
};