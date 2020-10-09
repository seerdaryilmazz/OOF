import React from 'react';
import {TranslatingComponent} from '../abstract';
import {Button} from '../basic';

export class Wizard extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {step: 1, innerView: false};
        this.state.totalSteps = this.props.steps.length;
    };


    componentDidMount(){

    };
    isLastStep(){
        return this.state.step == this.state.totalSteps;
    }
    isFirstStep(){
        return this.state.step == 1;
    }
    handleNextClick(){
        let step = this.props.steps[this.state.step - 1];
        if(!step.onNextClick){
            this.toNextStep();
        }
        Promise.resolve(step.onNextClick()).then((value) => {
            if(value){
                this.toNextStep();
            }
        }).catch(error => {
            console.log(error);
        });

    }
    toNextStep(){
        let nextStep = this.state.step + 1;
        if(nextStep <= this.state.totalSteps){
            this.setState({step: nextStep});
        }
    }
    handlePrevClick(){
        this.props.steps[this.state.step - 1].onPrevClick && this.props.steps[this.state.step - 1].onPrevClick();
        let prevStep = this.state.step - 1;
        if(prevStep > 0){
            this.setState({step: prevStep});
        }
    }


    render(){
        let nextStepClassName = "button_next";
        let prevStepClassName = "button_previous";
        if(this.isLastStep()){
            nextStepClassName = nextStepClassName + (this.props.hideNextButton ? " uk-hidden":" disabled");
           
        }
        if(this.isFirstStep()) {
            prevStepClassName = prevStepClassName + (this.props.hidePrevButton ? " uk-hidden":" disabled");  
        }
        let nextButtonLabel = "Next";
        let prevButtonLabel = "Previous";
        let nextButtonStyle = "";
        let textColorNext= "";

        if(!this.isLastStep()){
            textColorNext =this.props.textColorNext;
        }

        let nextButtonIcon = "arrow-circle-right";
        let prevButtonIcon = "arrow-circle-left";
        
        let disablePrevButton = false;
        let disableNextButton = false;
        if(this.props.steps[this.state.step - 1].nextButtonLabel){
            nextButtonLabel = this.props.steps[this.state.step - 1].nextButtonLabel;
            nextButtonStyle = this.props.steps[this.state.step - 1].nextButtonStyle;          
        }else if(this.isLastStep()){
            disableNextButton = true;
        }
        if(this.props.steps[this.state.step - 1].prevButtonLabel){
            prevButtonLabel = this.props.steps[this.state.step - 1].prevButtonLabel;
        }else if(this.isFirstStep()){
            disablePrevButton = true;
        }
              
        let nextButton = this.props.useIcon ? 
                            <Button icon={nextButtonIcon} flat = {true} waves = {true} size="large" style={this.props.nextButtonStyle}
                                 onclick = {(() => this.handleNextClick())} disabled = {disableNextButton}
                                 disableCooldown = {true} iconColorClass={this.props.nextButtonIconColorClass}/>:
                            <Button label={nextButtonLabel} flat = {false} waves = {true} style={nextButtonStyle} textColor={textColorNext}
                                 onclick = {(() => this.handleNextClick())} disabled = {disableNextButton}
                                 disableCooldown = {true}/>;
        let prevButton = this.props.useIcon ? 
                            <Button icon={prevButtonIcon} flat = {true} waves = {true} size="large" style={this.props.prevButtonStyle}
                                 onclick = {(() => this.handlePrevClick())} disabled = {disablePrevButton}
                                 disableCooldown = {true} iconColorClass={this.props.prevButtonIconColorClass}/>:
                            <Button label={prevButtonLabel} flat = {false} waves = {true} style={this.props.prevButtonStyle}
                                 onclick = {(() => this.handlePrevClick())} disabled = {disablePrevButton} textColor={this.props.textColorPrev}
                                 disableCooldown = {true}/>;

        return (
            <div className="wizard clearfix">
                <div className="steps clearfix">
                    <ul role="tablist">
                        {
                            this.props.steps.map((item, index) => {
                                let width = 0;
                                let titleClassName = "";
                                if(index == 0){
                                    titleClassName = "first";
                                }
                                if(index == this.state.totalSteps -1){
                                    titleClassName = "last";
                                    width = 100 - ( Number.parseInt(100 / this.state.totalSteps) * (this.state.totalSteps-1) )
                                }else{
                                    width = Number.parseInt(100 / this.state.totalSteps);
                                }
                                if(index == this.state.step -1){
                                    titleClassName = titleClassName + " current";
                                }else{
                                    titleClassName = titleClassName + " disabled";
                                }
                              return (
                                  <li key = {item.title} role="tab" className={titleClassName} style = {{width: width + "%"}}>
                                      <a>
                                          <span className="number">{index+1}</span> <span className="title">{item.title}</span>
                                      </a>
                                  </li>
                              );
                            })
                        }
                    </ul>
                </div>
                {React.cloneElement(this.props.children[this.state.step-1], {onRenderInnerView: innerView=>this.setState({innerView:innerView})})}
                { !this.state.innerView &&
                    <div className="actions clearfix" style={{backgroundColor:`${this.props.backgroundColor}`}}>
                    <ul role="menu" >
                        <li className={prevStepClassName} >
                            {prevButton}
                        </li>
                        <li className={nextStepClassName} >
                            {nextButton}
                        </li>
                    </ul>
                </div>
                }
            </div>
        );
    }
}