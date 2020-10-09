import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card} from 'susam-components/layout';

export class RequestOrderInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render(){
        if(!this.props.data){
            return null;
        }
        return(
            <div>
                <div className="heading_c_bold uk-margin-bottom">{this.props.data.customer.name}</div>
                <div className="uk-float-left uk-margin-right" style = {{minWidth: "120px"}}>{super.translate("Owner")}</div>
                <div className="uk-text-bold uk-float-left">{this.props.data.subsidiary.name}</div>
                <div className="uk-float-left uk-margin-right" style = {{clear: "both", minWidth: "120px"}}>{super.translate("Requested By")}</div>
                <div className="uk-text-bold uk-float-left">{this.props.data.lastUpdatedBy}</div>
            </div>
        );
    }
}

RequestOrderInfo.contextTypes = {
    translator: React.PropTypes.object
};
