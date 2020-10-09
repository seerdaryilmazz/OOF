import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { NumberInput } from 'susam-components/advanced';
import { Notify, Span, TextInput } from 'susam-components/basic';
import { Card, CardHeader, Grid, GridCell } from "susam-components/layout";
import uuid from "uuid";
import { HSCodeService } from '../services/HSCodeService';


export class HSCodeDetail extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            hsCodeBase: []
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data.id !== this.props.data.id) {
            this.searchBase(this.props.data.code, true);
        }
    }

    searchBase(value, onOpen) {
        this.props.onValueChange("code", value);
        if (_.isEmpty(value)) {
            this.setState({ hsCodeBase: [] });
        } else {
            HSCodeService.searchBase(value.substr(0, 6)).then((result) => {
                if (!_.isEmpty(result.data)) {
                    let hsCodeBaseItem = { code: result.data.code, name: result.data.name }
                    let hsCodeBaseParent = result.data.parents ? result.data.parents.map(p => { return { code: p.code, name: p.name } }) : [];
                    this.setState({ hsCodeBase: hsCodeBaseParent.concat([hsCodeBaseItem]) });
                } else if (onOpen) {
                    this.setState({ hsCodeBase: [] });
                }
            }).catch((err) => {
                Notify.showError(err);
            });
        }
    }

    renderHsCodeInfo() {
        let hsCodeSearch = this.state.hsCodeBase.map(i => {
            return <Span key={uuid.v4()} label={i.code} value={i.name} />
        });

        return this.props.data.id || !_.isEmpty(this.state.hsCodeBase) ? (
            <Card>
                <CardHeader title="HS Code Info" />
                <div style={{marginTop:"14px"}}>
                    {hsCodeSearch}
                </div>
            </Card>
        ) : null;
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <Card>
                        <Grid style={{marginTop:"0"}}>
                            <GridCell width="1-1" noMargin={true}>
                                <TextInput label="Definition"
                                    style={{ textTransform: "uppercase" }}
                                    maxLength="400"
                                    required={true}
                                    danger={_.isEmpty(this.props.data.name)}
                                    value={this.props.data.name}
                                    onchange={value => this.props.onValueChange("name", value)} />
                            </GridCell>
                            <GridCell width="1-1">
                                <NumberInput label="HS Code (Starts wtih)"
                                    maxLength="12"
                                    value={this.props.data.code}
                                    onchange={value => this.props.onValueChange("code", value)}
                                    oninput={value => this.searchBase(value)} />
                            </GridCell>
                        </Grid>
                    </Card>
                </GridCell>
                <GridCell width="1-1">
                    {this.renderHsCodeInfo()}
                </GridCell>
            </Grid>
        )
    }
}
