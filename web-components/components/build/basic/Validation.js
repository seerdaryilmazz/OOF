"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Validation = function () {
    function Validation(formId) {
        _classCallCheck(this, Validation);

        this.formId = formId;
        this.customErrors = {};
    }

    _createClass(Validation, [{
        key: "validate",
        value: function validate() {
            return this.parsley.validate();
        }
    }, {
        key: "validateGroup",
        value: function validateGroup(groupName) {
            var result = true;
            $("[data-parsley-group='" + groupName + "']").each(function (index) {
                $(this).parsley().validate();
                result = result && $(this).parsley().isValid();
            });
            return result;
        }
    }, {
        key: "isValid",
        value: function isValid() {
            return this.parsley.isValid();
        }
    }, {
        key: "destroy",
        value: function destroy() {
            this.parsley && this.parsley.destroy();
        }
    }, {
        key: "mount",
        value: function mount() {
            var _this = this;

            this.$form = $('#' + this.formId);
            this.parsleyConfig = {
                excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], input.exclude_validation',
                errorsWrapper: '<div class="parsley-errors-list"></div>',
                errorTemplate: '<span></span>',
                errorClass: 'md-input-danger',
                successClass: 'md-input-success',
                errorsContainer: function errorsContainer(ParsleyField) {
                    var element = ParsleyField.$element;
                    return element.closest('.parsley-row');
                },
                classHandler: function classHandler(ParsleyField) {
                    var element = ParsleyField.$element;
                    if (element.is(':checkbox') || element.is(':radio') || element.parent().is('label') || $(element).is('[data-md-selectize]')) {
                        return element.closest('.parsley-row');
                    }
                }
            };

            this.parsley = this.$form.parsley(this.parsleyConfig);

            this.parsley.on('form:validated', function () {
                _this.updateInputValidationStatus(_this.$form.find('.md-input-danger'));
            }).on('field:validated', function (field) {
                if ($(field.$element).hasClass('md-input')) {
                    _this.updateInputValidationStatus($(field.$element));
                }
            });
        }
    }, {
        key: "updateInputValidationStatus",
        value: function updateInputValidationStatus($element) {
            $element.closest('.uk-input-group').removeClass('uk-input-group-danger uk-input-group-success');
            $element.closest('.md-input-wrapper').removeClass('md-input-wrapper-danger md-input-wrapper-success md-input-wrapper-disabled');
            if ($element.hasClass('md-input-danger')) {
                if ($element.closest('.uk-input-group').length) {
                    $element.closest('.uk-input-group').addClass('uk-input-group-danger');
                }
                $element.closest('.md-input-wrapper').addClass('md-input-wrapper-danger');
            }
            if ($element.hasClass('md-input-success')) {
                if ($element.closest('.uk-input-group').length) {
                    $element.closest('.uk-input-group').addClass('uk-input-group-success');
                }
                $element.closest('.md-input-wrapper').addClass('md-input-wrapper-success');
            }
        }
    }, {
        key: "reset",
        value: function reset() {
            this.$form.parsley().reset();
        }
    }, {
        key: "cleanPreviousCustomValidationErrors",
        value: function cleanPreviousCustomValidationErrors(input) {
            if (!input) {
                return;
            }
            var id = $(input).attr("id");
            var $parsley = $(input).parsley();
            if (this.customErrors[id] && this.customErrors[id].length > 0) {
                this.customErrors[id].forEach(function (each) {
                    window.ParsleyUI.removeError($parsley, each.code);
                });
            }
            this.customErrors[id] = [];
        }
    }, {
        key: "addCustomValidationErrors",
        value: function addCustomValidationErrors(input, errors) {
            var _this2 = this;

            if (!input) {
                return;
            }
            var id = $(input).attr("id");
            this.cleanPreviousCustomValidationErrors(input);
            var $parsley = $(input).parsley();
            if (errors && errors.length > 0) {
                errors.forEach(function (each) {
                    _this2.customErrors[id].push(each);
                    window.ParsleyUI.removeError($parsley, each.code);
                    window.ParsleyUI.addError($parsley, each.code, each.message);
                });
            }
        }
    }]);

    return Validation;
}();

exports.default = Validation;