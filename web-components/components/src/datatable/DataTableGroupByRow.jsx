import React from 'react';

export class DataTableGroupByRow extends React.Component {

    constructor(props) {
        super(props);
    }

    handleClick(){
        this.props.onclick && this.props.onclick();
    }

    render(){
        let level = this.props.level || 0;

        let className="";
        if(this.props.level === 1){
            className += " md-bg-grey-300";
        }
        let buttonClass = "uk-icon-chevron-" + (this.props.isHidden ? "down" : "up");

        let label = "";
        let value = this.props.value;
        let indexOfColon = value.indexOf(":");

        if (indexOfColon > -1) {
            label = value.substring(0, indexOfColon + 2);
            value = value.substring(indexOfColon + 2);
        }

        return(
            <tr style = {{borderBottom: "3px double #d0d0d0"}}>
                <td style={{textIndent: level * 10}} colSpan = {this.props.columnsLength} className={className}>
                    <a href="javascript:void(0);"
                       className={buttonClass}
                       style={{textIndent:0, margin: "0 10px 0 0"}}
                       onClick={() => this.handleClick()}/>
                    <span className="uk-text-bold">{label}</span>{value} ({this.props.rowLength})
                </td>
            </tr>
        );
    }
}