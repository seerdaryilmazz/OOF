import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';


export class PlanShipments extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.setState({data:this.props.data});
    }

    componentWillReceiveProps(nextProps) {
        this.setState({data:nextProps.data});
    }

    render() {

        let data = this.state.data;

        if(!data){
            return null;
        }

        return (
            <table className="uk-table uk-table-hover">
                <thead>
                <tr>
                    <th>S. #</th>
                    <th>Cust.</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Final Dest.</th>
                    <th>Details</th>
                </tr>
                </thead>
                <tbody>
                {data.map(d => {
                    return (
                        <tr key={d.shipmentCode}>
                            <td>
                                {d.shipmentCode}
                            </td>
                            <td>
                                {d.customer}
                            </td>
                            <td>
                                {d.tripPlanFromLocationName}
                            </td>
                            <td>
                                {d.tripPlanToLocationName}
                            </td>
                            <td>
                                {d.toLocationName}
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

PlanShipments.contextTypes = {
    translator: React.PropTypes.object
};
