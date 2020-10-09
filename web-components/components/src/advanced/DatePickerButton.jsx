import React from 'react';
import { Date } from './Date';

export class DatePickerButton extends Date {

    getDatepickerSettings() {
        let settings = {
            format: this.getFormat(),
            i18n: this.i18n[this.context.translator.locale],
            addClass: 'dropdown-modal'
        };
        return JSON.stringify(settings);
    }

    render() {
        return (
            <a href="javascript:;" ref={c=>this.calendar = c} id={this.state.id} className={`uk-position-relative md-btn-icon md-btn-flat md-btn-${this.props.size}`} style={{ overflow: "hidden" }}>
                <i className={`uk-input-group-icon uk-icon-calendar md-color-${this.props.color}`} />
                <input ref={(c) => this._input = c}
                    className="unselectable uk-position-absolute"
                    style={{ color: "transparent", border: "none", background: "none", width: "100%", height: "100%", right: "-2px", bottom: "-2px", cursor: "pointer" }}
                    type="text" readOnly={true}
                    onChange={(e) => this.handleOnChangeInternal(e)}
                    data-uk-datepicker={this.getDatepickerSettings()} />
            </a>
        );
    }
}


DatePickerButton.contextTypes = {
    translator: React.PropTypes.object,
};