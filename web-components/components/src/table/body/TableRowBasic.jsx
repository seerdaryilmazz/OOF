import React from 'react';
import {TableRowAction} from '../action/TableRowAction';


export class TableRowBasic extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {

        let rowData = this.props.row;
        let headers = this.props.headers;
        let actionButtons = this.props.actionButtons;
        let icons = this.props.icons;
        let rowClick = this.props.rowClick;
        let rowEdit = this.props.rowEdit;
        let rowDelete = this.props.rowDelete;

        let self = this;

        let className = "";

        if(this.props.selected) {
            className = "md-bg-blue-50";
        }

        if (rowData) {

            return (
                <tr onClick={() => rowClick(this.props.index)} className={className}>
                    {
                        this.prepareRowData(headers, rowData, icons, self)
                    }
                    <TableRowAction actionButtons={actionButtons} index={this.props.index} values={rowData}
                                    rowEdit={rowEdit} rowDelete={rowDelete}
                                    enableRowEditMode={(index) => this.props.enableRowEditMode(index)}/>

                </tr>


            );
        } else {
            return null;
        }
    }

    prepareRowData = (headers, rowData, icons, self) => {

        return headers.map(function (header) {

            let className = self.getClassName(header);
            let hidden = self.isHidden(header);

            let style = {};
            if (hidden) {
                style.display = 'none';
            }

            return (
                <td key={header.data} className={className} style={style}>
                    {self.getCellValue(header, rowData, icons, self)}
                </td>
            )

        })

    }

    getCellValue = (header, rowData, icons, self) => {
        
        let value;

        if(header.render) {
           value =  header.render(rowData);
            if(!value) {
                value = "";
            }
        }
        else if(value = rowData[header.data]) {
            if (value instanceof Object) {
                if (value.value) {
                    value =  value.value;
                } else if (value.name) {
                    value = value.name;
                } else {
                    value = "";
                }
            }
        }

        if(!value) {
            value = "";
        }

        let icon = null;

        let displayValue = true;

        let iconAlign = "left";

        if (icons) {

            let currIconSet = icons[header.data];

            if (currIconSet) {

                if (!currIconSet.displayValue) {
                    displayValue = false;
                }
                currIconSet.data.forEach(function (currIcon) {
                    if (currIcon.value == value) {
                        icon = self.getIconElem(header.data, currIcon.icon);
                    }
                })

                if (!icon && currIconSet.default) {
                    icon = self.getIconElem(header.data, currIconSet.default);
                }

                if (currIconSet.align) {
                    iconAlign = currIconSet.align;
                }
            }

        }

        let result = [];


        if (icon && iconAlign == "left") {
            result.push(icon);
        }

        if (displayValue) {
            result.push(value);
        }

        if (icon && iconAlign == "right") {
            result.push(icon);
        }

        return result;

    }

    getIconElem = (headerData, iconName) => {

        let className = "uk-icon-" + iconName;

        return <i key={headerData} className={className}></i>

    }


    isHidden = (header) => {
        if (!header.hidden) {
            return false;
        }
        return true;
    }

    getClassName = (header) => {

        return this.getClassNameAlignment(header);

    }

    getClassNameAlignment = (header) => {

        let className = "uk-text-";

        if (header.alignment) {
            className += header.alignment;
        } else {
            className += "center";
        }

        return className
    }


}

