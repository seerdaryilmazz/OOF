import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Form} from 'susam-components/basic';
import {HSCodeAutoComplete} from 'susam-components/oneorder';

export class SenderRuleHSCodes extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {selectedIndex: -1};
    }

    componentDidMount(){

    }
    componentWillReceiveProps(nextProps){
        if(!_.isEqual(this.props.ruleSetId, nextProps.ruleSetId)){
            this.setState({hsCode: null});
        }
    }


    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }
    handleDeleteClick(item, index){
        let data = _.cloneDeep(this.props.data);
        data.splice(index, 1);
        this.props.onchange && this.props.onchange(data);
    }
    handleSaveClick(){
        if(!this.form.validate()){
            return;
        }
        let data = _.cloneDeep(this.props.data);
        if(this.state.selectedIndex){
            data[this.state.selectedIndex] = _.cloneDeep(this.state.hsCode);
        }
        this.setState({hsCode: null, selectedIndex: -1});
        this.props.onchange && this.props.onchange(data);
    }
    handleAddClick(){
        if(!this.form.validate()){
            return;
        }
        let data = _.cloneDeep(this.props.data);
        if(!data){
            data = [];
        }
        data.push(this.state.hsCode);
        this.setState({hsCode: null});
        this.props.onchange && this.props.onchange(data);
    }
    handleSelectItem(e, item, index){
        e.preventDefault();
        this.setState({hsCode: item, selectedIndex: index});
    }

    renderItemList(item, index){
        return (
            <li key = {item.code}>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width="9-10" noMargin = {true}>
                            <div className="md-list-heading">
                                <a href="#" className="uk-text-break" style={{width: "90%"}}
                                   onClick={(e) => this.handleSelectItem(e, item, index)}><b>{item.code}</b> {item.name}</a>
                            </div>
                            <div className="uk-text-small uk-text-muted uk-text-break" style={{width: "90%"}}>
                                {item.parent1}
                            </div>
                            <div className="uk-text-small uk-text-muted uk-text-break" style={{width: "90%"}}>
                                {item.parent2}
                            </div>
                        </GridCell>
                        <GridCell width="1-10" noMargin = {true}>
                            <Button label="delete" flat = {true} style="danger" size="small" waves = {true}
                                    onclick = {(item) => this.handleDeleteClick(item, index)} />
                        </GridCell>
                    </Grid>
                </div>
            </li>
        );
    }

    render(){

        let saveButton = <Button label="add" size="small" style="success" waves = {true} onclick = {() => this.handleAddClick()}/>;
        if(this.state.selectedIndex != -1){
            saveButton = <Button label="save" size="small" style="success" waves = {true} onclick = {() => this.handleSaveClick()}/>;
        }

        let list = <div>{super.translate("There are no HS Codes")}</div>;
        if(this.props.data && this.props.data.length > 0){
            list = <ul className="md-list md-list-centered">
                {this.props.data.map((item, index) => this.renderItemList(item, index))}
            </ul>;
        }
        return (
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <Form ref = {(c) => this.form = c}>
                        <Grid>

                                <GridCell width="4-5">
                                    <HSCodeAutoComplete label="HS Code"
                                                        value = {this.state.hsCode}
                                                        onchange = {(value) => this.updateState("hsCode", value)}
                                                        required = {true}/>
                                </GridCell>
                                <GridCell width="1-5">
                                    {saveButton}
                                </GridCell>

                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    {list}
                </GridCell>
            </Grid>
        );
    }
}