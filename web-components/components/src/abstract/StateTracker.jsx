import _ from "lodash";

export class StateTracker {

    constructor(component, propsToCheck, options, initialState, onStateChanged, onStateUnchanged) {
        this.defaultOptions = {
            ignoreUndefined: true,
            ignoreNull: true,
            ignoreNan: true,
            ignoreEmptyString: true,
            ignoreEmptyObject: true,
            ignoreBooleanFalse: false,
            ignoreBooleanTrue: false,
        };

        this.component = component;
        this.propsToCheck = propsToCheck;
        this.options = _.merge(_.cloneDeep(this.defaultOptions), options);
        this.initialState = this.extractState(initialState);
        this.onStateChanged = onStateChanged;
        this.onStateUnchanged = onStateUnchanged;

        this.originalUpdateFunction = _.isFunction(this.component.componentWillUpdate) ? this.component.componentWillUpdate : null;
        this.component.componentWillUpdate = (nextProps, nextState) => {
            this.trackStateChange(nextState);

            if (this.originalUpdateFunction) {
                this.originalUpdateFunction.call(this.component, nextProps, nextState);
            }
        }

        this.lastEqual = true;
    }

    trackStateChange(nextState) {
        let eq = _.isEqual(this.initialState, this.extractState(nextState));

        if (eq && !this.lastEqual && this.onStateUnchanged) {
            this.onStateUnchanged();
        } else if (!eq && this.lastEqual && this.onStateChanged) {
            this.onStateChanged();
        }

        this.lastEqual = eq;
    }

    extractState(state) {
        return this.clean(_.cloneDeep(_.pick(state, this.propsToCheck)));
    }

    clean(obj) {
        _.forOwn(obj, (value, key) => {
            if ((this.options.ignoreUndefined && _.isUndefined(value))
                || (this.options.ignoreNull && _.isNull(value))
                || (this.options.ignoreNan && _.isNaN(value))
                || (this.options.ignoreEmptyString && _.isString(value) && _.isEmpty(value))
                || (this.options.ignoreEmptyObject && _.isObject(value) && _.isEmpty(this.clean(value)))
                || (this.options.ignoreBooleanTrue && _.isBoolean(value) && value)
                || (this.options.ignoreBooleanFalse && _.isBoolean(value) && !value)
            ) {
                delete obj[key];
            }
        });

        // remove any leftover undefined values from the delete operation on an array
        if (_.isArray(obj)) {
            _.pull(obj, undefined);
        }

        return obj;
    }
}