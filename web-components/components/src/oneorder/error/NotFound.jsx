import React from "react";
import {TranslatingComponent} from "../../abstract/";

export class NotFound extends TranslatingComponent{
    render(){
        return (
            <div className="error_page">
                <div className="error_page_header md-bg-amber-700">
                    <div className="uk-width-8-10 uk-container-center">
                        404!
                    </div>
                </div>
                <div className="error_page_content">
                    <div className="uk-width-8-10 uk-container-center">
                        <p className="heading_b">Page not found</p>
                        <p className="uk-text-large">
                            The requested URL <span className="uk-text-muted">{this.props.location.pathname}</span> was not found on this server.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

}