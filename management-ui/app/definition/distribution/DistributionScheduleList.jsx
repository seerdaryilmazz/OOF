import _ from "lodash";
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {ListHeading} from "susam-components/layout";

export class DistributionScheduleList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedItem: {}
        };
    }

    componentDidUpdate(){
        if(this.props.data && this.props.data.length > 0){
            if(!this.accordion){
                this.accordion = UIkit.accordion($('#scheduleList'), {showfirst: false});
            }
            this.accordion.update();
        }

    }

    componentWillUnmount(){
        if(this.accordion){
            this.accordion.destroy();
        }
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            height: nextProps.height
        })
    }

    handleSelectItem(e, item){
        e.preventDefault();
        this.props.onselect && this.props.onselect(item);
    }

    renderCategory(type, data) {
        return (
            <div key={type.id + "cat"}>
                <h3 className="uk-accordion-title">{super.translate("Category ") + type.name}</h3>
                <div className="uk-accordion-content">
                    <ul className="md-list md-list-centered">
                        {data.map(item => {
                            let className = this.props.selectedItem && this.props.selectedItem.id == item.id ? "active-list-element" : "";
                            return (
                                <li key={item.id + "cat"} onClick = {(e) => this.handleSelectItem(e, item)}
                                    className={className}>
                                    <div className="md-list-content">
                                        <ListHeading onClick={(e) => {}}
                                                     title={type.name + " - " + item.serviceTypes.map(st => st.name).join(",")}
                                                     value={item.serviceTypes.map(st => st.name).join(",")}
                                        />
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
                            let className = this.props.selectedItem && this.props.selectedItem.id == item.id ? "active-list-element" : "";
                            return (
                                <li key = {item.id + "region"} onClick = {(e) => this.handleSelectItem(e, item)}
                                    className={className}>
                                    <div className="md-list-content">
                                        <ListHeading onClick = {(e) => {}}
                                                     title = {type.name + " - " + item.serviceTypes.map(st => st.name).join(",")}
                                                     value = {super.translate("Category ") + item.category.name + " - " + item.serviceTypes.map(st => st.name).join(",")}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    }

    render() {

        if(!this.props.lookups.operationRegions || !this.props.lookups.categories){
            return null;
        }

        let distributionRegions = [];

        this.props.lookups.operationRegions.forEach(elem => {
            elem.distributionRegions.forEach(elemInner => {
                distributionRegions.push(elemInner);
            });
        });

        distributionRegions = _.sortBy(distributionRegions, elem => {
            return elem.name;
        });

        let categoryList =  <div>{super.translate("There are no distribution(category) schedules")}</div>;
        let list = <div>{super.translate("There are no distribution schedules")}</div>;

        if (this.props.data && this.props.data.length > 0) {

            categoryList = this.props.lookups.categories.map(item => {
                let filtered = _.filter(this.props.data, {category: {id:item.id}, distributionRegionId: null});
                if (filtered.length > 0) {
                    return this.renderCategory(item, filtered);
                }
            });

            list = distributionRegions.map(item => {
                let filtered = _.filter(this.props.data, {distributionRegionId: item.id});
                if (filtered.length > 0) {
                    return this.renderList(item, filtered);
                }
            });
        }

        return(
                <div id="scheduleList" className="uk-accordion">
                    {categoryList}
                    {list}
                </div>
        );

    }

}