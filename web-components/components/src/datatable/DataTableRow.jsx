import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import _ from 'lodash';

import {Column} from './columns/Column'

export class DataTableRow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {id: uuid.v4()};
    }
    componentDidMount(){
        this.setState({data: this.props.data, editing: false});
    }
    componentDidUpdate(){

    }
    componentWillReceiveProps(nextProps){
        this.setState({data: nextProps.data, editing: nextProps.editing});
    }
    startEditing(){
        this.setState({editing: true});
        this.context.validation && this.context.validation.reset();
        this.props.oneditbegin && this.props.oneditbegin();
    }
    handleDataUpdate(column, value){
        let state = _.cloneDeep(this.state);
        if(column.props.reader){
            column.props.reader.setValue(state.data, value);
        }else{
            state.data[column.props.field] = value;
        }

        this.setState(state);
    }
    handleRowCancelClick(){
        this.context.validation && this.context.validation.reset();
        this.setState({data: this.props.data, editing: false});
        this.props.oneditcancel && this.props.oneditcancel();
    }
    handleRowSaveClick(){
        if(this.context.validation && !this.context.validation.validateGroup(this.state.id)){
            return;
        }
        this.props.onsave && this.props.onsave(this.state.data);
        this.setState({editing: false});
    }
    handleRowDeleteClick(){
        this.props.ondelete && this.props.ondelete();
    }
    render(){
        let counter = 0;
        let rowIndex = this.props.rowIndex;
        let classNames = [];
        this.props.selected && classNames.push("md-bg-light-blue-50");
        classNames.push(rowIndex % 2 === 0 ? "even" : "odd");
        return(
            <tr onClick = {(e) => this.props.onrowclick(this.state.data)} className={classNames.join(" ")} onMouseEnter={(e) => this.props.onrowmouseenter(this.state.data)}>
                {
                    this.props.columns.map(column => {
                        let props = {};
                        if(column.type.prototype instanceof Column){
                            props = {
                                counter: counter,
                                key: this.state.id + ":" + counter++,
                                data: this.state.data,
                                isEdit: this.state.editing,
                                validationGroup: this.state.id,
                                disabled: this.props.disabled,
                                ondataupdate: (value) => this.handleDataUpdate(column, value)
                            }
                        }else{
                            props = {
                                key: this.state.id + ":" + counter++,
                                data: this.state.data,
                                isEdit: this.state.editing,
                                oneditbegin: () => this.startEditing(),
                                onsave: () => this.handleRowSaveClick(),
                                oncancel: () => this.handleRowCancelClick(),
                                ondelete: () => this.handleRowDeleteClick()
                            }
                        }
                        return React.cloneElement(column, props);
                    })
                }
            </tr>
        );
    }
}
DataTableRow.contextTypes = {
    validation: PropTypes.object
};