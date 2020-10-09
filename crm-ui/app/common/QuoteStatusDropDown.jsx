import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {DropDown, Notify} from 'susam-components/basic';

import {LookupService} from '../services';

export class QuoteStatusDropDown extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            options: []
        };
    }

    componentDidMount() {
        LookupService.getQuoteStatuses().then(response => {
            this.setState({options: this.arrangeQuoteStatus(response.data), ready: true});
            // this.arrangeQuoteStatus(this.state.options);
        }).catch(error => {
            Notify.showError(error);
        });
    }
    arrangeQuoteStatus(item){
        if(!_.isEmpty(item)){
            let index=_.findIndex(item, { 'code': 'CLOSED'});
            item.splice(index,1);     //Deletes elements in that index
            return item;
        }else {
            return item;
        }
    }

    render() {

        if (!this.state.ready) {
            return null;
        }

        return (
            <DropDown {...this.props} options={this.state.options}/>
        );
    }
}