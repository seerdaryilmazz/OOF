import React from 'react';
import { SketchPicker } from 'react-color';
import reactCSS from 'reactcss';

export class ColorPicker extends React.Component {
    static defaultProps = { color: "#fff" };
    state = {
        displayColorPicker: false,
    };

    componentDidMount() {
        if(_.isNil(this.props.color)){
            this.props.onchange && this.props.onchange(this.props.color);
        }
    }
    componentDidUpdate(prevProps){
        if(!_.isEqual(prevProps.color, this.props.color) && _.isNil(this.props.color)){
            this.props.onchange && this.props.onchange(this.props.color);
        }
    }

    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };

    handleChange = (color) => {
        this.props.onchange && this.props.onchange(color.hex)
    };

    render() {
        const styles = reactCSS({
            'default': {
                color: {
                    width: '64px',
                    height: '16px',
                    borderRadius: '2px',
                    background: `${this.props.color}`,
                },
                swatch: {
                    margin: '12px 0 0',
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
            },
        });

        var requiredForLabel = null
        if (this.props.required && this.props.label) {
            requiredForLabel = <span className="req">*</span>;
        }

        return (
            <div className="uk-form-row">
                <div className="md-input-wrapper md-input-filled" >
                    <label>{this.props.label}{requiredForLabel}</label>
                    <div style={styles.swatch} onClick={this.handleClick}>
                        <div style={styles.color} />
                    </div>
                    {this.state.displayColorPicker ?
                        <div style={styles.popover}>
                            <div style={styles.cover} onClick={this.handleClose} />
                            <SketchPicker color={this.props.color} onChange={this.handleChange} />
                        </div> : null}
                </div>
            </div>
        )
    }
}