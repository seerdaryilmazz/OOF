import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { OptionList } from './OptionList';
import { ShipmentUnitDetails } from './ShipmentUnitDetails';
import { ShipmentUnitValidator } from "./validation/ShipmentUnitValidator";


export class ShipmentUnitDetailsList extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {validationResults: []};
    }

    componentDidMount(){
        if(this.props.active){
            this.setState({activeIndex: 0});
        }
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.active !== this.props.active){
            if(nextProps.active){
                this.setState({activeIndex: 0});
            }else{
                this.setState({activeIndex: null});
            }
        }
    }
    componentDidUpdate(){
        if(this.state.activeIndex === null && this.props.active){
            document.addEventListener('keydown', this.handleKeyPress);
        }else{
            document.removeEventListener('keydown', this.handleKeyPress);
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        if(e.key === "Tab" && this.state.activeIndex == null){
            this.props.onNext();
        }
    };
    handleNext(){
        this.setState({activeIndex: null}, () => this.props.onNext());
    }

    handlePrev(){

        this.setState({activeIndex: null}, () => this.props.onPrev());
    }

    handleNextFocus(index, value){
        let validationResult = ShipmentUnitValidator.validate(value);
        let state = _.cloneDeep(this.state);
        if(!validationResult.hasError()){
            state.activeIndex = null;
            state.validationResults[this.state.activeIndex] = null;
        }else{
            state.validationResults[this.state.activeIndex] = validationResult;
        }
        this.setState(state);
    }

    handleAddNew(template){
        let value = _.cloneDeep(this.props.value);
        let state = _.cloneDeep(this.state);
        let errorIndex = -1;
        value.forEach((item, index) => {
            let validationResult = ShipmentUnitValidator.validate(item);
            state.validationResults[index] = validationResult;
            if(validationResult.hasError()){
                errorIndex = index;
            }
        });
        if(errorIndex === -1){
            let newItem = {template: template};
            if(template){
                newItem.packageType = template.packageType;
                newItem.width = template.width;
                newItem.height = template.height;
                newItem.length = template.length;
                newItem.stackability = template.stackSize;
                newItem.templateId = template.id;
            }
            value.push(newItem);
            state.activeIndex = value.length - 1;
        }else{
            state.activeIndex = errorIndex;
        }
        this.setState(state, () => this.props.onChange && this.props.onChange(value));
    }
    handleChange(index, details){
        let value = _.cloneDeep(this.props.value);
        value[index] = details;
        this.props.onChange && this.props.onChange(value);
    }
    handleDelete(index){
        let value = _.cloneDeep(this.props.value);
        value.splice(index, 1);
        this.props.onChange && this.props.onChange(value);
        if(index < this.state.activeIndex){
            this.setState({activeIndex: this.state.activeIndex - 1});
        }else if(index === this.state.activeIndex){
            this.setState({activeIndex: 0});
        }
    }
    handleEdit(index){
        this.setState({activeIndex: index});
    }
    handleCancel(index){
        this.setState({activeIndex: null});
    }
    handleTemplateSelect(template){
        let packageType = _.find(this.props.packageTypes, {id: template.packageType.id});
        if(packageType){
            template.packageType = packageType;
        }
        this.setState({showOptions: false}, () => this.handleAddNew(template));
    }
    handleShowOptions(template){
        this.setState({showOptions: true});
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }
    renderBox(option){
        return(
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate uk-text-bold">{option.packageType ? super.translate(option.packageType.name) : ""}</span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate" style = {{opacity: .8}}>W:{option.width} cm. x L:{option.length} cm. x H:{option.height} cm.</span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <span className="uk-text-truncate uk-text-small">{`${super.translate("Stackability")}: ${option.stackSize ? super.translate(option.stackSize.name) : ""}`}</span>
                </GridCell>
            </Grid>
        );
    }
    render(){
        let style = {
            border: "1px solid #e0e0e0",
            borderRadius: "3px",
            padding: "12px",
            marginBottom: "12px"
        };

        let {packageTypes, value, validationResult} = this.props;
        let showOptions = this.state.showOptions;
        if(value.length === 0){
            if(this.props.options && this.props.options.length > 0){
                showOptions = true;
            }else{
                value.push({});
            }
        }
        let addNewButton = null;
        if(this.props.active){
            if(this.props.options && this.props.options.length > 0){
                addNewButton = <Button label="Add New" size = "small" style = "success" onclick = {() => this.handleShowOptions()} />;
            }else{
                addNewButton = <Button label="Add New" size = "small" style = "success" onclick = {() => this.handleAddNew()} />;
            }
        }
        let details = value.map((item, index) => {
            let itemValidation = validationResult ? validationResult.getItemResult(index) : this.state.validationResults[index];
            return (
                <div key = {index} style = {style}>
                    <ShipmentUnitDetails  packageTypes = {packageTypes} value = {item}
                                          options = {this.props.options}
                                          validationResult = {itemValidation}
                                          onNext = {(value) => this.handleNextFocus(index, value)}
                                          onPrev = {(value) => this.handlePrev(value)}
                                          active = {index === this.state.activeIndex}
                                          parentActive = {this.props.active}
                                          onChange = {(value) => this.handleChange(index, value)}
                                          onDelete = {() => this.handleDelete(index)}
                                          onEdit = {() => this.handleEdit(index)}/>
                </div>
            );
        });
        let templateOptions = null;
        if(showOptions){
            templateOptions = <OptionList options = {this.props.options}
                                          keyField="_key" enableArrowKeys = {true}
                                          onChange = {(value) => this.handleTemplateSelect(value) }
                                          onRender = {(option) => this.renderBox(option)}/>;
        }
        return (
            <Grid>
                <GridCell width = "1-1">
                    {details}
                </GridCell>
                <GridCell width = "1-1">
                    {templateOptions}
                </GridCell>
                <GridCell width = "1-1">
                    {addNewButton}
                </GridCell>
            </Grid>
        );
    }


}

ShipmentUnitDetailsList.contextTypes = {
    translator: PropTypes.object
};