import React from "react";
import _ from "lodash";

import {Card, Grid, GridCell, Loader, PageHeader} from "susam-components/layout";
import {TranslatingComponent} from "susam-components/abstract";
import {Notify, Button} from "susam-components/basic";
import {SearchResults} from './SearchResults';

export class SearchCompany extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {};
    }

    shouldComponentUpdate(nextProps, nextState){
        //this component is being updated 3 times by router for no apparent reason
        return !_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProps);
    }

    render(){
        let title = "Search";
        if(this.props.params.query){
            title += (": " + this.props.params.query);
        }

        return (
            <div>
                <PageHeader title={title}/>
                <SearchResults query = {this.props.params.query} />
            </div>
        );
    }
}