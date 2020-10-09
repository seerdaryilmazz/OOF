import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Card } from "susam-components/layout";
import { PlanningSearchConstans } from "./PlanningSearchConstans";




export class PlanList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidMount() {
        this.setState({data: this.props.data, selectedPlan: this.props.selectedPlan});
    }

    componentWillReceiveProps(nextProps) {
        this.setState({data: nextProps.data, selectedPlan: nextProps.selectedPlan});
    }

    updateFilter(field, value) {
        let filter = _.cloneDeep(this.state.filter);
        filter[field] = value;
        this.setState({filter: filter});
    }

    handleRowClick(data) {
        this.props.planSelectHandler(data);
    }

    retrieveClassname(planId) {
        if (this.state.selectedPlan && this.state.selectedPlan.id == planId) {
            return "md-bg-blue-50";
        }
        else {
            return null;
        }
    }

    renderPlateNumber(data) {

        let content = null;

        if (data.trips && data.trips.length > 0) {
            let firstTrip = data.trips[0];

            if (firstTrip.vehicleGroup) {
                content = <span>{firstTrip.vehicleGroup.trailable ? firstTrip.vehicleGroup.trailable.plateNumber : "-"}</span>
            } else if (firstTrip.spotVehicle) {
                content = <div>
                    <span>{firstTrip.spotVehicle.carrierPlateNumber}</span>
                    <span className="uk-margin-small-left uk-badge  md-bg-grey-200 md-color-grey-900">Spot</span>
                </div>
            }
        }

        return content;
    }


    renderPlanStatus(data) {
        let status;
        if(data.planCompleted) {
            status = PlanningSearchConstans.PLAN_STATUS_COMPLETED;
        } else if(data.planStarted) {
            status = PlanningSearchConstans.PLAN_STATUS_IN_PROGRESS;
        } else {
            status = PlanningSearchConstans.PLAN_STATUS_NOT_STARTED;
        }

        return <span className={"uk-badge uk-badge-" + status.class}>{status.name}</span>
    }

    render() {

        let data = this.state.data;

        if (!data) {
            return (<Card>
                No Data
            </Card>);
        }

        return (
            <table className="uk-table uk-table-hover">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Code</th>
                    <th>Trailer Plates</th>
                    <th>Service Type</th>
                    <th>State</th>
                    <th>Progress Bar</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Geo Description</th>
                    <th>Number of Stops</th>
                    <th>Details</th>
                </tr>
                </thead>
                <tbody>
                {data.map(d => {
                    return (
                        <tr key={d.id} className={this.retrieveClassname(d.id)} onClick={() => this.handleRowClick(d)}>
                            <td>
                                {d.id}
                            </td>
                            <td>
                                {d.code}
                            </td>
                            <td>
                                {this.renderPlateNumber(d)}
                            </td>
                            <td>
                                {d.serviceType}
                            </td>
                            <td>
                                {this.renderPlanStatus(d)}
                            </td>
                            <td>
                                {d.progress}
                            </td>
                            <td>
                                {d.origin}
                            </td>
                            <td>
                                {d.destination}
                            </td>
                            <td>
                                {d.geoDescription}
                            </td>
                            <td>
                                {d.numberOfStops}
                            </td>
                            <td>
                                {d.details ? d.details.combined : ""}
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        )
    }
}



PlanList.contextTypes = {
    translator: React.PropTypes.object
};
