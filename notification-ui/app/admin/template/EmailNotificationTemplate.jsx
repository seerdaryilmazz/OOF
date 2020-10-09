import React from 'react';
import { DropDown, TextInput, Button, Notify } from 'susam-components/basic';
import { FileInput } from 'susam-components/advanced';
import { Grid, GridCell } from 'susam-components/layout';
import { RichTextEditor } from '../../common/RichTextEditor';
import { NotificationService } from '../../service/NotificationService';
import { TemplateComponent } from './TemplateComponent';

let fileReader;
export class EmailNotificationTemplate extends TemplateComponent {
    state = {
        templateTypes: []
    };

    constructor(props) {
        super(props);
        NotificationService.lookup('template-type').then(response => {
            this.setState({ templateTypes: response.data });
        }).catch(error=>Notify.showError(error));
    }

    handleReadTemplate(files) {
        let file = _.first(files);
        fileReader = new FileReader();
        fileReader.onloadend = () => this.handleChange({ freemarkerContent: { fileContent: fileReader.result, filename: file.name } });
        fileReader.readAsText(file);
    }

    downloadTxtFile = () => {
        let freemarkerContent = _.get(this.state.template, 'freemarkerContent')
        if (freemarkerContent) {
            const element = document.createElement("a");
            const file = new Blob([freemarkerContent.fileContent], { type: "text/plain;charset=utf-8" });
            element.href = URL.createObjectURL(file);
            element.download = freemarkerContent.filename;
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
            document.body.removeChild(element);
        } else {
            Notify.showError('No downloadable content');
        }
    }

    renderEditor() {
        if ('EDITOR' === _.get(this.state.template, 'templateType.code')) {
            return <RichTextEditor label="Body"
                required={true}
                value={this.state.template.content}
                onChange={value => this.handleChange({ content: value })} />
        }
    }

    renderTemplateUpload() {
        if ('FREEMARKER_TEMPLATE' === _.get(this.state.template, 'templateType.code')) {
            if (_.get(this.state.template, 'freemarkerContent')) {
                return (
                    <div className="md-input-wrapper md-input-filled" >
                        <label>Template</label>
                        <Grid collapse={true}>
                            <GridCell width="2-3" noMargin={true}>
                                <Button flat={true} onclick={this.downloadTxtFile} label={_.get(this.state.template, 'freemarkerContent.filename')} />
                            </GridCell>
                            <GridCell width="1-3" noMargin={true}>
                                <Button flat={true} label="delete" style="danger" onclick={this.downloadTxtFile} onclick={() => this.handleChange({ freemarkerContent: null })} />
                            </GridCell>
                        </Grid>
                    </div>
                );
            } else {
                return <FileInput required={true} accept={['.ftl']} onchange={files => this.handleReadTemplate(files)} />;
            }
        }
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <TextInput label="Subject"
                        required={true}
                        onchange={value => this.handleChange({ subject: value })}
                        value={this.state.template.subject} />
                </GridCell>
                <GridCell>
                    <DropDown options={this.state.templateTypes}
                        label="Template Type"
                        required={true}
                        value={this.state.template.templateType}
                        onchange={value => this.handleChange({ templateType: value })} />
                </GridCell>
                <GridCell width="1-1">
                    {this.renderEditor()}
                    {this.renderTemplateUpload()}
                </GridCell>
                <GridCell width="1-1">
                    <TextInput label="URL"
                        onchange={value => this.handleChange({ url: value })}
                        value={this.state.template.url} />
                </GridCell>
                {this.renderButtons()}
            </Grid>
        );
    }
}