import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class BadgePrinter {

    constructor(props) {
        this.props = props;
    };

    print(value){
        let className = "uk-badge uk-badge-small uk-badge";
        if(_.isObject(value)){
            className += ("-" + value.style);
            return <i className={className}>{value.text}</i>;
        }else{
            return <i className={className}>{value}</i>;
        }


    }
}