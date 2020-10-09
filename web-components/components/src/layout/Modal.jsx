import React from "react";
import PropTypes from 'prop-types';
import uuid from "uuid";
import {Button} from "../basic";
import {TranslatingComponent} from "../abstract/";

export class Modal extends TranslatingComponent {
    constructor(props) {
        super(props);
        if(props.id){
            this.state = {id:props.id};
        }else{
            this.state = {id:uuid.v4()};
        }
    };

    componentDidMount(){
        $('#' + this.state.id).on({
            'show.uk.modal': () => {
                this.props.onopen && this.props.onopen();
            },
            'hide.uk.modal': () => {
                this.props.onclose && this.props.onclose();
            }
        });
    }

    open(){

        let closeOnBackgroundClicked;

        if (this.props.closeOnBackgroundClicked === true || this.props.closeOnBackgroundClicked === false) {
            closeOnBackgroundClicked = this.props.closeOnBackgroundClicked;
        } else {
            closeOnBackgroundClicked = true;
        }

        let closeOnEscKeyPressed;

        if (this.props.closeOnEscKeyPressed === true || this.props.closeOnEscKeyPressed === false) {
            closeOnEscKeyPressed = this.props.closeOnEscKeyPressed;
        } else {
            closeOnEscKeyPressed = true;
        }

        // Bu özellik doğru çalışmıyor, değer true olduğunda modal'ın kendisi de kapanıyor.
        // Detaylı bilgi için: https://github.com/uikit/uikit/issues/2123
        let closeOtherOpenModals;

        if (this.props.closeOtherOpenModals === true || this.props.closeOtherOpenModals === false) {
            closeOtherOpenModals = this.props.closeOtherOpenModals;
        } else {
            closeOtherOpenModals = true;
        }

        let center;

        if (this.props.center === true || this.props.center === false) {
            center = this.props.center;
        } else {
            center = true;
        }

        UIkit.modal(
            '#' + this.state.id,
            {
                bgclose: closeOnBackgroundClicked,
                keyboard: closeOnEscKeyPressed,
                modal: closeOtherOpenModals,
                center: center
            }
        ).show();
    }
    close() {
        if(this.isOpen()){
            UIkit.modal('#' + this.state.id).hide();
        }
    }

    isOpen(){
        return UIkit.modal('#' + this.state.id).isActive();
    }

    handleActionClick(item){
        item.action();
    }
    decideFlat(item){
        if(item.flat===false){
            return false;
        }else
            return true;
    }

    render() {

        let className = "uk-modal-dialog";

        if (this.props.fullscreen === true) {
            className += " uk-modal-dialog-blank uk-height-viewport";
        } else {
            if (this.props.large) {
                className += " uk-modal-dialog-large";
            }
            if (this.props.medium) {
                className += " uk-modal-dialog-medium";
            }
        }

        if (this.props.removePadding === true) {
            className += " uk-padding-remove";
        }

        let title = null;
        if (this.props.title) {
            title = (
                <div className="uk-modal-header">
                    <h3 className="uk-modal-title">{super.translate(this.props.title)}</h3>
                </div>
            );
        }

        let actions = null;
        if (this.props.actions && this.props.actions.length > 0) {
            actions = (
                <div className="uk-modal-footer uk-text-right">
                    {
                        this.props.actions && this.props.actions.map((item) => {
                            return (<Button key={item.label} flat={this.decideFlat(item)} waves={true} style={item.buttonStyle}
                                            label={item.label} onclick={() => this.handleActionClick(item)}/>);
                        })
                    }
                </div>
            );
        }

        let style = {};
        if(this.props.minHeight){
            style = {minHeight: this.props.minHeight};
        }

        return (
            <div id={this.state.id} className="uk-modal">
                <div className= {className} style = {style}>
                    {title}
                    {this.props.children}
                    {actions}
                </div>
            </div>
        );

    }


}
Modal.contextTypes = {
    translator: PropTypes.object
};
