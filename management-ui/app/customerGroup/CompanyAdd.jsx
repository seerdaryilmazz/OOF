import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from "susam-components/basic";
import { CardHeader, Grid, GridCell } from "susam-components/layout";
import { CompanySearchAutoComplete } from "susam-components/oneorder";

export class CompanyAdd extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {selectedItem: null}
    }

    handleAddCompany() {
        this.state.selectedItem && this.props.onAdd && this.props.onAdd(this.state.selectedItem);
    }

    componentWillReceiveProps(nextProps){
        this.setState({ selectedItem: nextProps.value })
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin={true} >
                    <CardHeader title="New Company" />
                </GridCell>
                <GridCell width="4-5" >
                    <CompanySearchAutoComplete
                        showShortName={true}
                        value={this.state.selectedItem}
                        onchange={(selectedItem) => this.setState({ selectedItem: selectedItem })}
                        onclear={() => this.setState({ selectedItem: null })} />
                </GridCell>
                <GridCell width="1-5" >
                    <div className="uk-align-right uk-margin-top">
                        <Button label="Add" size="small" style="success" onclick={() => this.handleAddCompany()} />
                    </div>
                </GridCell>
            </Grid>
        );
    }
}