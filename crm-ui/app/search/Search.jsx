import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import {PageHeader, Grid, GridCell, Card} from "susam-components/layout";
import {TranslatingComponent} from "susam-components/abstract";
import {Button} from "susam-components/basic";
import {SearchResult} from './SearchResult';

export class Search extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {};
    }

    shouldComponentUpdate(nextProps, nextState){
        return !_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProps);
    }

    render(){
        let title = super.translate("Search");
        if(this.props.params.query){
            title += (": " + this.props.params.query);
        }

        return (
            <div>
                <PageHeader title={title}/>
                <SearchResult query = {this.props.params.query} />
            </div>
        );
    }
}
Search.contextTypes = {
    translator: PropTypes.object
};
