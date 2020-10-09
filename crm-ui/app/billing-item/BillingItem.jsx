import * as axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import { NumberInput } from 'susam-components/advanced';
import { Button, DropDown, Form, Notify, TextInput } from 'susam-components/basic';
import { Card, Grid, GridCell } from 'susam-components/layout';
import { BillingItemService, LookupService } from '../services';

let handleChange;
export class BillingItem extends React.Component {
    static defaultProps = {
        billingItem: {}
    }

    state = {
        billingItem: {},
        serviceAreas: []
    };

    constructor(props) {
        super(props);
        this.init();
        handleChange = (key, value) =>this.handleChange(key, value);
    }

    componentDidMount(){
        this.setState({
            billingItem: _.cloneDeep(this.props.billingItem)
        });
        $('input', ReactDOM.findDOMNode(this.nameField)).blur(function() {
            let val = _.toUpper(_.snakeCase($(this).val()));
            handleChange('name', _.toUpper(val));
        });
    }

    init() {
        axios.all([
            LookupService.getServiceAreas()
        ]).then(axios.spread((serviceArea) => {
            this.setState({ serviceAreas: serviceArea.data })
        }));
    }

    handleChange(key, value){
        this.setState(prevState=>{
            _.set(prevState.billingItem, key, value);
            return prevState;
        });
    }

    save(){
        if(this.form.validate()){
            BillingItemService.save(this.state.billingItem).then(response=>{
                Notify.showSuccess("Saved");
                this.props.onSave && this.props.onSave(response.data);
            }).catch(error=>Notify.showError(error));
        }
    }

    cancel(){
        this.setState({billingItem: {}});
        this.props.onCancel && this.props.onCancel();
    }

    render() {
        return (
            <Card>
                <Form ref={c=>this.form=c}>
                    <Grid>
                        <GridCell width="1-2">
                            <TextInput label="Name" required={true}
                                ref={c=>this.nameField=c}
                                value={this.state.billingItem.name} 
                                maxLength={100}
                                onchange={value=>this.handleChange('name', value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <TextInput label="Description" required={true}
                                value={this.state.billingItem.description} 
                                maxLength={100}
                                onchange={value=>this.handleChange('description', value)} />
                        </GridCell>
                        <GridCell width="1-2">
                            <NumberInput label="Code" required={true} 
                                maxLength={4}
                                value={this.state.billingItem.code} 
                                onchange={value=>this.handleChange('code', value)} />
                        </GridCell>
                        <GridCell width="1-2">
                            <DropDown label="Service Area" required={true}
                                options={_.defaultTo(this.props.serviceAreas, this.state.serviceAreas)} 
                                value={_.find(this.state.serviceAreas, i=>i.code === this.state.billingItem.serviceArea)}
                                onchange={value=>this.handleChange('serviceArea', _.get(value, 'code'))} />
                        </GridCell>
                        <GridCell width="1-2" />
                        <GridCell width="1-2" style={{textAlign: "right"}}>
                            <Button label="cancel" onclick={()=>this.cancel()} />
                            <Button label="save" style="primary" onclick={()=>this.save()} />
                        </GridCell>
                    </Grid>
                </Form>
            </Card>
        )
    }
}