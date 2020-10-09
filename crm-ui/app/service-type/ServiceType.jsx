import * as axios from 'axios'
import React from 'react'
import ReactDOM from 'react-dom'
import { Button, Form, Notify, TextInput } from 'susam-components/basic'
import { DropDown } from 'susam-components/basic/DropDown'
import { Grid, GridCell, Modal } from 'susam-components/layout'
import { Card } from 'susam-components/layout/Card'
import { BillingItem } from '../billing-item/BillingItem'
import { BillingItemService, ServiceTypeService } from '../services'

let handleChange;

export class ServiceType extends React.Component {

    static defaultProps = {
        serviceType: {}
    };

    state = {
        serviceType:{},
        billingItems: [],
        serviceAreas: []
    };

    constructor(props) {
        super(props);
        this.init();
        handleChange = (key, value) =>this.handleChange(key, value);
    }

    componentDidMount() {
        this.setState({
            serviceType: _.cloneDeep(this.props.serviceType)
        });
        $('input', ReactDOM.findDOMNode(this.codeField)).blur(function() {
            let val = _.toUpper(_.snakeCase($(this).val()));
            handleChange('code', _.toUpper(val));
        });
    }

    init() {
        axios.all([
            BillingItemService.list()
        ]).then(axios.spread((billingItem) => {
            this.setState({
                billingItems: billingItem.data
            });
            if(this.billingItemModal.isOpen()){
                this.billingItemModal.close()
            }
        })).catch(error => Notify.showError(error));
    }

    handleChange(key, value) {
        this.setState(prevState => {
            _.set(prevState.serviceType, key, value);
            return prevState;
        });
    }

    save(){
        if(this.form.validate()){
            let serviceType = this.state.serviceType;
            _.set(serviceType, 'category', 'EXTRA');
            ServiceTypeService.save(serviceType).then(response=>{
                Notify.showSuccess("Saved");
                this.props.onSave && this.props.onSave(response.data);
            }).catch(error=>Notify.showError(error));
        }
    }

    cancel(){
        this.props.onCancel && this.props.onCancel();
    }

    render() {
        return (
            <Card>
                <Form ref={c=>this.form=c}>
                    <Grid>
                        <GridCell width="1-2">
                            <TextInput label="Code" required={true} 
                                ref={c=>this.codeField=c}
                                value={this.state.serviceType.code}
                                maxLength={100}
                                oninput={value=>this.handleChange('code', value)} />
                        </GridCell>
                        <GridCell width="1-2">
                            <TextInput label="Name" required={true} 
                                value={this.state.serviceType.name}
                                maxLength={100}
                                onchange={value=>this.handleChange('name', value)} />
                        </GridCell>
                        <GridCell width="1-2">
                            <DropDown label="Service Area" required={true} required={true}
                                options={this.props.serviceAreas}
                                value={_.find(this.props.serviceAreas, i => i.code === this.state.serviceType.serviceArea)}
                                onchange={value => this.handleChange('serviceArea', _.get(value, 'code'))} />
                        </GridCell>
                        <GridCell width="2-5">
                            <DropDown label="Billing Item" required={true} 
                                emptyText="Firstly, Select service area"
                                value={this.state.serviceType.billingItem}
                                labelField="description"
                                options={_.filter(this.state.billingItems, i=>i.serviceArea===this.state.serviceType.serviceArea)} 
                                onchange={value=>this.handleChange('billingItem', value)}/>
                        </GridCell>
                        <GridCell width="1-10">
                            <Button label="new billing item" flat={true} style="success" size="small"
                                onclick={()=>this.billingItemModal.open()} />
                        </GridCell>
                        <GridCell width="1-2" />
                        <GridCell width="1-2" style={{ textAlign: "right" }}>
                            <Button label="cancel" onclick={() => this.cancel()} />
                            <Button label="save" style="primary" onclick={() => this.save()} />
                        </GridCell>
                    </Grid>
                </Form>
                <Modal ref={c => this.billingItemModal = c} 
                    title="New Billing Item"
                    onopen={()=>this.setState({billingItem: {}})}
                    onclose={()=>this.setState({billingItem: undefined})}>
                    {this.state.billingItem && 
                    <BillingItem 
                        billingItem={this.state.billingItem}
                        serviceAreas={this.props.serviceAreas} 
                        onSave={()=>this.init()}
                        onCancel={()=>this.billingItemModal.close()} /> }
                </Modal>
            </Card>
        )
    }
}