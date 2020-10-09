import React from 'react';

export class TranslatingComponent extends React.Component{
    constructor(props){
        super(props);
    }
    translate(text, params, postTranslationCaseConverter){
        if(this.context.translator){
            return this.context.translator.translate(text, params, postTranslationCaseConverter);
        }
        return text;
    }
}
