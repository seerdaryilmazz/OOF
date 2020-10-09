import PropTypes from "prop-types";
import React from 'react';
import { TranslatingComponent } from '../abstract';

export class ModalWrapper extends TranslatingComponent{
    constructor(props){
        super(props);
    }

    wrap(status, data) {
        return JSON.stringify({
            status: status,
            data: data
        })
    }

    render(){
        let props = _.cloneDeep(this.props);
        props.onSuccess = (data) => parent.postMessage(this.wrap('success',data) ,this.props.targetOrigin);
        props.onError = (data) => parent.postMessage(this.wrap('error', data), this.props.targetOrigin);
        props.onCancel = () => parent.postMessage(this.wrap('cancel'), this.props.targetOrigin);
        
        let component = this.props.route.options.components[this.props.params.component];
        return component ? React.createElement(component, props): null;
    }
}

ModalWrapper.contextTypes = {
    translator: PropTypes.object,
    router: React.PropTypes.object,
    user: React.PropTypes.object
};