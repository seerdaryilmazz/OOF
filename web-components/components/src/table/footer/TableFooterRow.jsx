import React from 'react';


export class TableFooterRow extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {

        let footer = this.props.footer;
        let headers = this.props.headers;
        let icons = this.props.icons;

        let self = this;

        if (footer) {

            return (
                <tr>
                    {
                        this.prepareRowData(headers, footer, icons, self)
                    }
                </tr>
            );
        } else {
            return null;
        }
    }

    prepareRowData = (headers, footer, icons, self) => {

            return headers.map(function (header) {

                let className = self.getClassName(header);
                let hidden = self.isHidden(header);

                let style = {};
                if (hidden) {
                    style.display = 'none';
                }

                return (

                    <td key={header.data} className={className} style={style}>
                        {self.getCellValue(header.data, footer, icons, self)}
                    </td>
                )

            })

    }

    getCellValue = (headerData, footer, icons, self) => {

        let value = footer[headerData];
        let icon = null;

        let displayValue = true;;

        let iconAlign = "left";

        if(icons) {

            let currIconSet = icons[headerData];

            if (currIconSet) {

                if(!currIconSet.displayValue) {
                    displayValue = false;
                }
                currIconSet.data.forEach(function (currIcon) {
                    if (currIcon.value == value) {
                        icon = self.getIconElem(headerData, currIcon.icon);
                    }
                })

                if (!icon && currIconSet.default) {
                    icon = self.getIconElem(headerData, currIconSet.default);
                }

                if (currIconSet.align) {
                    iconAlign = currIconSet.align;
                }
            }

        }

        let result = [];


        if(icon && iconAlign == "left") {
            result.push(icon);
        }

        if(displayValue) {
            result.push(value);
        }

        if(icon && iconAlign == "right") {
            result.push(icon);
        }

        return result;

    }

    getIconElem = (headerData, iconName) => {

        let className = "uk-icon-" + iconName;

        return <i key = {headerData} className={className} ></i>

    }



    isHidden = (header)  => {
        if (!header.hidden) {
            return false;
        }
        return true;
    }

    getClassName = (header) => {

        return  this.getClassNameAlignment(header);

    }

    getClassNameAlignment = (header) => {

        let className = "uk-text-";

        if(header.alignment) {
            className += header.alignment;
        } else {
            className += "center";
        }

        return className
    }

}

