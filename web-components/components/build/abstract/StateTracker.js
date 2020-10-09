"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StateTracker = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StateTracker = exports.StateTracker = function () {
    function StateTracker(component, propsToCheck, options, initialState, onStateChanged, onStateUnchanged) {
        var _this = this;

        _classCallCheck(this, StateTracker);

        this.defaultOptions = {
            ignoreUndefined: true,
            ignoreNull: true,
            ignoreNan: true,
            ignoreEmptyString: true,
            ignoreEmptyObject: true,
            ignoreBooleanFalse: false,
            ignoreBooleanTrue: false
        };

        this.component = component;
        this.propsToCheck = propsToCheck;
        this.options = _lodash2.default.merge(_lodash2.default.cloneDeep(this.defaultOptions), options);
        this.initialState = this.extractState(initialState);
        this.onStateChanged = onStateChanged;
        this.onStateUnchanged = onStateUnchanged;

        this.originalUpdateFunction = _lodash2.default.isFunction(this.component.componentWillUpdate) ? this.component.componentWillUpdate : null;
        this.component.componentWillUpdate = function (nextProps, nextState) {
            _this.trackStateChange(nextState);

            if (_this.originalUpdateFunction) {
                _this.originalUpdateFunction.call(_this.component, nextProps, nextState);
            }
        };

        this.lastEqual = true;
    }

    _createClass(StateTracker, [{
        key: "trackStateChange",
        value: function trackStateChange(nextState) {
            var eq = _lodash2.default.isEqual(this.initialState, this.extractState(nextState));

            if (eq && !this.lastEqual && this.onStateUnchanged) {
                this.onStateUnchanged();
            } else if (!eq && this.lastEqual && this.onStateChanged) {
                this.onStateChanged();
            }

            this.lastEqual = eq;
        }
    }, {
        key: "extractState",
        value: function extractState(state) {
            return this.clean(_lodash2.default.cloneDeep(_lodash2.default.pick(state, this.propsToCheck)));
        }
    }, {
        key: "clean",
        value: function clean(obj) {
            var _this2 = this;

            _lodash2.default.forOwn(obj, function (value, key) {
                if (_this2.options.ignoreUndefined && _lodash2.default.isUndefined(value) || _this2.options.ignoreNull && _lodash2.default.isNull(value) || _this2.options.ignoreNan && _lodash2.default.isNaN(value) || _this2.options.ignoreEmptyString && _lodash2.default.isString(value) && _lodash2.default.isEmpty(value) || _this2.options.ignoreEmptyObject && _lodash2.default.isObject(value) && _lodash2.default.isEmpty(_this2.clean(value)) || _this2.options.ignoreBooleanTrue && _lodash2.default.isBoolean(value) && value || _this2.options.ignoreBooleanFalse && _lodash2.default.isBoolean(value) && !value) {
                    delete obj[key];
                }
            });

            // remove any leftover undefined values from the delete operation on an array
            if (_lodash2.default.isArray(obj)) {
                _lodash2.default.pull(obj, undefined);
            }

            return obj;
        }
    }]);

    return StateTracker;
}();