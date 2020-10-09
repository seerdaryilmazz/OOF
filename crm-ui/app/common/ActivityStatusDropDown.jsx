import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { DropDown, Notify } from 'susam-components/basic';
import { LookupService } from '../services';



export class ActivityStatusDropDown extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            options: []
        };
    }

    componentDidMount() {
        LookupService.getActivityStatus().then(response => {
            this.setState({options: response.data, ready: true});
        }).catch(error => {
            Notify.showError(error);
        });
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