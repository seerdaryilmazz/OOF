import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
var styles = {
    active: {
        className: 'timeline_icon_primary',
        icon: 'arrow_forward'
    },
    inactive: {
        className: '',
        icon: 'add'
    },
    success: {
        className: 'timeline_icon_success',
        icon: 'done'
    },
    error: {
        className: 'timeline_icon_danger',
        icon: 'clear'
    },
    last: {
        className: 'timeline_icon_warning',
        icon: 'grade'
    },

}
export class Stepper extends TranslatingComponent {

    state = {
        lastIndex: 0
    };

    componentDidMount() {
        $.fn.attachDragger = function () {
            var attachment = false, lastPosition, position, difference;
            $($(this).selector).on("mousedown mouseup mousemove", function (e) {
                if (e.type == "mousedown") attachment = true, lastPosition = [e.clientX, e.clientY];
                if (e.type == "mouseup") attachment = false;
                if (e.type == "mousemove" && attachment == true) {
                    position = [e.clientX, e.clientY];
                    difference = [(position[0] - lastPosition[0]), (position[1] - lastPosition[1])];
                    $(this).scrollTop($(this).scrollTop() - difference[1]);
                    lastPosition = [e.clientX, e.clientY];
                }
            });
            $(window).on("mouseup", function () {
                attachment = false;
            });
        }
        $(document).ready(function () {
            $(".timeline").attachDragger();
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if(!_.isEqual(prevProps.steps, this.props.steps) || this.state.lastIndex < this.props.activeIndex){
            this.setState({lastIndex: this.props.activeIndex})
        }
        if (prevProps.activeIndex !== this.props.activeIndex) {
            this.props.onActiveIndexChange && this.props.onActiveIndexChange(this.count(), this.props.activeIndex);
            var elem = $('.timeline_icon_primary').get(0);
            if (elem) {
                elem.parentElement.scrollIntoView({block: 'center', inline: 'center'});
                $('.timeline').scrollLeft(0);
            }
        }
    }

    validate(item) {
        let result = {
            valid: true,
            messages: []
        };
        let value = _.get(this.props.order, item.id);
        let validationResult = item.validate ? item.validate(value) : null;
        if (validationResult != null && validationResult.hasError()) {
            result.valid = false;
            result.messages = validationResult.messages;
        }
        return result;
    }

    count(){
       let count = {
            success: $('.timeline_icon_success').length,
            total: $('.timeline_icon').length
        }
        count.rate = Math.round(10000 * (count.success / count.total))/100;
        return count;
    }

    handleClick(event, index) {
        if(this.state.lastIndex < index) 
            return;
            
        this.props.onStepClick(index)
    }

    renderStep(item, index) {
        let messages = []
        let status = styles['inactive'];
        if (this.props.activeIndex === index) {
            status = styles['active']
        } else if(this.state.lastIndex === index){
            status = styles['last']
        }else if (this.state.lastIndex > index) {
            let result = this.validate(item);
            status = result.valid ? styles['success'] : styles['error'];
            messages = result.messages;
        }

        let title = super.translate(item.title);
        if (!_.isEmpty(messages)) {
            title = title + "<br /><br />";
            messages.forEach(m => {
                title = title+ "* " + super.translate(m) + "<br />";
            })
        }

        return (
            <div key={item.id} className="timeline_item" draggable={false}>
                <div className={`timeline_icon ${status.className}`} data-uk-tooltip="{pos:'right', cls: 'long-text'}" title={title} draggable={false}>
                    <a href='javascript:;' onClick={(e) => this.handleClick(e, index)} draggable={false}>
                        <i className="material-icons" draggable={false}>{status.icon}</i>
                    </a>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="timeline timeline-small noscroll unselectable" style={{ height: `${window.innerHeight - 168}px`, overflowY: 'scroll', cursor:'ns-resize' }}>
                {this.props.steps && this.props.steps.map((item, i) => this.renderStep(item, i))}
            </div>);
    }
}

Stepper.contextTypes = {
    translator: PropTypes.object
};