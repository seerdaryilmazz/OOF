import React from "react";
import {Span} from "susam-components/basic";
import {DateTime} from "susam-components/advanced";

import {Grid, GridCell, Modal} from "susam-components/layout";

import {PlanningSearchConstans} from "./PlanningSearchConstans";

export class DateEditModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            tripPlanId: null,
            tripStopId: null,
            actualTimeArrival: null,
            updateFunction: null,
            readOnlyJobDates: true,
            tripStopName: null,
            shipmentLoadingStartDate: null,
            shipmentLoadingEndDate: null,
            shipmentUnloadingStartDate: null,
            shipmentUnloadingEndDate: null,
            actualTimeDeparture: null
        };
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    openFor(tripPlanId, tripStop, updateFunction) {
        let state = this.getInitialState();
        state.readOnlyJobDates = tripStop.locationType == PlanningSearchConstans.LOCATION_TYPE_WAREHOUSE ? true : false;
        state.updateFunction = updateFunction;
        state.tripPlanId = tripPlanId;
        state.tripStopId = tripStop.id;
        state.tripStopName = tripStop.locationName;
        state.actualTimeArrival = this.convertDateTimeObjectToLocalDateTime(tripStop.actualTimeArrival);
        state.shipmentLoadingStartDate = this.convertDateTimeObjectToLocalDateTime(tripStop.shipmentLoadingStartDate);
        state.shipmentLoadingEndDate = this.convertDateTimeObjectToLocalDateTime(tripStop.shipmentLoadingEndDate);
        state.shipmentUnloadingStartDate = this.convertDateTimeObjectToLocalDateTime(tripStop.shipmentUnloadingStartDate);
        state.shipmentUnloadingEndDate = this.convertDateTimeObjectToLocalDateTime(tripStop.shipmentUnloadingEndDate);
        state.actualTimeDeparture = this.convertDateTimeObjectToLocalDateTime(tripStop.actualTimeDeparture);

        this.setState(state, () => {
            this.modal.open();
        });
    }

    convertDateTimeObjectToLocalDateTime(dateObj) {
        return dateObj ? dateObj.localDateTime + " " + dateObj.timezone : null;
    }

    close() {
        this.setState(this.getInitialState(), () => {
            this.modal.close();
        })
    }

    handleSave() {
        let state = this.state;
        let data = {
            actualTimeArrival: state.actualTimeArrival,
            shipmentLoadingStartDate: state.shipmentLoadingStartDate,
            shipmentLoadingEndDate: state.shipmentLoadingEndDate,
            shipmentUnloadingStartDate: state.shipmentUnloadingStartDate,
            shipmentUnloadingEndDate: state.shipmentUnloadingEndDate,
            actualTimeDeparture: state.actualTimeDeparture
        }
        this.state.updateFunction(state.tripPlanId, state.tripStopId, data);
    }


    renderActualTimeArrival() {
        if (!this.state.actualTimeArrival) {
            return null;
        }
        return (
            <GridCell>
                <Grid>
                    <GridCell noMargin="true" width="1-2">
                        <DateTime label="Arrival Date" hideIcon={true} timeAsTextInput={true}
                                  value={this.state.actualTimeArrival}
                                  onchange={(value) => {
                                      this.setState({actualTimeArrival: value})
                                  }}/>
                    </GridCell>
                </Grid>
            </GridCell>
        );
    }

    renderShipmentLoadingDates() {
        let startDateContent;
        let endDateContent;

        if (!this.state.shipmentLoadingStartDate) {
            startDateContent = null;
        } else if (this.state.readOnlyJobDates) {
            startDateContent = <Span label="Loading Started" value={this.state.shipmentLoadingStartDate}/>
        } else {
            startDateContent = <DateTime label="Loading Started" hideIcon={true} timeAsTextInput={true}
                                         value={this.state.shipmentLoadingStartDate}
                                         onchange={(value) => {
                                             this.setState({shipmentLoadingStartDate: value})
                                         }}/>
        }

        if (!this.state.shipmentLoadingEndDate) {
            endDateContent = null;
        }
        else if (this.state.readOnlyJobDates) {
            endDateContent = <Span label="Loading Completed" value={this.state.shipmentLoadingEndDate}/>
        } else {
            endDateContent = <DateTime label="Loading Completed" hideIcon={true} timeAsTextInput={true}
                                       value={this.state.shipmentLoadingEndDate}
                                       onchange={(value) => {
                                           this.setState({shipmentLoadingEndDate: value})
                                       }}/>
        }

        if (startDateContent || endDateContent) {
            return (
                <GridCell>
                    <Grid>
                        <GridCell noMargin="true" width="1-2">
                            {startDateContent}
                        </GridCell>
                        <GridCell noMargin="true" width="1-2">
                            {endDateContent}
                        </GridCell>
                    </Grid>
                </GridCell>
            );
        } else {
            return null;
        }
    }

    renderShipmentUnloadingDates() {

        let startDateContent;
        let endDateContent;

        if (!this.state.shipmentUnloadingStartDate) {
            startDateContent = null
        } else if (this.state.readOnlyJobDates) {
            startDateContent = <Span label="Unloading Started" value={this.state.shipmentUnloadingStartDate}/>
        } else {
            startDateContent = <DateTime label="Unloading Started" hideIcon={true} timeAsTextInput={true}
                                         value={this.state.shipmentUnloadingStartDate}
                                         onchange={(value) => {
                                             this.setState({shipmentUnloadingStartDate: value})
                                         }}/>
        }

        if (!this.state.shipmentUnloadingEndDate) {
            endDateContent = null
        } else if (this.state.readOnlyJobDates) {
            endDateContent = <Span label="Unloading Completed" value={this.state.shipmentUnloadingEndDate}/>

        } else {
            endDateContent = <DateTime label="Unloading Completed" hideIcon={true} timeAsTextInput={true}
                                       value={this.state.shipmentUnloadingEndDate}
                                       onchange={(value) => {
                                           this.setState({shipmentUnloadingEndDate: value})
                                       }}/>
        }

        if (startDateContent || endDateContent) {
            return (
                <GridCell>
                    <Grid>
                        <GridCell noMargin="true" width="1-2">
                            {startDateContent}
                        </GridCell>
                        <GridCell noMargin="true" width="1-2">
                            {endDateContent}
                        </GridCell>
                    </Grid>
                </GridCell>
            );
        } else {
            return null;
        }
    }

    renderActualTimeDeparture() {
        if (!this.state.actualTimeDeparture) {
            return null;
        }
        return (
            <GridCell>
                <Grid>
                    <GridCell noMargin="true" width="1-2">
                        <DateTime label="Departure Date" hideIcon={true} timeAsTextInput={true}
                                  value={this.state.actualTimeDeparture}
                                  onchange={(value) => {
                                      this.setState({actualTimeDeparture: value})
                                  }}/>
                    </GridCell>
                </Grid>
            </GridCell>
        );
    }

    render() {

        let content =
            <Grid>
                {this.renderActualTimeArrival()}
                {this.renderShipmentLoadingDates()}
                {this.renderShipmentUnloadingDates() }
                {this.renderActualTimeDeparture() }
            </Grid>

        return (
            <Modal ref={(c) => this.modal = c} title={"Date Details - " + this.state.tripStopName}
                   actions={[{label: "Close", action: () => this.close()},
                       {label: "Save", buttonStyle: "primary", action: () => this.handleSave()}]}>
                {content}
            </Modal>
        );
    }
}
