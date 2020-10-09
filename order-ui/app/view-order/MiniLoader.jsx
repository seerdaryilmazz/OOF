import React from 'react';

import {TranslatingComponent} from 'susam-components/abstract';

export class MiniLoader extends TranslatingComponent{

    constructor(props){
        super(props);
    }

    render(){
        let title = null;
        if(this.props.title){
            title = <div className="uk-text-primary uk-text-upper uk-margin-small-top">{this.props.title}</div>;
        }
        return (
            <div>
                <span className="md-preloader" style = {{float: "left"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="24" width="24" viewBox="0 0 75 75">
                        <circle cx="37.5" cy="37.5" r="33.5" strokeWidth="4"/>
                    </svg>
                </span>
                <span style = {{float: "left", marginLeft: "8px"}}>{title}</span>
            </div>
        );
    }
}