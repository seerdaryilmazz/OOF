import React from 'react';
import uuid from 'uuid';

export class TableRowAction extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {


        let actionButtons = this.props.actionButtons;
        let rowEdit = this.props.rowEdit;
        let rowDelete = this.props.rowDelete;
        let self = this;
        let index = parseInt(this.props.index);

        let actionButtonsStyle = {display : 'none'};
        if(actionButtons || rowEdit || rowDelete) {
            actionButtonsStyle = {};
        }

        return (

            <td className="uk-text-center" style={actionButtonsStyle}>
                {
                    this.prepareCustomActionButtonElems(actionButtons, self, index)
                }
                {
                    this.prepareRowEditButtonElem(rowEdit, self, index)

                }
                {
                    this.prepareRowDeleteButtonElem(rowDelete, self, index)
                }
            </td>
        );
    }

    prepareCustomActionButtonElems = (actionButtons, self, index) => {
        if(!actionButtons) {
            return null;
        }

        return actionButtons.map(function (button) {

            return (
                <a key={uuid.v4()} href="javascript:void(null);" onClick = {() => button.action(self.props.values)}>
                    {self.getActionIcon(button)}
                </a>
            )
        })

    }

    prepareRowEditButtonElem = (rowEdit, self, index) => {
        if(!rowEdit) {
            return null;
        }

        return (
            <a href="javascript:void(null);" onClick = {() => this.props.enableRowEditMode(index)}>
                {self.getActionIcon(rowEdit)}
            </a>
        )

    }

    prepareRowDeleteButtonElem = (rowDelete, self, index) => {
        if(!rowDelete) {
            return null;
        }

        return (
            <a href="javascript:void(null);" onClick = {() => this.deleteRowConfirm(rowDelete, self, self.props.values)}>
                {self.getActionIcon(rowDelete)}
            </a>
        )

    }

    deleteRowConfirm(rowDelete, self, rowData) {
        if (rowDelete.confirmation) {
            UIkit.modal.confirm(rowDelete.confirmation,
                 () => self.props.rowDelete.action(rowData)
            );
        } else {
            self.props.rowDelete.action(rowData);
        }

    }

    getActionIcon = (button) => {

        let defaultIcon = "pencil-square";

        let className;

        if (button.icon) {
            className = "md-icon uk-icon-" + button.icon ;
        } else {
            className = "md-icon uk-icon-" + defaultIcon;
        }

        return <i className={className} data-uk-tooltip="{pos:'bottom'}" title={button.title}></i>;
    }


}

