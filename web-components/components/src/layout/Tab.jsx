import PropTypes from 'prop-types';
import React from 'react';
import uuid from 'uuid';
import { TranslatingComponent } from '../abstract';

var onTabChange = null
export class Tab extends TranslatingComponent {
    static defaultProps = {
        swiping: false,
        animation: 'fade',
        align: 'vertical',
        translate: false
    };

    constructor(props) {
        super(props);
        this.state = { id: props.id || uuid.v4() };
        onTabChange = (e, active, previous) => props.onTabChange && props.onTabChange(e, active, previous);
    }

    componentDidMount() {
        this.refresh();
        $('[data-uk-tab]', `#${this.state.id}`).on('change.uk.tab', onTabChange);
    }

    componentDidUpdate() {
        this.refresh();
    }
    refresh() {
        UIkit.domObserve(`#${this.state.id}`, function (element) { });
    }

    translate(str){
        return this.props.translate ? super.translate(str) : str ;
    }

    render() {
        let { children, labels, active, align, animation, swiping } = this.props;

        let labelUlClassNames = ["uk-tab"];
        if (align == "horizontal") {
            labelUlClassNames.push("uk-tab-left");
        }

        let connectParam = this.state.id + "-connect";
        let paramDataUkTab = { connect: `#${connectParam}`, animation: animation, swiping: swiping };

        var tabs =
            <ul className={labelUlClassNames.join(" ")} data-uk-tab={JSON.stringify(paramDataUkTab)}>
                {labels.map((label, index) => {
                    let classNames = [];
                    if (active && this.translate(active) == this.translate(label) || 0 == index ) {
                        classNames.push("uk-active");
                    }
                    return <li key={index} className={classNames.join(" ")}><a href="javascript:;">{this.translate(label)}</a></li>;
                })}
            </ul>;

        var contents =
            <ul id={connectParam} className="uk-switcher uk-margin">
                {React.Children.map(children, (child, index) => <li key={index}>{child}</li>)}
            </ul>;

        let tabComponent = align == "horizontal"
            ? <div className="uk-width-1-1"><div className="uk-grid">{tabs}{contents}</div></div>
            : <div>{tabs}{contents}</div>;

        return <div id={this.state.id} data-uk-observe>{tabComponent}</div>
    }
}

Tab.contextTypes = {
    translator: PropTypes.object
}