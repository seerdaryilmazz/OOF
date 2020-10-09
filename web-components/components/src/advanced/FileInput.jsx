import React from "react";
import {TranslatingComponent} from "../abstract/";
import PropTypes from "prop-types";

export class FileInput extends TranslatingComponent {

    constructor(props) {
        super(props);
    };

    componentDidMount() {
        $('.dropify').dropify({
                messages: {
                    'default': super.translate('Drag and drop a file here or click'),
                    'replace': super.translate('Drag and drop or click to replace'),
                    'remove': super.translate('Remove'),
                    'error': super.translate('Ooops, something wrong happened.')
                }
            }
        );

        $(this._input).change(()=> {
            if (this.props.onchange) {
                this.props.onchange(this._input.files);
            }
        });
    }

    clearSelectedFile() {
        $('.dropify-clear').click();
    }

    render() {
        return (
            <div style={{width: "96%"}}>
                <input id = {this.props.id} ref={(c) => this._input = c}
                       value={this.props.value}
                       required={this.props.required}
                       accept={this.props.accept}
                       data-parsley-group={this.props.validationGroup}
                       data-parsley-required-message = {super.translate("This value is required.")}
                       data-default-file = {this.props.value ? this.props.value.name : ""}
                       type="file" className="dropify"/>
            </div>
        );
    };
}

FileInput.contextTypes = {
    translator: PropTypes.object
};