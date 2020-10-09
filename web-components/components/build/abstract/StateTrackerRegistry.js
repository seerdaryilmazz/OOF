"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StateTrackerRegistry = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _StateTracker = require("./StateTracker");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StateTrackerRegistry = exports.StateTrackerRegistry = function () {
    function StateTrackerRegistry() {
        _classCallCheck(this, StateTrackerRegistry);

        this.stateTrackerList = [];
    }

    _createClass(StateTrackerRegistry, [{
        key: "registerStateTracker",
        value: function registerStateTracker(component, propsToCheck, options, initialState, onStateChanged, onStateUnchanged) {
            console.log("Currently there are " + this.stateTrackerList.length + " state trackers. Registering a new state tracker.");
            this.stateTrackerList.push(new _StateTracker.StateTracker(component, propsToCheck, options, initialState, onStateChanged, onStateUnchanged));
        }
    }]);

    return StateTrackerRegistry;
}();