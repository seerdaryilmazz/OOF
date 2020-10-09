import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {ListHeading} from "susam-components/layout";

export class KpiManagementList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidUpdate(){
        if(this.props.data && this.props.data.length > 0){
            if(!this.accordion){
                this.accordion = UIkit.accordion($('#kpiList'), {showfirst: false});
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

    renderList(type, data){
        return (
            <div key = {type.id}>
                <h3 className="uk-accordion-title">{type.name}</h3>
                <div className="uk-accordion-content">
                    <ul className="md-list md-list-centered">
                        {data.map(item => {
                            let className = this.props.selectedItem && this.props.selectedItem.id == item.id ? "active-list-element" : "";
                            return (
                                <li key = {item.id} onClick = {(e) => this.handleSelectItem(e, item)}
                                    className={className}>
                                    <div className="md-list-content">
                                        <ListHeading title = {type.name + " - " + item.description}
                                                     value = {item.objective.summary + " / " + item.period.summary}
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

    render(){

        if(!this.props.collectors){
            return null;
        }

        let list = <div>{super.translate("There are no KPI Management Items")}</div>;
        if(this.props.data && this.props.data.length > 0){
            list = this.props.collectors.map(item => {
                let filtered = _.filter(this.props.data, {collector: {id: item.id}});
                if(filtered.length > 0){
                    return this.renderList(item, filtered);
                }
            });
        }
        return(
                <div id="kpiList" className="uk-accordion">
                    {list}
                </div>
        );

    }

}