import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, CardHeader, ListHeading} from "susam-components/layout";
import {Notify, DropDown, Form, Span, TextInput} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";


export class RouteLegList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = { data:[]}
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
        this.setState({data: nextProps.data})
    }

    handleSelectItem(e, item){
        e.preventDefault();
        this.props.onselect && this.props.onselect(item);
    }

    buildRouteLegInfo(route) {
        let routeLegInfo = [route.from.name];
        routeLegInfo.push(route.to.name);
        return routeLegInfo.join(" - ");
    }

    render() {
        let data = this.state.data;

        if(!data) {
            data = [];
        }

        //hides elements without schedules
        return <ul className="md-list md-list-centered">
            {data.filter(elem => elem.schedules && elem.schedules.length > 0).map(item => {
                let routeInfo = this.buildRouteLegInfo(item);
                let className = this.props.selectedItem && this.props.selectedItem.id === item.id ? "active-list-element" : "";

                return (
                    <li key = {item.id} onClick = {(e) => {this.handleSelectItem(e, item)}}
                        className={className}>
                        <div className="md-list-content">
                            <ListHeading value = {item.name} />
                            <span className="">{routeInfo}</span>
                        </div>
                    </li>
                );
            })}
        </ul>
    }

}

RouteLegList.contextTypes = {
    translator: React.PropTypes.object,
};