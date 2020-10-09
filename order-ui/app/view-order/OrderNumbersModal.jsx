import React from 'react';
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {TextArea} from 'susam-components/basic';
import {OverflowContainer, Grid, GridCell, Modal} from 'susam-components/layout';

export class OrderNumbersModal extends TranslatingComponent{
    state = {};

    constructor(props){
        super(props);
    }

    open(){
        this.modal && this.modal.open();
    }

    handleClickEdit(){
        this.setState({editing: true, value: _.cloneDeep(this.props.value).join("\n")});
    }
    handleClickSave(){
        this.setState({editing: false}, () => {
            let orderNumbers = this.state.value ? _.filter(this.state.value.split("\n"), item => item) : [];
            this.props.onSave(orderNumbers);
            this.modal.close();
        });
    }
    handleChange(value){
        this.setState({value: value});
    }

    renderItem(item){
        return(
            <li key = {item}>
                <div className="md-list-content">
                    <span className="md-list-heading">{item}</span>
                </div>
            </li>
        );
    }

    render(){
        if(!this.props.value){
            return null;
        }
        let list = <span className="uk-text-large">There are no order numbers</span>;
        if(this.props.value.length > 0){
            list =
                <ul className = "md-list">
                    {this.props.value.map(item => this.renderItem(item))}
                </ul>;
        }
        let content = list;
        if(this.state.editing){
            content = <TextArea value = {this.state.value} rows = {Math.max(10, Math.min(this.props.value.length, 20))}
                                onchange = {(value) => this.handleChange(value)} />
        }
        let actions = [];
        if(this.props.editable){
            if(this.state.editing){
                actions.push({label:"Save", buttonStyle: "primary", action:() => this.handleClickSave()})
            }else{
                actions.push({label:"Edit", buttonStyle: "primary", action:() => this.handleClickEdit()})
            }
        }
        actions.push({label:"Close", action:() => this.modal.close()});
        return(
            <Modal title={`${this.props.type} Order Numbers`}
                   ref={(c) => this.modal = c}
                   closeOtherOpenModals = {false}
                   actions={actions}>
                <OverflowContainer height = "400">
                    <Grid>
                        <GridCell width = "1-1">
                            {content}
                        </GridCell>
                    </Grid>
                </OverflowContainer>
            </Modal>
        );
    }
}