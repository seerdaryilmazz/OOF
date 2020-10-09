import React from "react";

import {TextInput, Notify} from 'susam-components/basic';
import {TranslatingComponent} from "susam-components/abstract";
import {CompanySearchResultList} from "./CompanySearchResultList";

export class CompanySearch extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {};
    }

    handleSelectedItem(value){
        Notify.confirm("An account will be created for the selected company. Are you sure?", () => {
            this.updateState("query", null);
            this.props.onItemSelected && this.props.onItemSelected(value);
        });
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    clearQuery() {
        this.updateState("query", null);
    }

    render(){

        return (
                <div>
                    <TextInput placeholder="Search for company..." required = {true}
                               value = {this.state.query}
                               onchange = {(value) => this.updateState("query", value)}/>
                    <CompanySearchResultList query = {this.state.query}
                                             onAddNew={() => this.props.onAddNew && this.props.onAddNew()}
                                             onItemSelected={(value) => this.handleSelectedItem(value)}/>
                </div>

        );
    }
}