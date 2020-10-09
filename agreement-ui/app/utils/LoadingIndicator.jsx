import React from 'react';
import {TranslatingComponent} from 'susam-components/abstract';
import {Loader} from "susam-components/layout";
import uuid from "uuid";


export class LoadingIndicator extends TranslatingComponent{
    constructor(props){
        super(props);
        if(props.id){
            this.state = {id:props.id};
        }else{
            this.state = {id:uuid.v4()};
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.busy != this.props.busy){
            nextProps.busy ? this.open() : this.close();
        }
    }

    open(){
        UIkit.modal(
            '#' + this.state.id,
            {
                bgclose: false,
                keyboard: false,
                modal: false,
                center: true
            }
        ).show();
    }

    close(){
        UIkit.modal('#' + this.state.id).hide();
    }

    render() {
        const centered = {
            position:"absolute",
            width:"300px",
            height:"300px",
            left:"50%",
            top:"50%",
            marginLeft:"-50px",
            marginTop:"-50px"
        };
        return (
            <div id={this.state.id} className="uk-modal">
                <div className= "uk-modal-dialog uk-modal-dialog-blank uk-height-viewport" style={{background: "transparent"}}>
                    <div style = {centered}>
                        <Loader size="L" title="Please wait..."/>
                    </div>

                </div>
            </div>
        );
    }
}