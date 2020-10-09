import React from 'react';
import { Button } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { DefinitionOfGoods } from './DefinitionOfGoods';
import { OptionList } from './OptionList';
import * as Validator from "./validation/CommonValidator";
import { DefaultInactiveElement } from './OrderSteps';

export class DefinitionOfGoodsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = { validationResults: [] };
    }

    componentDidMount() {
        if (this.props.active) {
            this.setState({ activeIndex: this.props.activeIndex ? this.props.activeIndex : 0 });
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.active !== this.props.active) {
            if (nextProps.active) {
                this.setState({ activeIndex: nextProps.activeIndex ? nextProps.activeIndex : 0 });
            } else {
                this.setState({ activeIndex: null });
            }
        }
        // if((_.isEmpty(nextProps.value) && _.isEmpty(this.props.value)) || !_.isEmpty(nextProps.value) && _.isEmpty(this.props.value)){
        //     if(this.props.value.length === 0 && this.props.options.length ===1 && !this.state.clicked){
        //         let value = _.cloneDeep(this.props.value);
        //         value.push(_.first(this.props.options));
        //         this.handleSelect(value);
        //     }
        // }
    }
    componentDidUpdate() {
        if (this.props.active) {
            document.addEventListener('keydown', this.handleKeyPress);
        } else {
            document.removeEventListener('keydown', this.handleKeyPress);
        }
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        if (e.key === "Tab") {
            e.stopPropagation();
            e.shiftKey ? this.handlePrev(): this.handleNext();
        }
    };
    handleNext() {
        this.props.onNext();
    }
    
    handlePrev() {
        this.props.onPrev();
    }

    handleEdit(index){
        this.setState({activeIndex: index});
    }
    handleCancel(index){
        this.setState({activeIndex: null});
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
            this.setState({activeIndex: this.props.activeIndex ? this.props.activeIndex : 0});
        }
    }

    handleAddNew() {
        let value = _.cloneDeep(this.props.value);
        let state = _.cloneDeep(this.state);
        let errorIndex = -1;
        
        let x =_.filter(value, (item, index, iteratee) => { return _.find(iteratee, item, index + 1) });
        value.forEach((item, index) => {
            let validationResult = Validator.IdValidator.validate(item);
            state.validationResults[index] = validationResult;
            if(validationResult.hasError()){
                errorIndex = index;
            }
        });
        if(errorIndex === -1){
            value.push({});
            state.activeIndex = value.length - 1;
        }else{
            state.activeIndex = errorIndex;
        }
        this.setState(state, () => this.props.onChange && this.props.onChange(value));
    }

    renderBox(item){
        return(
            <Grid>
                <GridCell width="1-5" noMargin = {true}>
                    <span className = "uk-text-truncate uk-text-bold">HS: {item.code}</span>
                </GridCell>
                <GridCell width="4-5" noMargin = {true}>
                    <span className = "uk-text-truncate uk-text-bold">{item.name}</span>
                </GridCell>
            </Grid>
        );
    }

    handleSelect(value){
        this.props.onChange && this.props.onChange(value);
        // this.setState({clicked: true}, ()=>{this.props.onChange && this.props.onChange(value)})
    }

    render() {
        let style = {
            border: "1px solid #e0e0e0",
            borderRadius: "3px",
            padding: "12px",
            marginBottom: "12px"
        };

        let { value } = this.props;
        let showOptions = this.state.showOptions;
        if (this.props.options &&  this.props.options.length > 0) {
            showOptions = true;
        } else if(value.length === 0 && this.props.active){
            value.push({});
        }

        let addNewButton = null;
        if (this.props.active && !showOptions) {
            addNewButton = <Button label="Add New" size="small" style="success" onclick={() => this.handleAddNew()} />;
        }

        let details = null;
        if(showOptions){
            details = <OptionList   value = {value}
                                    options = {this.props.options}
                                    multiple={true}
                                    columns="1"
                                    keyField="id" 
                                    enableArrowKeys = {this.props.active}
                                    onChange = {(value) => this.handleSelect(value)}
                                    onRender = {(option) => this.renderBox(option)} />;
        } else if(_.isEmpty(value)){
            details = <DefaultInactiveElement value="No selection" />;
        } else {
            details = value.map((item, index) => {
                return (
                        <div style={style} key={index}>
                            <DefinitionOfGoods  value={item} 
                                                parentActive = {this.props.active}
                                                active = {index === this.state.activeIndex}
                                                onNext = {(value) => this.handleNextFocus(index, value)}
                                                onPrev = {(value) => this.handlePrev(value)}
                                                onChange = {(value) => this.handleChange(index, value)}
                                                onDelete = {() => this.handleDelete(index)}
                                                onEdit = {() => this.handleEdit(index)} />
                        </div>
                );
            });
        }
        return (
            <Grid>
                <GridCell width="1-1">
                    {details}
                </GridCell>
                <GridCell width="1-1">
                    {addNewButton}
                </GridCell>
            </Grid>
        );
    }
}