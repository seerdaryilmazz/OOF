import React from 'react';
import uuid from 'uuid';
import {Button} from '../basic';

export class Tree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        if(this.props.data){
            UIkit.nestable(this.treeTopDiv, { });
        }
    }
    componentDidUpdate(){
        if(this.props.data){
            UIkit.nestable(this.treeTopDiv, { });
        }
    }
    render() {

        let data = this.props.data;

        if (!data) {
            return null;
        }
        return (
            <div ref={(c) => this.treeTopDiv = c} className="uk-nestable" data-uk-nestable="">
                {this.getItem(data)}
            </div>
            );

    }

    getItem = (data) => {
        if(!data) {
            return null;
        }
        else if(Array.isArray(data)) {
            return this.iterateArray(data);
        }
        else if (data.children && data.children.length > 0) {
            return this.getNodeItem(data);
        } else {
            return this.getLeafItem(data);
        }
    }

    getNodeItem = (data) => {
        let className= "uk-nestable-panel";
        if(this.props.selectedId && data.id == this.props.selectedId) {
            className += " md-bg-blue-50";
        }

        let actionButtons = this.retrieveActionButtons(data);

        return (
            <div key={data.id} className="uk-nestable-item uk-parent uk-collapsed">
                <div className={className} onClick={() => this.elementSelected(data)}>
                    <div className="uk-nestable-toggle" data-nestable-action="toggle" ></div>
                    {data.name}
                    {actionButtons}
                </div>
                {this.iterateArray(data.children)}
            </div>
        );
    }


    getLeafItem = (data) => {
        let className= "uk-nestable-panel";
        if(this.props.selectedId && data.id == this.props.selectedId) {
            className += " md-bg-blue-50";
        }

        let actionButtons = this.retrieveActionButtons(data);

        return (
            <div key={data.id} className="uk-nestable-item">
                <div className={className} onClick={() => this.elementSelected(data)}>
                    {data.name}
                    {actionButtons}
                </div>
            </div>

        );
    }



    iterateArray = (arrayData) => {
        return (
            <div className="uk-nestable-list">
                {arrayData.map(data => {
                return this.getItem(data)
            })}
            </div>
        );
    }

    elementSelected = (data) => {
        if(this.props.onselect) {
            this.props.onselect(data);
        }
    }


    retrieveActionButtons = (data) => {

        if (!this.props.actions) {
            return null;
        }

        return (
            <div>
                {
                    this.props.actions.map(action => {
                        return (
                            <Button key={data.id + action.name} label={action.name} onclick={() => action.action(data)}/>
                        );
                    })
                }
            </div>
        );

    }

}



