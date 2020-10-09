import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { TextInput } from "susam-components/basic";

export class CustomerGroupInfo extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = { item: this.props.item }
    }

    componentWillReceiveProps(nextProps){
        this.setState({ item: nextProps.item })
    }

    onNameChange(value) {
        let item = _.clone(this.state.item);
        item.name = value;
        this.setState({ item: item });
        this.props.onchange && this.props.onchange(item);
    }

    render() {
        return (
            <div>
                <TextInput label="Portfolio Name"
                    style={{textTransform: "uppercase"}}
                    value={this.props.item.name}
                    onchange={(value) => this.onNameChange(value)} />
            </div>
        );
    }
}