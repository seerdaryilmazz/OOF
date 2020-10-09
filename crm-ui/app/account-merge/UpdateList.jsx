import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Wizard} from "susam-components/layout";
import {Notify, Button} from 'susam-components/basic';

export class UpdateList extends TranslatingComponent {

    constructor(props){
        super(props);
    }

    handleUpdateClick(item){
        this.props.onupdate && this.props.onupdate([item]);
    }
    handleUpdateAllClick(){
        let items = [];
        this.props.updates.forEach(item => {
            if(!item.status){
                items.push(item);
            }
        });
        this.props.onupdate && this.props.onupdate(items);
    }
    handleIgnoreClick(item){
        this.props.onignore && this.props.onignore([item]);
    }
    handleUndoIgnoreClick(item){
        this.props.onundoignore && this.props.onundoignore([item]);
    }
    handleIgnoreAllClick(){
        let items = [];
        this.props.updates.forEach(item => {
            if(!item.status){
                items.push(item);
            }
        });
        this.props.onignore && this.props.onignore(items);
    }
    handleUndoUpdateClick(item){
        this.props.onundoupdate && this.props.onundoupdate([item]);
    }

    renderValue(value){
        let toRender = value;
        if(_.isArray(value)){
            toRender = value.map(item => {
                return <div key={item}>{item}</div>;
            })
        };
        return toRender;
    }

    render(){
        let hasNewItems = false;
        if(!this.props.updates){
            return null;
        }else{
            let list = "";
            if(this.props.updates.length == 0){
                list = <tr><td colSpan="5">{super.translate("There is nothing to update")}</td></tr>;
            }else{
                list = this.props.updates.map((item,index) => {
                    let statusBadge = <i className="uk-badge md-bg-grey-500">{super.translate("Nothing Done")}</i>;
                    let updateButton = <Button label="update" size="small" style="success" flat = {true} onclick = {() => this.handleUpdateClick(item)}/>;
                    let ignoreButton = <Button label="ignore" size="small" style="danger" flat = {true} onclick = {() => this.handleIgnoreClick(item)}/>;
                    if(item.status == "UPDATED"){
                        updateButton  = <Button label="undo update" size="small" style="success" flat = {true} onclick = {() => this.handleUndoUpdateClick(item)}/>;
                        ignoreButton = "";
                        statusBadge = <i className="uk-badge uk-badge-success">{super.translate("Updated")}</i>;
                    }else if(item.status == "IGNORED"){
                        ignoreButton = <Button label="undo ignore" size="small" style="danger" flat = {true} onclick = {() => this.handleUndoIgnoreClick(item)}/>;
                        updateButton = "";
                        statusBadge = <i className="uk-badge uk-badge-danger">{super.translate("Ignored")}</i>;
                    }else{
                        hasNewItems = true;
                    }
                    return (<tr key = {index}>
                        <td className="uk-text-left">
                            <code>{super.translate(item.label)}</code>
                        </td>
                        <td className="uk-text-left">
                            <span className="uk-text-bold">{item.valueToPrint}</span>
                        </td>
                        <td className="uk-text-center">
                            {statusBadge}
                        </td>
                        <td className="uk-text-center">
                            {updateButton}
                        </td>
                        <td className="uk-text-center">
                            {ignoreButton}
                        </td>
                    </tr>);
                });
            }

            return (
                <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <h3 className="full_width_in_card heading_c">{super.translate("Update List")}</h3>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <table className="uk-table uk-table-condensed">
                        <thead>
                        <tr>
                            <th className="uk-text-left" width="15%">{super.translate("Field Name")}</th>
                            <th className="uk-text-left" width="25%">{super.translate("New Value")}</th>
                            <th className="uk-text-center" width="10%">{super.translate("Status")}</th>
                            <th className="uk-text-center" width="12%">
                                <Button label="update all" size="small" style="success" flat = {true} onclick = {() => this.handleUpdateAllClick()} disabled={!hasNewItems}/>
                            </th>
                            <th className="uk-text-center" width="12%">
                                <Button label="ignore all" size="small" style="danger" flat = {true} onclick = {() => this.handleIgnoreAllClick()} disabled={!hasNewItems}/>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {list}
                        </tbody>
                    </table>
                </GridCell>
                </Grid>
            );
        }
    }

}

UpdateList.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
    user: React.PropTypes.object,
    router: React.PropTypes.object.isRequired,
    translator: React.PropTypes.object
};