import React from 'react';

import {ListRowIcon} from './ListRowIcon';
import {ListRowBody} from './ListRowBody';
import {ListRowButton} from './ListRowButton';

export class ListRow extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        
        let rowData = this.props.rowData;
        let headers = this.props.headers;

        let icon = null;
        let button = null;

        if(headers.iconGroup) {
            let iconObject = this.getIconObject(headers, rowData);
            if(iconObject) {
                icon = <ListRowIcon icon={iconObject.icon}></ListRowIcon>
            }
        }

        if(headers.buttonGroup) {
            let buttonObject = this.getButtonObject(headers, rowData);
            if(buttonObject) {
                button = <ListRowButton label={buttonObject.label} action={buttonObject.action} rowData={rowData}></ListRowButton>
            }
        }
        
        return (
            <li>
                {icon}
                <ListRowBody headers={headers} rowData={rowData} button={button} ></ListRowBody>
            </li>
        );
    }


    getIconObject = (headers, rowData) => {

        let i=0;
        let icons = headers.iconGroup.icons;
        let iconParam = rowData[headers.iconGroup.property];
        
        for(i=0; i< icons.length; i++) {

            let usedBy = icons[i].usedBy;
            let j = 0;

            for(j=0; j< usedBy.length; j++) {
                if(usedBy[j].toString() == iconParam.toString()) {
                    return icons[i];
                }
            }

        }

        return headers.iconGroup.defaultIcon;

    }

    getButtonObject = (headers, rowData) => {

        let i=0;
        let buttons = headers.buttonGroup.buttons;
        let buttonParam = rowData[headers.buttonGroup.property];

        for(i=0; i< buttons.length; i++) {

            let usedBy = buttons[i].usedBy;
            let j = 0;

            for(j=0; j< usedBy.length; j++) {
                if(usedBy[j].toString() == buttonParam.toString()) {
                   return  buttons[i];
                }
            }

        }

        return headers.buttonGroup.defaultButton;

    }


}