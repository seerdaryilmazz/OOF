import React from "react";

export class DisplayMode extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let textAlign = this.props.displayMode == "E" ? "center" : (this.props.displayMode == "L" ? "left" : "right");
        let buttons = [];

        if (this.props.displayMode == "E" || this.props.displayMode == "R") {
            buttons.push(
                <a key="btnLeft"
                   href="javascript:void(0);"
                   className="uk-icon-button uk-icon-arrow-circle-o-left"
                   onClick={() => this.props.onDisplayModeChange("L")}/>
            );
        }

        if (this.props.displayMode == "E" || this.props.displayMode == "L") {
            buttons.push(
                <a key="btnRight"
                   href="javascript:void(0);"
                   className="uk-icon-button uk-icon-arrow-circle-o-right"
                   onClick={() => this.props.onDisplayModeChange("R")}/>
            );
        }

        return (
            <div style={{textAlign: textAlign}}>
                {buttons}
            </div>
        );
    }
}
