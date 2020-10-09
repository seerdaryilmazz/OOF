import { ContentState, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import React from 'react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import { TranslatingComponent } from 'susam-components/abstract';

function transform(node, index) {
    if (node.type === 'tag' && (node.name === 'html' || node.name === 'head' || node.name === 'body')) {
        node.name = 'div'
        return convertNodeToElement(node, index, transform);
    }
    if (node.type === 'tag' && node.name === 'meta') {
        return null;
    }
}

export class RichTextEditor extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.init();
    }

    componentDidMount() {
        $(".rdw-editor-toolbar").css("width", "fit-content");
        $(".rdw-editor-main").css("min-height", "200px");
    }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
        }, () => this.handleChange());
    };

    init() {
        if (this.props.value) {
            const contentBlock = htmlToDraft(this.props.value);
            if (contentBlock) {
                const editorState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                this.state = { editorState: EditorState.createWithContent(editorState) }
            }
        } else {
            this.state = { editorState: EditorState.createEmpty() };
        }
    }

    handleChange() {
        if (this.props.onChange) {
            const content = this.state.editorState.getCurrentContent();
            let html = null;
            if(content.hasText()){
                html = draftToHtml(convertToRaw(content));
            }
            this.props.onChange(html);
        }
    }

     renderReadOnly() {
        let output = this.props.value;
        if (this.props.asHtml && this.props.value) {
            const options = {
                decodeEntities: true,
                transform
            };
            output = ReactHtmlParser(this.props.value, options);
        }
        return output;
    }

    renderStandard(){   
        return <Editor editorState={this.state.editorState}
                       handlePastedText={() => false}
                       onEditorStateChange={this.onEditorStateChange} />
    }

    render() {
        var label = "";
        if (this.props.label) {
            label = super.translate(this.props.label);
        }

        var requiredForLabel = "";
        if (this.props.required && label) {
            requiredForLabel = <span className="req">*</span>;
        }

        return (
            <div className="uk-form-row parsley-row">
                <div className="md-input-wrapper md-input-filled" >
                    <label>{label}{requiredForLabel}</label>
                </div>
                <div style={{ border: "1px #00000016", borderRightStyle: "solid", borderBottomStyle: "solid", borderRadius: "5px" }}>
                    {this.props.readOnly ? this.renderReadOnly() : this.renderStandard()}
                </div>
            </div>
        );
    }
}

RichTextEditor.contextTypes = {
    translator: React.PropTypes.object
};
