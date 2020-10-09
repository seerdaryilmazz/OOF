import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown } from "susam-components/basic";
import { Grid, GridCell, Modal } from "susam-components/layout";
import { HorizontalTimeline } from "./HorizontalTimeline";




export class DivideModal extends TranslatingComponent {

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

        let selectedSegment = _.cloneDeep(segments[index]);

        this.setState({
            segments: segments,
            selectedSegment: selectedSegment,
            warehouse: null,
            responsible:null
        }, () => {
            this.modal.open();
        });
    }

    close() {
        this.modal.close();
    }

    save() {
        this.props.handleSave(this.state.selectedSegment.id, this.state.warehouse, this.state.responsible);
        this.setState({
            segments: null,
            selectedSegment: null
        }, () => {
            this.modal.close();
        })
    }

    createSampleTimelineData() {

        let list = [];

        list.push({
            fromLocation: this.state.selectedSegment.fromLocation,
            toLocation: this.state.warehouse,
            responsible: this.state.selectedSegment.responsible
        });

        list.push({
            fromLocation: this.state.warehouse,
            toLocation: this.state.selectedSegment.toLocation,
            responsible: this.state.responsible
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
                    <DropDown placeholder="Please Select Warehouse"
                              label="Warehouse"
                              options={this.props.warehouses}
                              value={this.state.warehouse}
                              onchange={(value) => {
                                  this.setState({warehouse: value})
                              }}/>
                </GridCell>
                <GridCell>
                    <DropDown placeholder="Please Select Subsidiary"
                              label="Subsidiary"
                              options={this.props.subsidiaries}
                              value={this.state.responsible}
                              onchange={(value) => {
                                  this.setState({responsible: value})
                              }}/>
                </GridCell>
                <GridCell>
                    <Button style="close" label="Close"
                            onclick={() => {
                                this.close()
                            }}/>
                    <Button style="success" label="Save"
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

DivideModal.contextTypes = {
    translator: React.PropTypes.object
};
