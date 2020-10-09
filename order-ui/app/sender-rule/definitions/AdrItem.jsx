import React from 'react'
import {TranslatingComponent} from 'susam-components/abstract';
import {Button} from 'susam-components/basic';

export class AdrItem extends TranslatingComponent{

    constructor(props){
        super(props);
    }

    render(){
        if(!this.props.item){
            return null;
        }
        let deleteButton;
        if(this.props.onDelete){
            deleteButton = <div className="uk-align-right">
                <Button label = "delete" flat = {true} size = "small" style = "danger"
                        onclick = {() => this.props.onDelete(this.props.item)} />
            </div>
        }
        let style = {marginRight: "8px"}
        return(
            <div className="md-list-content" >
                <span className="md-list-heading">
                    <span style = {style}>{this.props.item.unNumber}</span>
                    <span style = {style}>Danger Code: {this.props.item.hazardIdentification}</span>
                    <span style = {style}>Packing: {this.props.item.packingGroup}</span>
                    <span style = {style}>Classification: {this.props.item.classificationCode}</span>
                    <span style = {style}>Transport&Tunnel: {this.props.item.transportTunnelCategory}</span>
                    <span style = {style}>Labels:{this.props.item.labels}</span>
                </span>
                {deleteButton}
                <span className="uk-text-small uk-text-muted">
                    {this.props.item.description}
                </span>
            </div>

        );
    }


}