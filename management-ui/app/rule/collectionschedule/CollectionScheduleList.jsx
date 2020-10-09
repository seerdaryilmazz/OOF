import _ from "lodash";
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";

import {ZoneService} from "../../services";

export class CollectionScheduleList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){

    }

    componentDidUpdate(){
        if(this.props.data && this.props.data.length > 0){
            if(!this.accordion){
                this.accordion = UIkit.accordion($('#modelList'), {showfirst: false});
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

    renderCategory(type, data){
        return (
            <div key = {type.id + "cat"}>
                <h3 className="uk-accordion-title">{super.translate("Category ") + type.name}</h3>
                <div className="uk-accordion-content">
                    <ul className="md-list md-list-centered">
                        {data.map(item => {
                            return (
                                <li key = {item.id + "cat"}>
                                    <div className="md-list-content">
                                        <span className="uk-align-left md-list-heading">
                                            <a href="#" onClick={(e) => this.handleSelectItem(e, item)}>{item.serviceTypes.map(st => st.name).join(",")}</a>
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

    renderList(type, data){
        return (
            <div key = {type.id + "region"}>
                <h3 className="uk-accordion-title">{type.name}</h3>
                <div className="uk-accordion-content">
                    <ul className="md-list md-list-centered">
                        {data.map(item => {
                            return (
                                <li key = {item.id + "region"}>
                                    <div className="md-list-content">
                                        <span className="uk-align-left md-list-heading">
                                            <a href="#" onClick={(e) => this.handleSelectItem(e, item)}>
                                                {super.translate("Category ") + item.category.name + " - " + item.serviceTypes.map(st => st.name).join(",")}
                                                </a>
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

        if(!this.props.lookups.operationRegions || !this.props.lookups.categories){
            return null;
        }

        let collectionRegions = [];

        this.props.lookups.operationRegions.forEach(elem => {
            elem.collectionRegions.forEach(elemInner => {
                collectionRegions.push(elemInner);
            });
        });

        collectionRegions = _.sortBy(collectionRegions, elem => {
            return elem.name;
        });

        let categoryList =  <div>{super.translate("There are no collection(category) schedules")}</div>;
        let list = <div>{super.translate("There are no collection schedules")}</div>;

        if (this.props.data && this.props.data.length > 0) {

            categoryList = this.props.lookups.categories.map(item => {
                let filtered = _.filter(this.props.data, {category: {id:item.id}, collectionRegion: null});
                if (filtered.length > 0) {
                    return this.renderCategory(item, filtered);
                }
            });

            list = collectionRegions.map(item => {
                let filtered = _.filter(this.props.data, {collectionRegion: {id: item.id}});
                if (filtered.length > 0) {
                    return this.renderList(item, filtered);
                }
            });
        }

        return(
            <div>
                <div id="modelList" className="uk-accordion">
                    {categoryList}
                    {list}
                </div>
            </div>
        );

    }

}