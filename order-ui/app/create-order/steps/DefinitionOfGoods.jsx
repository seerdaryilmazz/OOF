import React from 'react';
import { Button } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import uuid from 'uuid';
import { HSCodeExtendedAutoComplete } from '../../common/HSCodeExtendedAutoComplete';

export class DefinitionOfGoods extends React.Component {

    constructor(props) {
        super(props);
        this.focusedElementId = uuid.v4();
    }

    componentDidUpdate() {
        if (this.props.active) {
            this.focusOn(this.focusedElementId);
        }
    }

    componentDidMount(){
        if (this.props.active) {
            this.focusOn(this.focusedElementId);
        }
    }

    handleNext() {
        this.props.onNext && this.props.onNext(this.props.value);
    }
    handlePrev() {
        this.props.onPrev && this.props.onPrev(this.props.value);
    }
    focusOn(elementId) {
        document.getElementById(elementId).focus();
        this.focusedElementId = elementId;
    }

    handleDelete() {
        this.props.onDelete && this.props.onDelete();
    }
    handleEdit() {
        this.props.onEdit && this.props.onEdit();
    }
    handleHsCodeChange(value){
        this.props.onChange && this.props.onChange(value)
    }

    renderActive() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <HSCodeExtendedAutoComplete value={this.props.value} onChange={(value)=>this.handleHsCodeChange(value)} id={this.focusedElementId} />
                </GridCell>
                <GridCell width="1-1">
                    <Button label="Delete" style="danger" flat={true} size="small" onclick={() => this.handleDelete()} />
                </GridCell>
            </Grid>
        )
    }

    renderInactive() {
        let buttons = null;
        if (this.props.parentActive) {
            buttons =
                <GridCell width="1-1">
                    <Button label="Edit" style="success" flat={true} size="small" onclick={() => this.handleEdit()} />
                    <Button label="Delete" style="danger" flat={true} size="small" onclick={() => this.handleDelete()} />
                </GridCell>
        }

        return (
            <Grid>
                <GridCell width="1-6" noMargin={true}>
                    HS: {this.props.value.code}
                </GridCell>
                <GridCell width="5-6" noMargin={true}>
                    {this.props.value.name}
                </GridCell>
                {buttons}
            </Grid>
        );

    }

    render() {
        return this.props.active ? this.renderActive() : this.renderInactive();
    }
}