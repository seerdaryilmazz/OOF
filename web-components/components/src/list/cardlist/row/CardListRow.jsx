import React from 'react';

import {CardListRowIcon} from './CardListRowIcon';
import {CardListRowBody} from './CardListRowBody';
import {CardListRowAction} from './CardListRowAction';

export class CardListRow extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {

        let rowData = this.props.rowData;
        let headers = this.props.headers;

        let icon = null;
        let actions = null;

        if (headers.iconGroup) {
            let iconObject = this.getIconObject(headers, rowData);
            if (iconObject) {
                icon = <CardListRowIcon color={iconObject.color} label={iconObject.label}></CardListRowIcon>
            }
        }

        if (headers.actionGroup) {
            let actionsObject = this.getActionsObject(headers, rowData);
            if (actionsObject && actionsObject.length > 0) {
                actions = <CardListRowAction rowActions={actionsObject} rowData={rowData}></CardListRowAction>
            }
        }

        return (
            <li>
                {icon}
                <CardListRowBody headers={headers} rowData={rowData}></CardListRowBody>
                {actions}
            </li>
        );
    }

    getIconObject = (headers, rowData) => {

        let i = 0;
        let icons = headers.iconGroup.icons;
        let iconParam = rowData[headers.iconGroup.property];

        for (i = 0; i < icons.length; i++) {

            let usedBy = icons[i].usedBy;
            let j = 0;

            for (j = 0; j < usedBy.length; j++) {
                if (usedBy[j].toString() == iconParam.toString()) {
                    return icons[i];
                }
            }

        }

        if (headers.iconGroup.defaultIcon) {
            return headers.iconGroup.defaultIcon;
        }

        return null;
    }


    getActionsObject = (headers, rowData) => {

        let i = 0;
        let actions = headers.actionGroup.actions;
        let actionParam = rowData[headers.actionGroup.property];

        let result = [];

        for (i = 0; i < actions.length; i++) {

            let usedBy = actions[i].usedBy;
            let j = 0;

            for (j = 0; j < usedBy.length; j++) {
                if (usedBy[j].toString() == actionParam.toString()) {
                    actions[i].list.map((actionElem) => {
                        result.push(actionElem);
                    })
                }
            }

        }

        if (headers.actionGroup.defaultActions) {

            let defaultActions = headers.actionGroup.defaultActions;

            for (i = 0; i < defaultActions.length; i++) {
                result.push(defaultActions[i]);
            }
        }
        
        return result;
    }
}