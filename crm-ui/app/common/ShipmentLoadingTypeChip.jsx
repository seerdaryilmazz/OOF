import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip } from "susam-components/advanced";
import { Notify } from 'susam-components/basic';
import { LookupService } from '../services';



export class ShipmentLoadingTypeChip extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            options: []
        };
    }

    componentDidMount() {
        this.loadOptionsIfNecessary(null);
    }

    componentDidUpdate(prevProps) {
        this.loadOptionsIfNecessary(prevProps.serviceArea);
    }

    loadOptionsIfNecessary(serviceAreaFromPrevProps) {

        let previousServiceArea = serviceAreaFromPrevProps;
        let newServiceArea = this.props.serviceArea;

        if (!_.isEqual(previousServiceArea, newServiceArea)) {
            if (_.isNil(newServiceArea)) {
                this.setState({options: []});
            } else {
                this.findShipmentLoadingTypes(newServiceArea, (response) => {
                    this.setState({options: response.data});
                });
            }
            this.props.onchange && this.props.onchange(null);
        }
    }

    findShipmentLoadingTypes(serviceArea, callback) {
        LookupService.getShipmentLoadingType(serviceArea).then(response => {
            if(this.props.shortenForRoad && _.isEqual("ROAD",serviceArea)){
                let options = response.data.map(i=>{
                    return {
                        id: i.id.substring(0, 3),
                        code:i.code.substring(0, 3),
                        name:i.name.substring(0, 3),
                    }
                });
                callback({data: _.uniqWith(options, _.isEqual)});
            } else {
                callback(response);
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render() {
        return (
            <Chip {...this.props} options={this.state.options}/>
        );
    }
}