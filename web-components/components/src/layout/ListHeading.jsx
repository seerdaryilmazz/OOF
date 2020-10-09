/**
 * Created by bugra.ciftci on 14/06/2017.
 */

import React from 'react';
import PropTypes from 'prop-types';

import {TruncateText} from '../basic/'

export class ListHeading extends React.Component{
    constructor(props){
        super(props);
        this.state = {};
    };

    render() {

        let className = "md-list-heading";
        if(this.props.alignLeft){
            className += " uk-align-left";
        }

        let title = "";
        if(this.props.title){
            title = this.props.title;
        }

        return (
            <span className = {className}
                  style = {this.props.style}>
                  {
                      title
                      ?
                      <TruncateText title={title}
                                    value={this.props.value} />
                      :
                      this.props.value
                  }
            </span>
        );
    };

}

ListHeading.propTypes = {

    value: PropTypes.string,
    title: PropTypes.string,
    style: PropTypes.object,
    alignLeft: PropTypes.bool

};
