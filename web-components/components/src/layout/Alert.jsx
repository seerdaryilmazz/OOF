import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {TranslatingComponent} from '../abstract/'

export class Alert extends TranslatingComponent{
    constructor(props){
        super(props);
    }

    render(){
        let className = "uk-alert uk-alert-" + this.props.type;
        return (
            <div className="uk-grid" data-uk-grid-margin="">
                <div className="uk-width-1-1 ">
                    <div className={className} data-uk-alert="">
                        {this.props.translate ? super.translate(this.props.message) : this.props.message}
                    </div>
                </div>
            </div>
        );
    }
}
Alert.contextTypes = {
    translator: PropTypes.object
};