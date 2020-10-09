import React from 'react';
import {Button} from '../../basic/Button';

import _ from 'lodash';
/**
 * headers
 * insertion
 * values
 */
export class TableRowComposite extends React.Component {
    constructor(props) {
        super(props);
        this.state = {values: this.props.values};
    }

    render() {
        let headers = this.props.headers;
        let insertion = this.props.insertion;
        let mode = this.props.mode;

        if(insertion) {

            let buttonName = "";
            if(mode == "add") {
                buttonName = "Add";
            } else if(mode == "edit") {
                buttonName = "Save";
            }

                return (
                    <tr>
                        {
                            this.prepareRowDatafromInsertion(headers, insertion)
                        }
                        <td className="uk-text-center">
                            <Button label={buttonName} flat={true} waves={true} size="medium" onclick={() => this.buttonClicked()}/>
                        </td>
                    </tr>
                );

        } else {
            return null;
        }
    }
    
    buttonClicked() {
        this.props.onsave(this.state.values);
    }

    prepareRowDatafromInsertion = (headers, insertion) => {

        return headers.map((header) => {

            let colElems = insertion[header.data];
            let className = this.getClassName(header);
            let hidden = this.isHidden(header);

            let style = {};
            if (hidden) {
                style.display = 'none';
            }

            if(!colElems) {
                return (
                    <td key={header.data} className={className} style={style}>
                        {this.getSafeValueFromState(header.data)}
                    </td>
                )
            }

            return (
                <td key={header.data} className={className} style={style}>
                    {insertion[header.data].map((elem) => {
                        return React.cloneElement(elem, {
                            key: header.data,
                            value: this.getSafeValueFromState(header.data),
                            checked: this.getSafeValueFromState(header.data),
                            onchange: (value) => this.updateState(header.data, value)
                        });
                    })
                    }
                </td>
            )

        })

    }

    getSafeValueFromState(key) {
        let value = this.state.values[key];
        if(!value) {
            value = "";
        }
        return value;
    }

    updateState(dataName, newValue){
        let state = _.cloneDeep(this.state);
        state.values[dataName] = newValue;
        this.setState(state);
    }


    isHidden(header){
        if (!header.hidden) {
            return false;
        }
        return true;
    }

    getClassName(header){
        return this.getClassNameAlignment(header);
    }

    getClassNameAlignment(header){

        let className = "uk-text-";

        if(header.alignment) {
            className += header.alignment;
        } else {
            className += "center";
        }

        return className
    }

}

