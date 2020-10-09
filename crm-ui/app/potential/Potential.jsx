import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {AirPotential, CustomsPotential, RoadPotential, SeaPotential} from './';

export class Potential extends TranslatingComponent {
    
    validate() {
        return this.potentialForm.validate();
    }

    render() {
        switch (this.props.serviceArea) {
            case 'ROAD':
                return <RoadPotential ref={(c) => this.potentialForm = c}
                                      potential={this.props.potential}
                                      readOnly={this.props.readOnly}
                                      onChange={(value) => this.props.onChange(value)}/>;

            case 'SEA':
                return <SeaPotential ref={(c) => this.potentialForm = c}
                                     potential={this.props.potential}
                                     readOnly={this.props.readOnly}
                                     onChange={(value) => this.props.onChange(value)}/>;

            case 'AIR':
                return <AirPotential ref={(c) => this.potentialForm = c}
                                     potential={this.props.potential}
                                     readOnly={this.props.readOnly}
                                     onChange={(value) => this.props.onChange(value)}/>;

            case 'CCL':
                return <CustomsPotential ref={(c) => this.potentialForm = c}
                                         potential={this.props.potential}
                                         readOnly={this.props.readOnly}
                                         onChange={(value) => this.props.onChange(value)}/>;

            default:
                return null;
        }
    }
}