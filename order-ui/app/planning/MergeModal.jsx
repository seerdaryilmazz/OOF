import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown, Checkbox, Notify} from 'susam-components/basic';
import {DateTime} from 'susam-components/advanced';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';
import {ShipmentAssignmentPlanningService} from "../services";

export class MergeModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            dateRange: {},
            start: null,
            end: null
        };
    }

    openFor(segment, segments) {
        ShipmentAssignmentPlanningService.mergeableSegments(segment.id).then((response) => {

            let mergeableSegments = [];

            response.data.forEach(segmentId => {
                let mergeableSegment = segments.find(segment => segment.id == segmentId);
                if(mergeableSegment) {
                    mergeableSegments.push(mergeableSegment);
                } else {
                    console.log("Segment is not found.");
                    return;
                }
            })

            this.setState({
                segment: segment,
                mergeableSegments: mergeableSegments,
                checkedSegmentsIds: []
            }, () => {
                this.modal.open();
            })
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    handleSave() {
        let checkedSegmentsIds = this.state.checkedSegmentsIds
        if(!checkedSegmentsIds || checkedSegmentsIds.length  < 1) {
            Notify.showError("At least one Stop needs to be selected.");
            return;
        }
        let segment = _.cloneDeep(this.state.segment);


        if(this.props.handleMergeSegment(segment, checkedSegmentsIds)) {
            this.modal.close();
        }
    };

    handleOptionChange(id, value) {
        let checkedSegmentsIds = this.state.checkedSegmentsIds;
        if(value) {
            if(!checkedSegmentsIds.includes(id)) {
                checkedSegmentsIds.push(id);
            }
        } else {
            checkedSegmentsIds = checkedSegmentsIds.filter(elId => elId != id);
        }
        this.setState({checkedSegmentsIds: checkedSegmentsIds});
    }

    close() {
        this.setState({
            segment: null,
            mergeableSegments: null,
            checkedSegmentsIds: null
        }, () => {
            this.modal.close();
        })
    }

    renderSegment(segment, checkBoxContent) {
        return (
            <Grid key={segment.id}>
                <GridCell width="1-5">
                    <div className="uk-float-right">
                        {checkBoxContent}
                    </div>
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
        let mergeableSegments = this.state.mergeableSegments;
        let checkedSegmentsIds = this.state.checkedSegmentsIds;
        let lastCheckedSegmentId = null;
        if(checkedSegmentsIds && checkedSegmentsIds.length > 0) {
            lastCheckedSegmentId = checkedSegmentsIds[checkedSegmentsIds.length-1];
        }


        let selectedSegmentContent = null;
        let optionsContent;
        let options = [];

        if(segment) {
            selectedSegmentContent = <Grid>
                <GridCell width="1-1">
                    <span className="uk-text-bold">Chosen Segment</span>
                </GridCell>
                <GridCell width="1-1">
                    {this.renderSegment(segment, null)}
                </GridCell>
            </Grid>

            let previousSegmentId = null;
            mergeableSegments.forEach(seg => {
                let isEnabled = lastCheckedSegmentId == previousSegmentId || seg.id == lastCheckedSegmentId;
                let checkBoxElem =
                    <Checkbox
                        disabled={!isEnabled}
                        onchange={(value) => {this.handleOptionChange(seg.id, value)}} value={checkedSegmentsIds.includes(seg.id)}/>

                options.push(
                    this.renderSegment(seg, checkBoxElem)
                )
                previousSegmentId = seg.id;
            })


            optionsContent = <Grid>
                <GridCell width="1-1">
                    <span className="uk-text-bold">Chosen Segment</span>
                </GridCell>
                <GridCell width="1-1">
                    {options}
                </GridCell>
            </Grid>

        }

        return (
            <Modal ref={(c) => this.modal = c} title="Merge Segments"
                   actions={[{label: "Close", action: () => this.close()},
                       {label: "Save", buttonStyle: "primary", action: () => this.handleSave()}]}>
                {selectedSegmentContent}
                {optionsContent}
            </Modal>
        );
    }
}