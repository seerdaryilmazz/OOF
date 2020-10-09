export default class Validation{

    constructor(formId){
        this.formId = formId;
        this.customErrors = {};
    }

    validate(){
        return this.parsley.validate();
    }
    validateGroup(groupName){
        let result = true;
        $("[data-parsley-group='" + groupName + "']").each(function(index){
            $(this).parsley().validate();
            result = result && $(this).parsley().isValid();
        });
        return result;
    }
    isValid(){
        return this.parsley.isValid();
    }

    destroy(){
        this.parsley && this.parsley.destroy();
    }
    
    mount(){
        this.$form = $('#' + this.formId);
        this.parsleyConfig = {
            excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], input.exclude_validation',
            errorsWrapper: '<div class="parsley-errors-list"></div>',
            errorTemplate: '<span></span>',
            errorClass: 'md-input-danger',
            successClass: 'md-input-success',
            errorsContainer: function (ParsleyField) {
                var element = ParsleyField.$element;
                return element.closest('.parsley-row');
            },
            classHandler: function (ParsleyField) {
                var element = ParsleyField.$element;
                if( element.is(':checkbox') || element.is(':radio') || element.parent().is('label') || $(element).is('[data-md-selectize]') ) {
                    return element.closest('.parsley-row');
                }
            }
        };

        this.parsley = this.$form.parsley(this.parsleyConfig);

        this.parsley.on('form:validated', () => {
                this.updateInputValidationStatus(this.$form.find('.md-input-danger'));
        }).on('field:validated', (field) => {
            if($(field.$element).hasClass('md-input')) {
                this.updateInputValidationStatus($(field.$element));
            }

        });


    }
    updateInputValidationStatus($element){
        $element.closest('.uk-input-group').removeClass('uk-input-group-danger uk-input-group-success');
        $element.closest('.md-input-wrapper').removeClass('md-input-wrapper-danger md-input-wrapper-success md-input-wrapper-disabled');
        if($element.hasClass('md-input-danger')) {
            if($element.closest('.uk-input-group').length) {
                $element.closest('.uk-input-group').addClass('uk-input-group-danger')
            }
            $element.closest('.md-input-wrapper').addClass('md-input-wrapper-danger')
        }
        if($element.hasClass('md-input-success')) {
            if($element.closest('.uk-input-group').length) {
                $element.closest('.uk-input-group').addClass('uk-input-group-success')
            }
            $element.closest('.md-input-wrapper').addClass('md-input-wrapper-success')
        }
    }
    reset(){
        this.$form.parsley().reset();
    }
    cleanPreviousCustomValidationErrors(input){
        if(!input){
            return;
        }
        let id = $(input).attr("id");
        let $parsley = $(input).parsley();
        if(this.customErrors[id] && this.customErrors[id].length > 0){
            this.customErrors[id].forEach(each => {
                window.ParsleyUI.removeError($parsley, each.code);
            });
        }
        this.customErrors[id] = [];
    }
    addCustomValidationErrors(input, errors){
        if(!input){
            return;
        }
        let id = $(input).attr("id");
        this.cleanPreviousCustomValidationErrors(input);
        let $parsley = $(input).parsley();
        if(errors && errors.length > 0){
            errors.forEach(each => {
                this.customErrors[id].push(each);
                window.ParsleyUI.removeError($parsley, each.code);
                window.ParsleyUI.addError($parsley, each.code, each.message);
            });
        }
    }
}