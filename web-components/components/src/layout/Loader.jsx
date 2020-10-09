import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {TranslatingComponent} from '../abstract/';

export class Loader extends TranslatingComponent{
    constructor(props){
        super(props);
        this.sizes = {XL: 120, L: 96, M: 72, S: 48, XS: 24};
    }

    render(){
        let size = "L";
        if(this.props.size){
            size = this.props.size;
        }
        let title = null;
        if(this.props.title){
            title = <div className="uk-text-primary uk-text-upper">{super.translate(this.props.title)}</div>;
        }
        return (
            <div className="uk-grid">
                <div className="uk-width-medium-1-4 uk-container-center uk-text-center uk-margin-top">
                    <div className="md-preloader">
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" height={this.sizes[size]} width={this.sizes[size]} viewBox="0 0 75 75">
                            <circle cx="37.5" cy="37.5" r="33.5" strokeWidth="4"/>
                        </svg>
                    </div>
                    {title}
                </div>
            </div>
        );
    }
}

export class LoaderWrapper extends Component{
    constructor(props){
        super(props);
    }
    render(){
        if(this.props.busy){
            return <Loader {...this.props}/>;
        }
        return this.props.children;
    }
}
Loader.contextTypes = {
    translator: PropTypes.object
};