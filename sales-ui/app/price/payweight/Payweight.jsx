import React from 'react';
import { NumberInput } from 'susam-components/advanced';
import { Checkbox, Form, Notify, TextInput } from 'susam-components/basic';
import { Button } from 'susam-components/basic/Button';
import { Grid, GridCell } from 'susam-components/layout';
import { Card } from 'susam-components/layout/Card';
import { PricingRuleService } from '../../services';

export class Payweight extends React.Component {
    state = {
        payweight: {}
    };
    constructor(props) {
        super(props);
        if (this.props.payweight) {
            this.state = {
                payweight: _.cloneDeep(this.props.payweight)
            };
        }
    }

    handleRemoveRange(index) {
        this.setState(prevState => {
            if (prevState.payweight.ranges.length > 1) {
                if (index > 0 && index < prevState.payweight.ranges.length - 1) {
                    prevState.payweight.ranges[index + 1].minimum = prevState.payweight.ranges[index - 1].maximum
                } else if (index === prevState.payweight.ranges.length - 1) {
                    prevState.payweight.ranges[index - 1].maximum = null
                } else {
                    prevState.payweight.ranges[index + 1].minimum = 0
                }
                prevState.payweight.ranges[index] = {};
            } else {
                prevState.payweight.ranges[index] = { minimum: 0 };
            }
            if (1 < prevState.payweight.ranges.length) {
                prevState.payweight.ranges[index] = null;
                prevState.payweight.ranges = _.reject(prevState.payweight.ranges, _.isNil);
            }
            return prevState;
        })
    }

    handleUpdateRange(range, index) {
        this.setState(prevState => {
            prevState.payweight.ranges[index] = range;
            if (prevState.payweight.ranges.length - 1 === index && !_.isEmpty(range.maximum)) {
                prevState.payweight.ranges.push({ minimum: range.maximum });
            } else {
                if (prevState.payweight.ranges.length - 2 === index && _.isEmpty(range.maximum)) {
                    prevState.payweight.ranges.pop();
                } else if (prevState.payweight.ranges[index + 1]) {
                    prevState.payweight.ranges[index + 1].minimum = range.maximum
                }
            }
            return prevState;
        })
    }

    handleSave(){
        if(!this.payweightForm.validate()){
            return;
        }
        PricingRuleService.savePayweight(this.state.payweight).then(response=>{
            this.setState({payweight: response.data});
            Notify.showSuccess("PW saved");
            this.props.onSave && this.props.onSave(response.data);
        }).catch(error=>Notify.showError(error));
    }

    handleCancel() {
        this.props.onCancel && this.props.onCancel();
    }

    render() {
        return (<Card>
            <Form ref={c=>this.payweightForm=c}>
                <Grid>
                    <GridCell width="1-1">
                        <TextInput label="Name" required={true} value={this.state.payweight.name} onchange={value=>this.setState(prevState=>prevState.payweight.name=value)} />
                    </GridCell>
                    <GridCell width="1-1">
                        <Checkbox label="Set as Default" value={this.state.payweight.defaultPayweight} onchange={value=>this.setState(prevState=>prevState.payweight.defaultPayweight=value)} />
                    </GridCell>
                </Grid>
                {this.renderRanges(this.state.payweight.ranges)}
                <GridCell width="1-1">
                    <div className="uk-text-right">
                        <Button label="cancel" onclick={()=>this.handleCancel()} />
                        <Button label="save" style="primary" onclick={()=>this.handleSave()} />
                    </div>
                </GridCell>
            </Form>
        </Card>)
    }

    renderRanges(ranges) {
        return <Grid>
            {_.defaultTo(ranges, []).map((range, index) => {
                return (<GridCell width="1*1" key={index}>
                    <PayweightRange range={range} first={0 === index} last={ranges.length - 1 === index}
                        onRemove={item => this.handleRemoveRange(index)}
                        onUpdate={item => this.handleUpdateRange(item, index)} />
                </GridCell>);
            })}
        </Grid>
    }
}

class PayweightRange extends React.Component {

    handleRemove(item) {
        this.props.onRemove && this.props.onRemove(item);
    }

    handleUpdate(key, value) {
        let range = _.cloneDeep(this.props.range);
        _.set(range, key, value);
        this.props.onUpdate && this.props.onUpdate(range);
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-3">
                    <NumberInput required={true} label="Minimum (PW)" value={this.props.range.minimum} readOnly={true} onchange={value => this.handleUpdate('minimum', value)} />
                </GridCell>
                <GridCell width="1-3">
                    <NumberInput required={!this.props.last} label="Maximum (PW)" value={this.props.range.maximum} onchange={value => this.handleUpdate('maximum', value)} />
                </GridCell>
                <GridCell width="1-3">
                    <Button label="remove" style="danger" flat={true} size="mini" onclick={item => this.handleRemove(item)} />
                </GridCell>
            </Grid>
        )
    }
}