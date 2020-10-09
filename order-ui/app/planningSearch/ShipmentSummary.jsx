import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';


export class ShipmentSummary extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
    }

    componentDidMount() {
        if (this.props.data) {
            this.setState({data: this.props.data});
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({data: nextProps.data});
        }
    }


    render() {

        let data = this.state.data;

        if(!data) {
            return null;
        }

        return (
            <table className="uk-table uk-table-hover">
                <thead>
                    <tr>
                        <th>Package Count</th>
                        <th>Gross Weight</th>
                        <th>Volume</th>
                        <th>LDM</th>
                        <th>Pay Weight</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            {data.packageCount}
                        </td>
                        <td>
                            {data.grossWeight ? (data.grossWeight + " kg") : "-"}
                        </td>
                        <td>
                            {data.volume ? (Number((data.volume ).toFixed(2)) + " m3") : "-"}

                        </td>
                        <td>
                            {data.ldm ? Number((data.ldm ).toFixed(2)) : "-"}
                        </td>
                        <td>
                            {data.payWeight}
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
}


ShipmentSummary.contextTypes = {
    translator: React.PropTypes.object
};
