import React from "react";
import ReactDOM from "react-dom";
import { TranslatingComponent } from 'susam-components/abstract';
import PropTypes from "prop-types";
import { Grid, GridCell } from 'susam-components/layout';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import 'draft-js-static-toolbar-plugin/lib/plugin.css';
import Editor from 'draft-js-plugins-editor';
import { EditorState, ContentState, convertFromHTML } from 'draft-js'
import createToolbarPlugin, { Separator } from 'draft-js-static-toolbar-plugin';

import {
    ItalicButton,
    BoldButton,
    UnderlineButton,
    CodeButton,
    HeadlineOneButton,
    HeadlineTwoButton,
    HeadlineThreeButton,
    UnorderedListButton,
    OrderedListButton,
    BlockquoteButton,
    CodeBlockButton,
} from 'draft-js-buttons';

function transform(node, index) {
    if (node.type === 'tag' && (node.name === 'html' || node.name === 'head' || node.name === 'body')) {
        node.name = 'div'
        return convertNodeToElement(node, index, transform);
    }
    if (node.type === 'tag' && node.name === 'meta') {
        return null;
    }
}

export class TextEditor extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = { editorState: EditorState.createEmpty() };
        this.toolbarPlugin = createToolbarPlugin({
            structure: [
                BoldButton,
                ItalicButton,
                UnderlineButton,
                CodeButton,
                Separator,
                UnorderedListButton,
                OrderedListButton,
                BlockquoteButton,
                CodeBlockButton,
                Separator,
                HeadlineOneButton,
                HeadlineTwoButton,
                HeadlineThreeButton,
            ]
        });
    }

    componentDidMount() {
        if(this.editor){
            let editorState;
            if (this.props.value) {
                if (this.props.asHtml) {
                    const blocksFromHTML = convertFromHTML(this.props.value);
                    if (blocksFromHTML.contentBlocks) {
                        const contentState = ContentState.createFromBlockArray(
                            blocksFromHTML.contentBlocks,
                            blocksFromHTML.entityMap,
                        );
                        editorState = EditorState.createWithContent(contentState);
                    }
                } else if (this.props.asText) {
                    editorState = EditorState.createWithContent(ContentState.createFromText(this.props.value));
                }
            }
            if (!editorState) {
                editorState = EditorState.createEmpty();
            }
            this.setState({ editorState: editorState }, () => this.editor.focus());
            $(ReactDOM.findDOMNode(this.editor).querySelector(".public-DraftEditor-content")).css("min-height", this.props.minHeight || "100px");
        }
    }

    handleChange(data) {
        this.setState({ editorState: data }, () => this.adjustOutputContent());
    }

    adjustOutputContent() {
        let output = null;
        let hasContent = this.state.editorState.getCurrentContent().getBlockMap().map(i=> i ? i.getText() : '').join("");
        if (hasContent && this.props.asHtml) {
            let draftDom = ReactDOM.findDOMNode(this.editor);
            output = draftDom.querySelector("div[data-contents]").innerHTML;
        }
        this.props.onChange(output);
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
        return (
             <Grid>
                <GridCell width="1-1">
                    {output}
                </GridCell>
             </Grid>
        )
    }

    renderStandard() {
        const { Toolbar } = this.toolbarPlugin;
        var minHeight = "100px";
        if (this.props.minHeight) {
            minHeight = this.props.minHeight;
        }

        return (
            <Grid>
                <GridCell width="1-2">
                    <Toolbar />
                </GridCell>
                <GridCell width="1-1">
                    <div style={{ minHeight: minHeight, border: "1px #00000016", borderRightStyle: "solid", borderBottomStyle: "solid", borderRadius: "5px" }}>
                        <Editor editorState={this.state.editorState}
                            plugins={[this.toolbarPlugin]}
                            ref={c => this.editor = c}
                            readOnly={this.props.readOnly}
                            onChange={(data) => this.handleChange(data)} />
                    </div>
                </GridCell>
            </Grid>
        );
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

        var wrapperClassName = "md-input-wrapper md-input-filled";
        return (
            <div className="uk-form-row parsley-row">
                <div className={wrapperClassName} >
                    <label>{label}{requiredForLabel}</label>
                    {this.props.readOnly ? this.renderReadOnly() : this.renderStandard()}
                </div>
            </div>
        );
    }
}
TextEditor.contextTypes = {
    translator: PropTypes.object
};
