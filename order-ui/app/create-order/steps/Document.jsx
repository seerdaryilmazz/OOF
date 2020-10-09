import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip, FileInput } from 'susam-components/advanced';
import { Button, Notify, TextInput } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { OrderService } from '../../services';
import { DefaultInactiveElement, handleTabPress } from './OrderSteps';

export class Document extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
        this.elementIdsForTabSequence = ["document-type","document-upload"];
        this.focusedElementId = null;
    }

    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
            this.focusOn("document-type");
        }
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }else{
            document.removeEventListener('keyup', this.handleKeyPress);
        }
    }
    componentDidUpdate(prevProps, prevState){
        if(this.props.active && !prevProps.active){
            this.focusOn("document-type");
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keyup', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        handleTabPress(e, () => this.focusNext(), () => this.focusPrev());
    };
    focusNext(){
        if(!this.focusedElementId){
            this.focusOn(this.elementIdsForTabSequence[0]);
        }else{
            let nextIndex = this.elementIdsForTabSequence.findIndex(item => item === this.focusedElementId) + 1;
            if(nextIndex >= this.elementIdsForTabSequence.length){
                this.props.onNext();
            }else{
                this.focusOn(this.elementIdsForTabSequence[nextIndex]);
            }
        }
    }
    focusPrev(){
        if(!this.focusedElementId){
            this.focusOn(this.elementIdsForTabSequence[0]);
        }else{
            let prevIndex = this.elementIdsForTabSequence.findIndex(item => item === this.focusedElementId) - 1;
            if(prevIndex < 0){
                this.props.onPrev();
            }else{
                this.focusOn(this.elementIdsForTabSequence[prevIndex]);
            }
        }
    }
    focusOn(elementId){
        document.getElementById(elementId).focus();
        this.focusedElementId = elementId;
    }

    updateState(key, value){
        let details = _.cloneDeep(this.props.value);
        details[key] = value;
        this.props.onChange && this.props.onChange(details);
    }
    handleFileUpload(key, file){
        if(file){
            OrderService.uploadFile(file).then(response => {
                let document = {
                    tempFileName: response.data,
                    originalName: file.name,
                    file: file
                };
                this.updateState(key, document);
            }).catch(error => Notify.showError(error));
        }
    }

    handleDelete(){
        this.props.onDelete && this.props.onDelete();
    }
    handleEdit(){
        this.props.onEdit && this.props.onEdit();
    }

    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }
    renderValidation(){
        let validationResult = null;
        if(this.props.validationResult && this.props.validationResult.hasError()){
            validationResult = this.props.validationResult.messages.map(item => {
                return(
                    <GridCell key = {item} width = "1-1">
                        <span className="uk-text-danger" >{super.translate(item)}</span>
                    </GridCell>
                );
            });
        }
        return <GridCell width = "1-1" noMargin = {true}><Grid>{validationResult}</Grid></GridCell>;
    }
    renderInactive(){
        if(!this.props.value){
            return <DefaultInactiveElement value="No selection" />;
        }
        let buttons = null;
        if(this.props.parentActive){
            buttons =
                <GridCell width = "1-1">
                    <Button label = "Edit" style = "success" flat = {true} size = "small" onclick = {() => this.handleEdit()}/>
                    <Button label = "Delete" style = "danger" flat = {true} size = "small" onclick = {() => this.handleDelete()}/>
                </GridCell>
        }
        let documentNames = this.props.value.types ? this.props.value.types.map(item => {
            if(item.code === "OTH"){
                return item.name + "(" + this.props.value.description + ")";
            }
            return item.name;
        }).join(",") : null;
        return (
            <Grid>
                {this.renderValidation()}
                <GridCell width = "1-1">
                    <span className = "heading_a_thin">{documentNames}</span>
                    <span className = "heading_a_thin" style = {{marginLeft: "12px"}}>
                        {this.props.value.document ? this.props.value.document.originalName : ""}
                        </span>
                </GridCell>
                {buttons}
            </Grid>
        );
    }
    renderActive(){
        let description = null;
        if(this.props.value.types && _.find(this.props.value.types, {code: "OTH"})){
            description = <GridCell width = "1-1">
                <TextInput label = "Description"
                           value = {this.props.value.description} required = {true}
                           onchange = {(value) => this.updateState("description", value)} />
            </GridCell>
        }
        return(
            <Grid>
                {this.renderValidation()}
                <GridCell width = "1-1">
                    <Chip options = {this.props.types} id = "document-type" placeholder = "Document Type"
                              value = {this.props.value.types} valueField = "code" translate={true}
                              onchange = {(value) => this.updateState("types", value)} hideSelectAll={true} />
                </GridCell>
                {description}
                <GridCell width = "1-1">
                    <FileInput id = "document-upload"
                          value = {this.props.value.document ? this.props.value.document.file : null}
                          onchange = {(value) => this.handleFileUpload("document", value ? value[0] : null)} />
                </GridCell>
                <GridCell width = "1-1">
                    <div className = "uk-align-center">
                        <Button label="Delete" size = "small" flat = {true} style = "danger" onclick = {() => this.handleDelete()} />
                    </div>
                </GridCell>

            </Grid>
        );
    }
}

Document.contextTypes = {
    translator: PropTypes.object
};