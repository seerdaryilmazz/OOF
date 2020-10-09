import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class CheckIconPrinter {

    constructor(props) {
        this.props = props;
    };

    print(value){
        let className = "uk-icon uk-icon-small ";
        if(value){
            className += "uk-icon-check-square-o";
        }else{
            className += "uk-icon-square-o";
        }
        return <i className={className}/>;
    }
}