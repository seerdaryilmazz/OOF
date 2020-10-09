import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {ListHeading} from "susam-components/layout";

export class LinehaulRouteList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleSelectItem(e, item){
        e.preventDefault();
        this.props.onselect && this.props.onselect(item);
    }

    buildRouteInfo(route) {
        let routeInfo = [route.from.name];
        routeInfo.push(route.to.name);
        return routeInfo.join(" - ");
    }

    render(){

        if(!(this.props.data && this.props.data.length > 0)){
            return <div>{super.translate("There are no linehaul routes")}</div>;
        }else{
            return(
                <div>
                    <div className="uk-width-medium-1-1">
                        <h3 className="full_width_in_card heading_c">Route List</h3>
                    </div>
                    <ul className="md-list md-list-centered">
                        {this.props.data.map(item => {
                            let routeInfo = this.buildRouteInfo(item);
                            let className = this.props.selectedItem && this.props.selectedItem.id === item.id ? "active-list-element" : "";

                            return (
                                <li key = {item.id} onClick = {(e) => this.handleSelectItem(e, item)}
                                    className={className}>
                                    <div className="md-list-content">
                                        <ListHeading value = {item.name} />
                                        <span className="uk-text-small uk-text-muted">{routeInfo}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
        }
    }
}