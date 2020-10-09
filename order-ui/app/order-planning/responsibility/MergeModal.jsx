import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from "susam-components/basic";
import { Grid, GridCell, Modal } from "susam-components/layout";
import { HorizontalTimeline } from "./HorizontalTimeline";




export class MergeModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};

    }

    componentWillMount() {
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    openFor(index, segments) {

        if (index == 0) {
            return;
        }

        let selectedSegment = _.cloneDeep(segments[index]);
        let previousSegment = _.cloneDeep(segments[index - 1]);

        this.setState({
            segments: segments,
            selectedSegment: selectedSegment,
            previousSegment: previousSegment,
        }, () => {
            this.modal.open();
        });
    }

    close() {
        this.modal.close();
    }

    save() {
        this.props.handleSave(this.state.previousSegment.id, this.state.selectedSegment.id);
        this.setState({
            segments: null,
            selectedSegment: null,
            previousSegment: null
        }, () => {
            this.modal.close();
        })
    }

    createSampleTimelineData() {

        let list = [];

        list.push({
            fromLocation: this.state.previousSegment.fromLocation,
            toLocation: this.state.selectedSegment.toLocation,
            responsible: this.state.previousSegment.responsible
        });

        return list;
    }

    render() {

        let content = null;

        if (this.state.segments) {
            content = <Grid>
                <GridCell>
                    <HorizontalTimeline
                        segments={this.createSampleTimelineData()}
                    />
                </GridCell>
                <GridCell>
                    <Button style="close" label="Close"
                            onclick={() => {
                                this.close()
                            }}/>
                    <Button style="success" label="Confirm"
                            onclick={() => {
                                this.save()
                            }}/>
                </GridCell>
            </Grid>
        }

        return (
            <Modal title={"Divide"} ref={(c) => this.modal = c}>
                {content}
            </Modal>
        )
    }

}

MergeModal.contextTypes = {
    translator: React.PropTypes.object
};
