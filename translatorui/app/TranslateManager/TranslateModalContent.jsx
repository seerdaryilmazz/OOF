import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Form, Notify, TextArea } from 'susam-components/basic';
import { Grid, GridCell, LoaderWrapper } from 'susam-components/layout';
import { GoogleTranslateService } from '../services/GoogleTranslateService';
import { StringUtils } from 'susam-components/utils/StringUtils';
import { StringCaseUtils } from '../util/StringCaseUtils';


export class TranslateModalContent extends TranslatingComponent {

    state = {
        translating: false
    };

    handleTanslate() {
        this.setState({ translating: true });
        GoogleTranslateService.translate(this.props.translateKey, 'en', this.props.locale).then(response => {
            this.props.onValueChange && this.props.onValueChange(StringUtils.capitalize(response.data.text, this.props.locale));
        }).catch(error => Notify.showError(error)).then(() => {
            this.setState({ translating: false });
        });
    }

    validate(){
        if(this.translateForm){
            return this.translateForm.validate();
        }
        return false;
    }

    render(){
        return(
            <Form ref={c=>this.translateForm=c}>
                <Grid>
                    <GridCell>
                        <TextArea
                            required={true}
                            rows={5}
                            cols={50}
                            label="Key"
                            value={this.props.translateKey}
                            onchange={value => this.props.onKeyChange && this.props.onKeyChange(value)} />
                    </GridCell>
                    <GridCell>
                        <Button label='Translate' flat={false} size='mini' onclick={()=>this.handleTanslate()} style='primary' />
                        {StringCaseUtils.casing.map((i, idx) => <Button key={idx} label={i.label} flat={true} size='mini' style='primary' onclick={() => this.props.onValueChange(i.execute(this.props.translateValue, this.props.locale))} />)}
                    </GridCell>
                    <GridCell>
                        <LoaderWrapper busy={this.state.translating} size="XL">
                            <TextArea
                                required={true}
                                rows={5}
                                cols={50}
                                label="Translation"
                                style={{ overflowY: "scroll" }}
                                value={this.props.translateValue}
                                onchange={value => this.props.onValueChange && this.props.onValueChange(value)} />
                        </LoaderWrapper>
                    </GridCell>
                </Grid>
            </Form>
        );
    }
}

TranslateModalContent.contextTypes = {
    translator: PropTypes.object
};