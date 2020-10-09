import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import _ from 'lodash';

import {TranslatingComponent} from '../abstract/';
import {Button} from '../basic';
import {DataTableActionColumn} from './DataTableActionColumn';

export class DataTableInsertRow extends React.Component {

    constructor(props) {
        super(props);
        this.id = uuid.v4();
        this.state = {data: {}}
    }
    componentDidMount(){

    }
    componentDidUpdate(prevProps){
        if(this.props.visible && prevProps.visible !== this.props.visible){
            this.props.columns && this.props.columns.forEach(column=>{
                if(column.props.defaultValue){
                    this.handleDataUpdate(column, column.props.defaultValue);
                }
            });
        }
    }
    componentWillReceiveProps(){

    }
    handleDataUpdate(column, value){
        let state = _.cloneDeep(this.state);
        if(column.props.reader){
            column.props.reader.setValue(state.data, value);
        }else{
            _.set(state.data, column.props.field, value);
        }
        this.setState(state);
    }
    handleRowCleanClick(){
        setTimeout(() => {this.context.validation && this.context.validation.reset()}, 300);
        this.setState({data: {}});
    }
    handleRowSaveClick(){
        if(this.context.validation && !this.context.validation.validateGroup(this.id + '-insert-row')){
            return;
        }
        this.props.onsave && this.props.onsave(this.state.data);
        this.handleRowCleanClick();
    }
    render(){
        if(!this.props.columns){
            return <tr><td>no columns</td></tr>
        }
        let style = {};
        if(!this.props.visible){
            style.display = "none";
        }
        let counter = 0;
        return(
            <tr style = {style}>
                {
                    this.props.columns.map(column => {
                        if(column.type == DataTableActionColumn){
                            return <td key = {this.id + ":" + counter++} />;
                        }else{
                            return React.cloneElement(column, {
                                key: this.id + ":" + counter++,
                                data: this.state.data,
                                isInsert: true,
                                validationGroup: this.id + '-insert-row',
                                ondataupdate: (value) => this.handleDataUpdate(column, value),
                                oncancel: () => this.handleRowCleanClick(),
                                onsave: () => this.handleRowSaveClick()
                            });
                        }
                    })
                }
            </tr>
        );
    }
}
DataTableInsertRow.contextTypes = {
    validation: PropTypes.object
};