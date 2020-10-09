import React from "react";
import {Button, Notify} from "susam-components/basic";
import {Modal} from "susam-components/layout";
import {Table} from "susam-components/table";
import {GoogleMaps} from "susam-components/advanced";
import {VehicleService} from "../services";

export class TrailerSelection extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            headers: [
                {
                    name: "Plate Number",
                    data: "plateNumber",
                },
                {
                    name: "Latest Location",
                    data: "latestLocation",
                    render: (values) => {
                        return values.latestLocation && values.latestLocation.postaladdress ? values.latestLocation.postaladdress.formattedAddress : "";
                    }
                },
                {
                    name: "Distance to First Stop",
                    data: "distance",
                    render: (values) => {
                        return values.distance && values.distance.distance ? values.distance.distance.text : ""
                    }
                },
            ],
            tableActions: {
                actionButtons: [
                    {
                        icon: "share-square",
                        action: (elem) => this.onSelectTrailer(elem),
                        title: "Preview"
                    },
                ]
            },
            trailers: [],
        }
    }

    componentDidMount() {
        VehicleService.allTrailers().then(response => {
            this.setState({trailers: response.data});
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    updateTrailerDistancesToOrigin() {
        if (this.state.trailers && this.state.trailers.length > 0) {
            if (this.props.origin) {
                let distanceMap = {};
                let destinations = [];
                let ids = [];
                this.state.trailers.forEach(trailer => {
                    let lat = trailer && trailer.latestLocation && trailer.latestLocation.postaladdress && trailer.latestLocation.postaladdress.pointOnMap ? trailer.latestLocation.postaladdress.pointOnMap.lat : null;
                    let lng = trailer && trailer.latestLocation && trailer.latestLocation.postaladdress && trailer.latestLocation.postaladdress.pointOnMap ? trailer.latestLocation.postaladdress.pointOnMap.lng : null

                    if (lat && lng) {
                        destinations.push({
                            lat: lat,
                            lng: lng
                        });
                        ids.push(trailer.id);
                    }
                });

                if (destinations.length > 0) {
                    GoogleMaps.calculateDistanceMatrix([this.props.origin], destinations, (response) => {
                        if (response && response.rows && response.rows.length > 0 && response.rows[0] && response.rows[0].elements && response.rows[0].elements.length > 0) {
                            let elements = response.rows[0].elements;
                            for (let i = 0; i < elements.length; i++) {
                                distanceMap[ids[i]] = elements[i];
                            }
                        }

                        let trailers = _.cloneDeep(this.state.trailers);
                        trailers.forEach(trailer => {
                            trailer.distance = distanceMap[trailer.id];
                        });
                        trailers = _.sortBy(trailers, t => {
                            return t.distance && t.distance.distance && t.distance.distance.value ? t.distance.distance.value : 0;
                        });
                        this.setState({trailers: trailers});
                    });
                }
            } else {
                let trailers = _.cloneDeep(this.state.trailers);
                trailers.forEach(trailer => {
                    trailer.distance = null;
                });
                this.setState({trailers: trailers});
            }
        }
    }

    onTrailerSelectionOpen() {
        this.selectTrailerModal.open();
        this.updateTrailerDistancesToOrigin();
    }

    onTrailerSelectionClose() {
        this.selectTrailerModal.close();
    }

    onSelectTrailer(values) {
        this.props.onSelectTrailer(values);
        this.onTrailerSelectionClose();
    }

    render() {
        return (
            <span style={{paddingRight: "10px"}}>
                <Button label="Trailer" style="primary" waves={true}
                        onclick={() => this.onTrailerSelectionOpen()}/>
                <Modal ref={(c)=>this.selectTrailerModal = c} large={true} title="Trailers"
                       actions={[{label: "Close", action: () => this.onTrailerSelectionClose()}]}>
                    <div style={{overflow: "scroll", maxHeight: "400px"}}>
                        <Table headers={this.state.headers}
                               data={this.state.trailers}
                               actions={this.state.tableActions}/>
                    </div>
                </Modal>
            </span>
        );
    }
}