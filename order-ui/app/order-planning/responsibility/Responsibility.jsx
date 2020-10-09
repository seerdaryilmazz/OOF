import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Notify } from "susam-components/basic";
import { GridCell } from "susam-components/layout";
import uuid from "uuid";
import { DivideModal } from './DivideModal';
import { HorizontalTimeline } from './HorizontalTimeline';
import { MergeModal } from './MergeModal';


export class Responsibility extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handleCreateItem(index){
        let segments = this.props.segments;

        let newItem = {};

        newItem.responsible = {};
        newItem.fromLocation = {};

        newItem.toLocation = segments[index].toLocation;

        segments[index].id = null;
        segments[index].toLocation = null;
        segments.splice(index + 1, 0, newItem);

        this.props.segmentUpdateHandler(segments);
    }

    handleDeleteItem(index){
        let segments = this.props.segments;
        if(index > 0) {
            segments[index-1].id = null;
            segments[index-1].toLocation = segments[index].toLocation
        }
        segments.splice(index, 1);

        this.props.segmentUpdateHandler(segments);
    }

    updateWarehouse(index, value) {
        if (index == 0) {
            return;
        }

        Notify.confirm("Warehouse will permanently be updated, Are you sure?", () => {
            this.props.handleWarehouseUpdate(this.props.segments[index].id, value);
        });
    }

    updateResponsible(index, value){
        Notify.confirm("Responsible will permanently be updated, Are you sure?", () => {
            this.props.handleResponsibleUpdate(this.props.segments[index].id, value);
        });
    }

    openDivideModal() {
        this.divideModal.openFor();
    }

    openMergeModal() {
        this.mergeModal.openFor();
    }

    renderHorizontalTimeline() {
        let warehouses = this.props.lookup.warehouses.map(item => {
            if(this.props.collectionWarehouse && item.id === this.props.collectionWarehouse.id){
                item.customName = item.name + " (Collection)";
            }else if(this.props.distributionWarehouse && item.id === this.props.distributionWarehouse.id){
                item.customName = item.name + " (Distribution)";
            }else{
                item.customName = item.name;
            }
            return item;
        });

        let subsidiaries = this.props.lookup.subsidiaries;

        let result = [];

        let segments = this.props.segments;

        segments.forEach((item, index) => {

            if (item == _.head(segments)) {
                result.push(
                    <div key={uuid.v4()} className="timeline-horizontal_item">
                        <div className="timeline-horizontal_icon">
                            <i className="material-icons">place</i>
                        </div>
                        <div className="timeline-horizontal_content"><p>{item.fromLocation ? item.fromLocation.name : N/A}</p></div>
                    </div>);
            } else {
                result.push(
                    <div key={uuid.v4()} className="timeline-horizontal_item">
                        <div className="timeline-horizontal_delete_button">
                            <Button label="Delete"
                                    flat={true}
                                    size="small"
                                    style="danger"
                                    onclick={() => this.openMergeModal()}/>
                        </div>
                        <div className="timeline-horizontal_icon">
                            <i className="material-icons">home</i>
                        </div>
                        <div className="timeline-horizontal_content">

                                <DropDown placeholder="Please Select WH"
                                                  options={warehouses}
                                                  labelField = "customName"
                                                  value={item.fromLocation}
                                                  onchange={(value) => this.updateWarehouse(index, value)}/>
                        </div>
                    </div>);
            }

            result.push(
                <div key={uuid.v4()} className="timeline-horizontal_item">
                    <div className="timeline-horizontal_create_button">
                        <Button label="Create"
                                flat={true}
                                size="small"
                                style="success"
                                onclick={() => this.divideModal.openFor(index, segments)}/>
                    </div>
                    <div className="timeline-horizontal_subsidiary">
                        <DropDown placeholder="Please Select Subsidiary"
                                  label="Subsidiary"
                                  options={subsidiaries}
                                  value={item.responsible}
                                  onchange={(value) => this.updateResponsible(index, value)}/>
                    </div>
                </div>);

            if (item == _.last(segments)) {
                result.push(
                    <div key={uuid.v4()} className="timeline-horizontal_item">
                        <div className="timeline-horizontal_icon">
                            <i className="material-icons">place</i>
                        </div>
                        <div className="timeline-horizontal_content"><p>{item.toLocation ? item.toLocation.name : "N/A"}</p></div>
                    </div>);
            }

        });

        return result;
    }

    render() {
        if(!this.props.segments){
            return null;
        }

        let subsidiaries = this.props.lookup.subsidiaries;

        let warehouses = _.cloneDeep(this.props.lookup.warehouses).map(item => {
            if(this.props.collectionWarehouse && item.id === this.props.collectionWarehouse.id){
                item.customName = item.name + " (Collection)";
            }else if(this.props.distributionWarehouse && item.id === this.props.distributionWarehouse.id){
                item.customName = item.name + " (Distribution)";
            }else{
                item.customName = item.name;
            }
            return item;
        });

        return (
            <div>
                <GridCell width="1-1" noMargin={true}>
                    <h3 className="full_width_in_card heading_c">Assignment Line</h3>
                </GridCell>
                <HorizontalTimeline
                    warehouses={warehouses}
                    subsidiaries={subsidiaries}
                    segments={this.props.segments}
                    mergeHandler={(index) => {this.mergeModal.openFor(index, this.props.segments)}}
                    divideHandler={(index) => {this.divideModal.openFor(index, this.props.segments)}}
                    warehouseUpdateHandler = {(index, value) => {this.updateWarehouse(index, value)}}
                    responsibleUpdateHandler = {(index, value) => {this.updateResponsible(index, value)}}
                />

                <MergeModal ref={(c) => this.mergeModal = c}
                            handleSave={(previousSegmentId, nextSegmentId) => {this.props.handleMerge(previousSegmentId, nextSegmentId)}}/>
                <DivideModal ref={(c) => this.divideModal = c}
                             handleSave={(segmentId, warehouse, repsonsible) => {this.props.handleDivide(segmentId, warehouse, repsonsible)}}
                             warehouses={warehouses}
                             subsidiaries={this.props.lookup.subsidiaries}/>
            </div>
        );
    }
}
