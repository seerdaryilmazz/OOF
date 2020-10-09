import React from 'react';
import uuid from 'uuid';

export class CardListRowAction extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        let rowData = this.props.rowData;
        let rowActions = this.props.rowActions;

        let className = this.getClassName(rowActions);

        let self = this;

        let actionElems = rowActions.map(function(rowAction) {

                let className = self.getClassName(rowAction);

                return(
                    <li key={uuid.v4()}>
                        <a href="javascript:void(null);" onClick = {() => rowAction.action(rowData)}>
                            <i className={className}></i>
                            {rowAction.label}
                        </a>
                    </li>
                );
            }
        );

        if(actionElems && actionElems.length > 0) {
            return (
                <div className="md-card-list-item-menu" data-uk-dropdown="{mode:'click',pos:'bottom-right'}"
                     aria-haspopup="true" aria-expanded="false">
                    <a href="#" className="md-icon uk-icon uk-icon-ellipsis-v"></a>
                    <div className="uk-dropdown uk-dropdown-small uk-dropdown-bottom">
                        <ul className="uk-nav">
                            {actionElems}
                        </ul>
                    </div>
                </div>
            );
        } else {
            return null;
        }

    }

    getClassName= (actionSpec) => {
        let className = "uk-icon-";
        className += actionSpec.icon;
        className += " uk-icon-medsmall";
        return className;
    }



}
