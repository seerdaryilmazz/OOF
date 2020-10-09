/**
 * Created by bugra.ciftci on 13/06/2017.
 */
import React from 'react';
import PropTypes from 'prop-types';

import {TranslatingComponent} from '../abstract/'

export class TruncateText extends TranslatingComponent{
    constructor(props){
        super(props);
    };
    render(){
        return(
            <span className = "uk-text-truncate"
                  data-uk-tooltip = "{cls:'long-text', pos:'right'}"
                  title = {super.translate(this.props.title)}>
                  {super.translate(this.props.value)}
            </span>
    );
    }
}
TruncateText.propTypes = {

    value: PropTypes.string,
    title: PropTypes.string

};
