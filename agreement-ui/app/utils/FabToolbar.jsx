import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import {withAuthorization} from '../utils';
import PropTypes from "prop-types";

export class FabToolbar extends TranslatingComponent{
    constructor(props){
        super(props);
    }
    componentDidMount(){
        let $fab_toolbar = $('.md-fab-toolbar');

        if($fab_toolbar) {
            $fab_toolbar
                .children('i')
                .on('click', function(e) {
                    e.preventDefault();
                    let toolbarItems = $fab_toolbar.children('.md-fab-toolbar-actions').children().length;

                    $fab_toolbar.addClass('md-fab-animated');

                    let FAB_padding = !$fab_toolbar.hasClass('md-fab-small') ? 16 : 24,
                        FAB_size = !$fab_toolbar.hasClass('md-fab-small') ? 64 : 44;

                    setTimeout(function() {
                        $fab_toolbar
                            .width((toolbarItems*FAB_size + FAB_padding))
                    },140);

                    setTimeout(function() {
                        $fab_toolbar.addClass('md-fab-active');
                    },420);

                });

            $(document).on('click scroll', function(e) {
                if( $fab_toolbar.hasClass('md-fab-active') ) {
                    if (!$(e.target).closest($fab_toolbar).length) {

                        $fab_toolbar
                            .css('width','')
                            .removeClass('md-fab-active');

                        setTimeout(function() {
                            $fab_toolbar.removeClass('md-fab-animated');
                        },140);
                    }
                }
            });
        }
    }

    render(){
        return (
            <div className="md-fab-wrapper">
                <div className="md-fab md-fab-toolbar md-fab-small md-fab-accent">
                    <i className="material-icons">&#xE8BE;</i>
                    <div className="md-fab-toolbar-actions">
                        {this.props.actions.map(item => {
                            if(item.operationName){
                                let SecuredFabButton = withAuthorization(FabButton, item.operationName, {hideWhenNotAuthorized: true});
                                return <SecuredFabButton key = {item.name} name={item.name} title={super.translate(item.name)} onclick = {(e) => item.onAction(e)} icon={item.icon}/>
                            }else{
                                return <FabButton key = {item.name} name={item.name} title={super.translate(item.name)} onclick = {(e) => item.onAction(e)} icon={item.icon}/>
                            }

                        })}
                    </div>
                </div>
            </div>
        );
    }
}
FabToolbar.contextTypes = {
    translator: PropTypes.object
};

class FabButton extends React.Component{
    render(){
        return (
            <button key = {this.props.name} type="submit" data-uk-tooltip="{cls:'uk-tooltip-small',pos:'bottom'}" title={this.props.title} onClick = {(e) => this.props.onclick(e)}>
                <i className="material-icons md-color-white">{this.props.icon}</i>
            </button>
        );
    }
}