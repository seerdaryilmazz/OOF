'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.d3Funcs = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var d3Funcs = exports.d3Funcs = function () {
    function d3Funcs(props) {
        var _this = this;

        _classCallCheck(this, d3Funcs);

        this.createForce = function () {
            return _this.force;
        };

        this.enterNode = function (selection) {
            selection.classed('node', true);

            selection.append('circle').attr("r", function (d) {
                return d.size;
            }).attr('class', 'ring').attr('fill', "blue").attr('id', function (d) {
                return d.klass;
            }).call(_this.force.drag);

            selection.append('text').attr("x", function (d) {
                return d.size;
            }).attr("dy", function (d) {
                return ".35em";
            }).attr('fill', "gray").text(function (d) {
                return d.label;
            });
        };

        this.updateNode = function (selection) {
            selection.attr("transform", function (d) {
                return "translate(" + d.x / 2 + "," + d.y / 2 + ")";
            });
        };

        this.addEvent = function (selection) {

            selection.on("click", function (d) {
                if (_this.onclick) _this.onclick(d);

                /* selection.append("circle")
                     .attr('class', 'ghostCircle')
                     .attr("r", 30)
                     .attr("opacity", 0.2) // change this to zero to hide the target area
                     .style("fill", "red")
                     .attr('pointer-events', 'mouseover')
                     .on("mouseover", function(d) {
                         console.log("mouse Over");
                     })
                     .on("mouseout", function(d) {
                         console.log("mouse Out");
                     });*/
            });
        };

        this.enterLink = function (selection) {
            selection.classed('link', true).attr("stroke-width", function (d) {
                return d.size;
            });
        };

        this.updateLink = function (selection) {
            selection.attr("x1", function (d) {
                return d.source.x / 2;
            }).attr("y1", function (d) {
                return d.source.y / 2;
            }).attr("x2", function (d) {
                return d.target.x / 2;
            }).attr("y2", function (d) {
                return d.target.y / 2;
            });
        };

        this.updateGraph = function (selection) {
            selection.selectAll('.node').call(_this.updateNode);
            selection.selectAll('.link').call(_this.updateLink);
        };

        this.responsivefy = function (selection) {

            console.log("responsify");
            // get container + svg aspect ratio
            var container = _d2.default.select(selection.node().parentNode),
                width = parseInt(selection.style('width')),
                height = parseInt(selection.style('height')),
                aspect = width / height;

            console.log("width--->" + width + "- " + "height-->" + height + " - " + " aspect--> " + aspect);

            // add viewBox and preserveAspectRatio properties,
            // and call resize so that svg resizes on inital page load
            selection.attr('viewBox', '0 0 ' + width + ' ' + height).attr('preserveAspectRatio', 'xMinYMid').call(resize);

            // to register multiple listeners for same event type,
            // you need to add namespace, i.e., 'click.foo'
            // necessary if you call invoke this function for multiple svgs
            // api docs: https://github.com/mbostock/d3/wiki/Selections#on
            _d2.default.select(window).on('resize.' + container.attr('id'), resize);

            // get width of container and resize svg to fit it
            resize = function resize() {
                var targetWidth = parseInt(container.style('width'));
                selection.attr('width', targetWidth);
                selection.attr('height', Math.round(targetWidth / aspect));
            };
        };

        if (props.onclick) this.onclick = props.onclick;
        this.width = 950;
        this.height = 500;
        this.force = _d2.default.layout.force().charge(-200).linkDistance(70).size([this.width, this.height]);
        this.state = { value: {} };
    }

    // *****************************************************
    // ** d3 functions to manipulate attributes
    // *****************************************************


    _createClass(d3Funcs, [{
        key: 'handleClick',
        value: function handleClick(value) {
            var state = _lodash2.default.cloneDeep(this.state);
            state.value = value;
            this.setState(state);
        }
    }]);

    return d3Funcs;
}();