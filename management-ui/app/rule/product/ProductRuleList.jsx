import React from "react";
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Span} from "susam-components/basic";

export class ProductRuleList extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){

    }

    componentDidUpdate(){
        if(this.props.data && this.props.data.length > 0){
            if(!this.accordion){
                this.accordion = UIkit.accordion($('#ruleList'));
            }
            this.accordion.update();
        }
    }
    componentWillUnmount(){
        if(this.accordion){
            this.accordion.destroy();
        }
    }

    handleSelectItem(e, item){
        e.preventDefault();
        this.props.onselect && this.props.onselect(item);
    }
    handleDeleteButtonClick(item){
        this.props.ondelete && this.props.ondelete(item);
    }

    compareRegionNames(region1, region2){
        let [region1All, region1From, region1To] = region1.match(new RegExp("(.*)-(.*)")).map(s => s.trim());
        let [region2All, region2From, region2To] = region2.match(new RegExp("(.*)-(.*)")).map(s => s.trim());
        let regionFromsCompared = region1From.localeCompare(region2From);
        if(regionFromsCompared === 0){
            return region1To.localeCompare(region2To);
        }
        return regionFromsCompared;
    }


    renderList(type, data){
        return (
            <div key = {type}>
                <h3 className="uk-accordion-title">{type}</h3>
                <div className="uk-accordion-content">
                    <ul className="md-list md-list-centered">
                        {data.map(item => {
                            return (
                                <li key = {item.id}>
                                    <div className="md-list-content">
                                        <span className="uk-align-left md-list-heading">
                                            <a href="#" onClick={(e) => this.handleSelectItem(e, item)}>{item.serviceType.name} {item.loadType.name}</a>
                                        </span>
                                        <span className="uk-align-right">
                                            <Button label="delete" size="small" style="danger" waves = {true} flat = {true}
                                                    onclick = {() => this.handleDeleteButtonClick(item)} />
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    }

    render(){
        if(!(this.props.data && this.props.data.length > 0)){
            return <div>{super.translate("There are no product rules")}</div>;
        }

        let groupedRules = _.groupBy(this.props.data, (item) => {
            return item.originRegion.name + " (" + item.collectionRegion.name + ") - " + item.destinationRegion.name + " (" + item.distributionRegion.name + ")";
        });
        let orderedGroupedRules = {};
        Object.keys(groupedRules).sort(this.compareRegionNames).forEach(key => {
            orderedGroupedRules[key] = groupedRules[key];
        });

        let list = [];
        _.forEach(orderedGroupedRules, (value, key) => {
            list.push(this.renderList(key, value));
        });

        return(
            <div>
                <div id="ruleList" className="uk-accordion">
                    {list}
                </div>
            </div>
        );

    }
}