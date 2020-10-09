import _ from "lodash";
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";

export class RouteLegList extends TranslatingComponent {

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
    handleCreateNewClick(type){
        this.props.oncreate && this.props.oncreate(type);
    }
    handleDeleteButtonClick(item){
        this.props.ondelete && this.props.ondelete(item);
    }

    renderList(type, data){
        return (
            <div key = {type.id}>
                <h3 className="uk-accordion-title">{type.name}</h3>
                <div className="uk-accordion-content">
                    <Grid>
                        <GridCell noMargin="true">
                            <div className="uk-align-right">
                                <Button label="Create new" flat = {true} style="success" size="small" waves = {true} onclick = {() => this.handleCreateNewClick(type)} />
                            </div>
                        </GridCell>
                        <GridCell noMargin="true">

                        <ul className="md-list md-list-centered">
                            {data.map(item => {
                                return (
                                    <li key = {item.id}>
                                        <div className="md-list-content">
                                            <span className="md-list-heading uk-align-left">
                                                <a href="#" onClick={(e) => this.handleSelectItem(e, item)}>{item.from.name} - {item.to.name}</a>
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
                        </GridCell>
                    </Grid>
                </div>
            </div>
        );
    }

    render(){
        if(!this.props.types){
            return null;
        }

        let list = this.props.types.map(item => {
            let filtered = _.filter(this.props.data, {type: {id: item.id}});
            if(!filtered){
                filtered = [];
            }
            return this.renderList(item, filtered);
        });

        return(
            <div>
                <div id="modelList" className="uk-accordion">
                    {list}
                </div>
            </div>
        );

    }

}