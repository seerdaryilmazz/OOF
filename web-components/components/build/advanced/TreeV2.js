"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TreeV2 = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _abstract = require("../abstract");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var indentationCellStyle = {
    //border: "1px solid black", // Hizaları kontrol ederken bunu açabiliriz.
    padding: "0px",
    minWidth: "20px"
};

var clickableIndentationCellStyle = {
    //border: "1px solid black", // Hizaları kontrol ederken bunu açabiliriz.
    padding: "0px",
    minWidth: "20px",
    fontStyle: "normal",
    fontSize: "16px",
    verticalAlign: "middle",
    textAlign: "left",
    cursor: "pointer"
};

var TreeV2 = exports.TreeV2 = function (_TranslatingComponent) {
    _inherits(TreeV2, _TranslatingComponent);

    function TreeV2(props) {
        _classCallCheck(this, TreeV2);

        var _this = _possibleConstructorReturn(this, (TreeV2.__proto__ || Object.getPrototypeOf(TreeV2)).call(this, props));

        _this.state = {
            nodes: []
        };
        return _this;
    }

    _createClass(TreeV2, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.setState({ nodes: this.props.nodes });
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            if (!_lodash2.default.isEqual(this.props.nodes, nextProps.nodes)) {
                this.setState({ nodes: nextProps.nodes });
            }
        }
    }, {
        key: "findMaxDepth",
        value: function findMaxDepth(nodes) {
            var _this2 = this;

            var maxDepth = 0;

            if (nodes && nodes.length > 0) {
                maxDepth++;
                nodes.forEach(function (node) {
                    var maxDepthOfNode = _this2.findMaxDepthOfNode(maxDepth, 1, node);
                    if (maxDepthOfNode > maxDepth) {
                        maxDepth = maxDepthOfNode;
                    }
                });
            }

            return maxDepth;
        }
    }, {
        key: "findMaxDepthOfNode",
        value: function findMaxDepthOfNode(initialMaxDepth, depth, node) {
            var _this3 = this;

            var maxDepth = initialMaxDepth;

            if (node.hasChildNodes && node.showChildNodes && node.childNodes && node.childNodes.length > 0) {
                node.childNodes.forEach(function (childNode) {
                    var maxDepthOfChild = _this3.findMaxDepthOfNode(maxDepth, depth + 1, childNode);
                    if (maxDepthOfChild > maxDepth) {
                        maxDepth = maxDepthOfChild;
                    }
                });
            } else {
                if (depth > maxDepth) {
                    maxDepth = depth;
                }
            }

            return maxDepth;
        }
    }, {
        key: "renderNode",
        value: function renderNode(rows, depth, maxDepth, node) {
            var _this4 = this;

            var columns = [];

            for (var i = 1; i <= depth - 1; i++) {
                columns.push(_react2.default.createElement("td", { key: columns.length + 1 }));
            }

            if (node.hasChildNodes) {
                if (node.showChildNodes) {
                    columns.push(_react2.default.createElement(
                        "td",
                        { key: columns.length + 1, style: clickableIndentationCellStyle, onClick: function onClick() {
                                return _this4.handleCollapseClick(node);
                            } },
                        "\u25BD"
                    ));
                } else {
                    columns.push(_react2.default.createElement(
                        "td",
                        { key: columns.length + 1, style: clickableIndentationCellStyle, onClick: function onClick() {
                                return _this4.handleExpandClick(node);
                            } },
                        "\u25B7"
                    ));
                }
            } else {
                columns.push(_react2.default.createElement("td", { key: columns.length + 1, style: indentationCellStyle }));
            }

            columns.push(_react2.default.createElement(
                "td",
                { key: columns.length + 1, width: "100%", colSpan: maxDepth - depth + 1 },
                node.content
            ));

            rows.push(_react2.default.createElement(
                "tr",
                { key: rows.length + 1 },
                columns
            ));

            if (node.hasChildNodes && node.showChildNodes && node.childNodes && node.childNodes.length > 0) {
                node.childNodes.forEach(function (childNode) {
                    _this4.renderNode(rows, depth + 1, maxDepth, childNode);
                });
            }
        }
    }, {
        key: "renderNodes",
        value: function renderNodes(nodes) {
            var _this5 = this;

            var rows = [];
            var depth = 0;

            if (nodes && nodes.length > 0) {

                var maxDepth = this.findMaxDepth(nodes);

                nodes.forEach(function (node) {
                    _this5.renderNode(rows, depth + 1, maxDepth, node);
                });
            }

            return _react2.default.createElement(
                "table",
                { width: "100%" },
                _react2.default.createElement(
                    "tbody",
                    null,
                    rows
                )
            );
        }
    }, {
        key: "handleExpandClick",
        value: function handleExpandClick(node) {
            this.props.onExpand && this.props.onExpand(node);
        }
    }, {
        key: "handleCollapseClick",
        value: function handleCollapseClick(node) {
            this.props.onCollapse && this.props.onCollapse(node);
        }
    }, {
        key: "render",
        value: function render() {
            return this.renderNodes(this.state.nodes);
        }
    }]);

    return TreeV2;
}(_abstract.TranslatingComponent);

TreeV2.contextTypes = {
    translator: _react2.default.PropTypes.object
};