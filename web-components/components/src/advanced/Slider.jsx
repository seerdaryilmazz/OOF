import React from 'react';
import uuid from 'uuid';

export class Slider extends React.Component{
    constructor(props){
        super(props);
        if(props.id){
            this.state = {id:props.id};
        }else{
            this.state = {id:uuid.v4()};
        }
    }

    loadSlider(){
        let config = {
            min: this.props.min ? this.props.min : 1,
            max: this.props.max ? this.props.max : 20,
            from: this.props.from ? this.props.from : 1,
            to: this.props.to ? this.props.to : 1,
            grid: this.props.grid ? this.props.grid : false,
            onFinish: (data) => {
                this.handleMove(data);
            }
        };
        $(this._input).ionRangeSlider(config);
        this.slider = $(this._input).data("ionRangeSlider");
    }
    unloadSlider(){
        this.slider.destroy();
    }
    componentDidMount(){
        this.loadSlider();
    }
    componentDidUpdate(){
        this.slider.update({
            from: this.props.from ? this.props.from : 1,
            to: this.props.to ? this.props.to : 1
        });
    }
    componentWillUnmount(){
        this.unloadSlider();
    }

    handleMove(data) {
        this.props.onchange && this.props.onchange(data.from);
    }

    render(){
        var wrapperClassName = "md-input-wrapper md-input-filled";
        var inputClassName = "ion-slider";

        var label = this.props.label;
        if(this.props.hideLabel){
            label = "";
        }

        var requiredForLabel = "";
        if(this.props.required && label){
            requiredForLabel = <span className="req">*</span>;
        }

        return(
            <div className={wrapperClassName} >
                <label>{label}{requiredForLabel}</label>
                <input ref={(c) => this._input = c}
                       id={this.state.id}
                       type="text" className={inputClassName}/>
            </div>
        );
    };
}