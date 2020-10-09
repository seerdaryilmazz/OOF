import React from "react";
import ReactDOM from "react-dom";
import {TranslatingComponent} from 'susam-components/abstract';
import PropTypes from "prop-types";
import {Grid, GridCell} from 'susam-components/layout';
import 'draft-js-static-toolbar-plugin/lib/plugin.css';
import Editor from 'draft-js-plugins-editor';
import {EditorState, ContentState, convertFromHTML} from 'draft-js'
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

export class TextEditor extends TranslatingComponent{

    constructor(props) {
        super(props);
        this.state = {editorState: EditorState.createEmpty()};
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

    componentDidMount(){
        let editorState;
        if(this.props.value) {
            if(this.props.asHtml){
                const blocksFromHTML = convertFromHTML(this.props.value);
                if (blocksFromHTML.contentBlocks) {
                    const contentState = ContentState.createFromBlockArray(
                        blocksFromHTML.contentBlocks,
                        blocksFromHTML.entityMap,
                    );
                    editorState = EditorState.createWithContent(contentState);
                }
            }else if(this.props.asText){
                editorState = EditorState.createWithContent(ContentState.createFromText(this.props.value));
            }else{

            }
        }
        if(!editorState){
            editorState = EditorState.createEmpty();
        }
        this.setState({editorState: editorState}, ()=>this.editor.focus());
    }

    handleChange(data){
        this.setState({editorState: data}, () => this.adjustOutputContent());
    }

    adjustOutputContent(){
        let output = null;
        if(this.state.editorState.getCurrentContent().hasText() && this.props.asHtml){
            let draftDom = ReactDOM.findDOMNode(this.editor);
            output = draftDom.querySelector("div[data-contents]").innerHTML;
        }
        this.props.onChange(output);
    }

    renderToolBar(){
        if(!this.props.readOnly) {
            const {Toolbar} = this.toolbarPlugin;
            return (
                <div>
                    <Toolbar/>
                </div>
            );
        }
    }

    render(){
        const plugins = [this.toolbarPlugin];

        var label = "";
        if(this.props.label){
            label = super.translate(this.props.label);
        }

        var requiredForLabel = "";
        if(this.props.required && label){
            requiredForLabel = <span className="req">*</span>;
        }

        var wrapperClassName = "md-input-wrapper md-input-filled";
        var minHeight = "100px";
        if(this.props.minHeight){
            minHeight = this.props.minHeight;
        }
        return (
            <div className="uk-form-row parsley-row">
                <div className={wrapperClassName} >
                    <label>{label}{requiredForLabel}</label>
                    <Grid>
                        <GridCell width="1-2">
                            {this.renderToolBar()}
                        </GridCell>
                        <GridCell width="1-1">
                            <div style={{minHeight: minHeight}}>
                                <Editor editorState={this.state.editorState}
                                        plugins={plugins}
                                        ref = {c => this.editor = c}
                                        readOnly={this.props.readOnly}
                                        onChange={(data) => this.handleChange(data)} />
                            </div>
                        </GridCell>
                    </Grid>
                </div>
            </div>
        );
    }
}
TextEditor.contextTypes = {
    translator: PropTypes.object
};
