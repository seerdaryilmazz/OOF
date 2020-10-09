import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {ListHeading} from "susam-components/layout";

export class EventBillingItemList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {

        };
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

    renderList(data){
        return (
            <div>
                <div className="uk-width-medium-1-1">
                    <h3 className="full_width_in_card heading_c">Billing Items</h3>
                </div>
                <div>
                    <ul className="md-list md-list-centered">
                        {data.map(item => {

                            let className = this.props.selectedItem && this.props.selectedItem.id == item.id ? "active-list-element" : "";
                            return (
                                <li key = {item.id}
                                    onClick = {(e) => this.handleSelectItem(e, item)}
                                    className={className}>
                                    <div className="md-list-content">
                                        <ListHeading value = {item.billingItem.name} />
                                        <span className="uk-text-small uk-text-muted">{item.event.name}</span>
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

        if(!this.props.data){
            return null;
        }

        let list = <div>{super.translate("There are no billing items")}</div>;
        if(this.props.data && this.props.data.length > 0){
            return this.renderList(this.props.data);
        }
        return(

            <div id="billingItemsList">
                {list}
            </div>
        );

    }

}