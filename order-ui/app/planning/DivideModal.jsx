import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown, Notify} from 'susam-components/basic';
import {DateTime} from 'susam-components/advanced';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';

export class DivideModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            dateRange: {},
            start: null,
            end: null
        };
    }

    openFor(segment) {
        this.setState({segment: segment}, () => {
            this.modal.open();
        })
    }


    handleSave() {
        if(!this.state.selectedCrossDock) {
            Notify.showError("Cross Dock is empty.");
            return;
        }
        let segment = _.cloneDeep(this.state.segment);
        let selectedXDock = _.cloneDeep(this.state.selectedCrossDock);
        if(this.props.handleDivideSegment(segment, selectedXDock)) {
            this.modal.close();
        }
    };

    close() {
        this.setState({segment: null, selectedCrossDock: null}, () => {
            this.modal.close();
        })
    }

    renderSegment(segment) {
        return (
            <Grid>
                <GridCell width="1-5">
                </GridCell>
                <GridCell width="2-5">
                    <span className="uk-text-primary">From</span>
                </GridCell>
                <GridCell width="2-5">
                    <span className="uk-text-primary">To</span>
                </GridCell>
                <GridCell width="1-5" noMargin={true}/>
                <GridCell width="2-5" noMargin={true}>
                    <ul className="md-list">
                        <li>
                            <div>
                                <span className="uk-text-bold">{segment.fromLocation.countryIsoCode + "-" + segment.fromLocation.postalCode}</span>
                            </div>
                            <div>
                                <span className="md-color-grey-600 uk-text-weight-500">{segment.fromLocation.name}</span>
                            </div>
                        </li>
                    </ul>
                </GridCell>
                <GridCell width="2-5" noMargin={true}>
                    <ul className="md-list">
                        <li>
                            <div>
                                <span className="uk-text-bold">{segment.toLocation.countryIsoCode + "-" + segment.toLocation.postalCode}</span>
                            </div>
                            <div>
                                <span className="md-color-grey-600 uk-text-weight-500">{segment.toLocation.name}</span>
                            </div>
                        </li>
                    </ul>
                </GridCell>
            </Grid>
        )
    }

    render() {

        let segment = this.state.segment;

        let content = null;
        if(segment) {
            content = <Grid>
                <GridCell width="1-1">
                    <span className="uk-text-bold">Chosen Segment</span>
                </GridCell>
                <GridCell width="1-1">
                    {this.renderSegment(segment)}
                </GridCell>
                <GridCell width="1-1">
                    <span className="uk-text-bold">Add New Stop</span>
                </GridCell>
                <GridCell width="1-5"/>
                <GridCell width="4-5">
                    <DropDown label="CrossDock"
                              options={this.props.warehouses}
                              onchange={(value) => this.setState({"selectedCrossDock": value})}
                              value={this.state.selectedCrossDock}/>
                </GridCell>
            </Grid>
        }

        return (
            <Modal ref={(c) => this.modal = c} title="Divide Segments"
                   actions={[{label: "Close", action: () => this.close()},
                       {label: "Save", buttonStyle: "primary", action: () => this.handleSave()}]}>
                {content}
            </Modal>
        );
    }
}