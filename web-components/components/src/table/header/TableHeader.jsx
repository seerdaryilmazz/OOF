import React from 'react';
import {HeaderElem} from './HeaderElem';

/**
 * actions
 * insertion
 * headers
 */
export class TableHeader extends React.Component {
    constructor(props) {
        super(props);

    }

    render(){

        if(!this.props.headers) {
            return null;
        }

        let self = this;

        let actions = this.props.actions;
        let insertion = this.props.insertion;

        let headers = this.props.headers;

        let showActionColumn = this.isActionColumnShown(actions, insertion);

        let actionColumn = null;

        if(showActionColumn) {
            actionColumn = <HeaderElem header={{name: this.getActionTitle(actions)}} />
        }


        return (
            <thead>
                <tr>
                    {
                        headers.map(function(header) {
                            return <HeaderElem key = {header.data} header={header} 
                                               sortData = {(sortBy, sortOrder, headerSortObj) => self.props.sortData(sortBy, sortOrder, headerSortObj)}/>
                        }
                    )}
                    {actionColumn}
                </tr>
            </thead>
        );
    }

    getActionTitle = (actions) => {
        return "Actions";
    }

    isActionColumnShown= (actions, insertion) => {
        if(actions || insertion) {
            return true;
        } else {
            return false;
        }
    }

}