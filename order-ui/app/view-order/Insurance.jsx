import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from 'susam-components/basic';
import { Grid, GridCell, Modal } from 'susam-components/layout';
import { MiniLoader } from './MiniLoader';

export class Insurance extends TranslatingComponent{

    state = {};

    handleClick(){
        if(this.props.editable) {
            this.setState({insured: this.props.value}, () => {
                this.editModal.open();
            });
        }
    }

    handleChange(){
        this.setState({insured: !this.state.insured});
    }

    getTitle(insured){
        return insured ? super.translate("Insured By Ekol") : super.translate("Not insured by Ekol");
    }

    handleClickSave(){
        this.props.onSave(this.state.insured);
        this.editModal.close();
    }

    handleCloseModal(){
        this.editModal.close();
    }

    render() {
        if (this.props.busy) {
            return <MiniLoader title="saving..."/>
        }

        let classNames = ["uk-badge", "wide-badge", "uk-margin-small-right", this.props.value ? "md-bg-light-green-700" : "md-bg-red-700"];
        return (
            <div>
               <i className={classNames.join(" ")}
                  title={this.getTitle(this.props.value)}
                  data-uk-tooltip="{pos:'bottom'}">{this.props.value ? super.translate("Insured") : super.translate("Not Insured")}</i>
                {this.renderModal()}
                {this.renderEditButton()}
           </div>
        );
    }

    renderEditButton(){
        if(this.props.editable){
            return <Button label = "Edit" flat = {true} size = "mini" style = "primary" onclick = {() => this.handleClick()} />
        }
        return null;
    }

    renderModal(){
        return(
            <Modal title = "Change Insurance" ref = {c => this.editModal = c}
                   closeOtherOpenModals = {false}
                   actions={[
                       {label:"Close", action:() => this.handleCloseModal()},
                       {label: "Save", buttonStyle: "primary", action:() => this.handleClickSave()}
                   ]}>
                {this.renderModalContent()}
            </Modal>
        );
    }

    renderModalContent(){
        return(
            <Grid>
                <GridCell width = "1-1">
                    <div className = "uk-text-center">
                        <Button label = {this.renderButtonTitle()}
                                style = {this.renderButtonStyle()} size = "small"
                                onclick = {() => this.handleChange()}/>
                    </div>
                </GridCell>
            </Grid>
        );
    }
    renderButtonTitle(){
        return this.state.insured ? "Remove Insurance" : "Set Insurance";
    }
    renderButtonStyle(){
        return this.state.insured ? "danger" : "success";
    }
}

Insurance.contextTypes = {
    translator: PropTypes.object
};