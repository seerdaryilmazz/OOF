import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown } from "susam-components/basic";
import uuid from "uuid";


export class HorizontalTimeline extends TranslatingComponent {

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

    render() {

        let result = [];

        let segments = this.props.segments;


        segments.forEach((item, index) => {

            let divideButton = null;
            let mergeButton = null;
            if (this.props.divideHandler) {
                divideButton = <div className="timeline-horizontal_delete_button">
                    <Button label="Merge"
                            flat={true}
                            size="small"
                            style="danger"
                            onclick={() => this.props.mergeHandler(index)}/>
                </div>
            }
            if (this.props.mergeHandler) {
                mergeButton = <div className="timeline-horizontal_create_button">
                    <Button label="Divide"
                            flat={true}
                            size="small"
                            style="success"
                            onclick={() => this.props.divideHandler(index)}/>
                </div>
            }

            let warehouseContent = null;
            let responsibleContent = null;

            if (this.props.warehouseUpdateHandler) {
                warehouseContent = <DropDown placeholder="Please Select WH"
                                             options={this.props.warehouses}
                                             labelField="customName"
                                             value={item.fromLocation}
                                             onchange={(value) => this.props.warehouseUpdateHandler(index, value)}/>
            } else {
                warehouseContent = item.fromLocation ? item.fromLocation.name : "";
            }

            if (this.props.responsibleUpdateHandler) {
                responsibleContent = <DropDown placeholder="Please Select Subsidiary"
                                               label="Subsidiary"
                                               options={this.props.subsidiaries}
                                               value={item.responsible}
                                               onchange={(value) => this.props.responsibleUpdateHandler(index, value)}/>
            } else {
                responsibleContent = item.responsible ? item.responsible.name : "";
            }


            if (item == _.first(segments)) {
                result.push(
                    <div key={uuid.v4()} className="timeline-horizontal_item">
                        <div className="timeline-horizontal_icon">
                            <i className="material-icons">place</i>
                        </div>
                        <div className="timeline-horizontal_content">
                            <p>{item.fromLocation ? item.fromLocation.name : N / A}</p></div>
                    </div>);
            } else {
                result.push(
                    <div key={uuid.v4()} className="timeline-horizontal_item">
                        {divideButton}
                        <div className="timeline-horizontal_icon">
                            <i className="material-icons">home</i>
                        </div>
                        <div className="timeline-horizontal_content">
                            {warehouseContent}
                        </div>
                    </div>);
            }

            result.push(
                <div key={uuid.v4()} className="timeline-horizontal_item">
                    {mergeButton}
                    <div className="timeline-horizontal_subsidiary">
                        {responsibleContent}
                    </div>
                </div>);

            if (item == _.last(segments)) {
                result.push(
                    <div key={uuid.v4()} className="timeline-horizontal_item">
                        <div className="timeline-horizontal_icon">
                            <i className="material-icons">place</i>
                        </div>
                        <div className="timeline-horizontal_content">
                            <p>{item.toLocation ? item.toLocation.name : "N/A"}</p></div>
                    </div>);
            }

        });

        return (
            <div className="timeline-horizontal">
                {result}
            </div>
        );
    }

}

HorizontalTimeline.contextTypes = {
    translator: React.PropTypes.object
};
