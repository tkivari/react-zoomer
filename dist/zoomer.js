var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import './zoomer.css';

var Zoomer = function (_Component) {
    _inherits(Zoomer, _Component);

    function Zoomer(props) {
        _classCallCheck(this, Zoomer);

        var _this = _possibleConstructorReturn(this, (Zoomer.__proto__ || Object.getPrototypeOf(Zoomer)).call(this, props));

        _this.image = null; // the image DOM element

        if (_this.props.settings.hasOwnProperty("minZoom")) {
            if (_this.props.settings.minZoom < 0.1 || _this.props.minZoom > 1) {
                console.error("minZoom setting must be a number between 0.1 and 1");
            }
        }

        if (_this.props.settings.hasOwnProperty("maxZoom")) {
            if (_this.props.settings.maxZoom < 1) {
                console.error("maxZoom setting must be a number greater than 1");
            }
        }

        // User defineable settings- these can be passed in via component props
        var defaultSettings = {
            backgroundColor: "#ccc", // the background color of the canvas
            minZoom: 1, // by default, user can't zoom out any more than 100%
            maxZoom: 4, // by default, user can zoom in to maximum 400%
            width: 300,
            height: 150
        };

        _this.settings = Object.assign(defaultSettings, _this.props.settings);

        _this.zoomerStyle = {
            position: "relative",
            width: _this.settings.width,
            height: _this.settings.height
        };

        _this.handleMouseMove = _this.handleMouseMove.bind(_this);
        _this.handleOut = _this.handleOut.bind(_this);
        _this.handleDown = _this.handleDown.bind(_this);
        _this.handleTouchMove = _this.handleTouchMove.bind(_this);
        _this.handleScrollWheel = _this.handleScrollWheel.bind(_this);
        _this.handleUp = _this.handleUp.bind(_this);
        _this.handleScrollWheel = _this.handleScrollWheel.bind(_this);

        return _this;
    }

    /**
     * Bind even listeners for relevant user-initiated events
     */


    _createClass(Zoomer, [{
        key: 'bindEventListeners',
        value: function bindEventListeners() {
            var _this2 = this;

            // the mouse wheel event must be bound through vanilla JS as the react synthetic onWheel event doesn't seem to work.
            this.canvas.onmousewheel = function (e) {
                _this2.handleScrollWheel(e);
            };

            // prevent Safari on iOS from ignoring the user-scalable=0 in the viewport meta tag
            this.canvas.ongesturestart = function (e) {
                e.preventDefault();
                e.stopPropagation();
            };

            // prevent IE / Edge from ignoring the user-scalable=0 in the viewport meta tag
            this.canvas.onmsgesturestart = function (e) {
                e.preventDefault();
                e.stopPropagation();
            };
        }
    }, {
        key: 'calculateDragMove',
        value: function calculateDragMove(x, y) {
            // if the user is dragging the canvas, just move the canvas contents around based on the direction and length of the drag
            if (this.isDragging) {
                this.dragEnd = [x, y];
                this.calculateMovementCoords(x, y);
                this.dragMoveStart = [x, y];
                this.initialLoad = false;
            }
        }
    }, {
        key: 'calculateMovementCoords',
        value: function calculateMovementCoords(x, y) {
            var mouseX = Math.round(this.startX + (this.dragStart[0] - this.dragEnd[0]) / this.scale);
            var mouseY = Math.round(this.startY + (this.dragStart[1] - this.dragEnd[1]) / this.scale);

            // Known issue:  Currently, the user can drag the image off of the canvas and out of view,
            // and keep on dragging forever.  In a future version, I would like to figure out how 
            // to prevent them from doing so.

            // if (mouseX < -this.originX - this.canvas.width/this.scale / 2) {
            //     mouseX = -this.originX - this.canvas.width/this.scale / 2;
            // }

            // if (mouseX < -1*((this.image.width / this.scale) / 2)) {
            //     mouseX = -1*((this.image.width / this.scale) / 2);
            // }

            // if (mouseX > (this.image.width / this.scale) / 2) {
            //     mouseX = (this.image.width / this.scale) / 2;
            // }

            // if (mouseX > -this.originX + (this.image.width - this.canvas.width/this.scale / 2)) {
            //     mouseX = -this.originX + (this.image.width - this.canvas.width/this.scale / 2);
            // }

            // if (mouseY < -this.originY) {
            //     mouseY = -this.originY;
            // }

            // if (mouseY > -this.originY + this.image.height - this.canvas.height / this.scale) {
            //     mouseY = -this.originY + this.image.height - this.canvas.height / this.scale;
            // }

            this.mouseX = mouseX;
            this.mouseY = mouseY;
        }

        /**
         * calculate the new scale and positioning of the image based on the amount of pinching
         */

    }, {
        key: 'calculatePinchZoom',
        value: function calculatePinchZoom() {
            var distance_1 = Math.sqrt(Math.pow(this.finger_1.start.x - this.finger_2.start.x, 2) + Math.pow(this.finger_1.start.y - this.finger_2.start.y, 2));
            var distance_2 = Math.sqrt(Math.pow(this.finger_1.end.x - this.finger_2.end.x, 2) + Math.pow(this.finger_1.end.y - this.finger_2.end.y, 2));
            if (distance_1 && distance_2) {
                this.ratio = distance_2 / distance_1;

                var new_scale = this.scale * this.ratio;

                if (new_scale > this.scale && new_scale < this.settings.maxZoom || new_scale < this.scale && new_scale > this.settings.minZoom) {

                    var focal_point = {
                        x: (this.finger_1.start.x + this.finger_2.start.x) / 2,
                        y: (this.finger_1.start.y + this.finger_2.start.y) / 2
                    };

                    this.translate(this.originX, this.originY);

                    var originx = focal_point.x / new_scale - focal_point.x / this.scale;
                    var originy = focal_point.y / new_scale - focal_point.y / this.scale;

                    this.originX -= originx;
                    this.originY -= originy;
                    this.context.scale(this.ratio, this.ratio);

                    this.translate(-this.originX, -this.originY);

                    this.scale = new_scale; // redraw the empty rectangle at proper scaled size to avoid multiple instances of the image on the canvas
                }
            }
        }

        /**
         * Clear the canvas
         */

    }, {
        key: 'clearCanvas',
        value: function clearCanvas() {
            this.context.clearRect(this.originX, this.originY, this.canvas.width / this.scale, this.canvas.height / this.scale);
            this.context.fillStyle = this.settings.backgroundColor;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.initializeImage();
        }
    }, {
        key: 'handleGestureStart',
        value: function handleGestureStart(e) {
            e.preventDefault();
        }
    }, {
        key: 'handleTouchMove',
        value: function handleTouchMove(e) {
            e.preventDefault();
            e.stopPropagation();
            this.userHasInteracted = true;

            // is the user zooming? If there are 2 fingers/touch points on the screen, this is a pinch zoom
            if (e.touches && e.touches.length === 2) {
                // if the user just put their fingers down and started dragging, record the x and y coordinates of the starting position of the pinch 
                if (this.fingers_down) {
                    this.finger_1.start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    this.finger_2.start = { x: e.touches[1].clientX, y: e.touches[1].clientY };
                    this.finger_1.end = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    this.finger_2.end = { x: e.touches[1].clientX, y: e.touches[1].clientY };
                    this.origin = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
                    this.fingers_down = false;
                } else {
                    // if the user is continuing a pinch, record the *current* end coordinates of the pinch and set the new start coordinates to the previous end position
                    if (this.finger_1.end) this.finger_1.start = this.finger_1.end;
                    if (this.finger_2.end) this.finger_2.start = this.finger_2.end;
                    this.finger_1.end = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    this.finger_2.end = { x: e.touches[1].clientX, y: e.touches[1].clientY };
                }

                // use the start and end points to calculate the pinch zoom ratio 
                this.calculatePinchZoom();
            } else {
                // is the user dragging?

                var x = e.targetTouches[0].pageX;
                var y = e.targetTouches[0].pageY;

                this.calculateDragMove(x, y);
            }
        }
    }, {
        key: 'handleMouseMove',
        value: function handleMouseMove(e) {
            this.userHasInteracted = true;

            e.preventDefault();
            e.stopPropagation();

            var x = e.clientX;
            var y = e.clientY;

            this.calculateDragMove(x, y);
        }
    }, {
        key: 'handleDown',
        value: function handleDown(e) {
            e.preventDefault();
            e.stopPropagation();
            this.userHasInteracted = true;

            // record the x and y coordinates of the click/tap
            var x = void 0,
                y = void 0;

            switch (e.type) {
                case "touchstart":
                    x = e.targetTouches[0].pageX;
                    y = e.targetTouches[0].pageY;
                    if (e.touches) {
                        // this is a pinch, not a click or a tap
                        this.fingers_down = true;
                    }

                    break;
                case "mousedown":
                default:
                    x = e.clientX;
                    y = e.clientY;
            }

            // if the user is not in draw mode, record the starting position of the drag.
            this.isDragging = true;
            this.dragStart = [x, y];
            this.dragMoveStart = [x, y];
        }
    }, {
        key: 'handleUp',
        value: function handleUp(e) {
            e.preventDefault();
            e.stopPropagation();
            this.origin = null;
            this.userHasInteracted = true;
            this.isDragging = false;
            this.resetCanvasContentCoords(this.mouseX, this.mouseY);
        }
    }, {
        key: 'handleOut',
        value: function handleOut(e) {
            e.preventDefault();
            e.stopPropagation();
            this.userHasInteracted = true;
            this.isDragging = false;
            this.resetCanvasContentCoords(this.mouseX, this.mouseY);
        }
    }, {
        key: 'handleScrollWheel',
        value: function handleScrollWheel(e) {
            e.preventDefault();
            e.stopPropagation();
            this.userHasInteracted = true;

            // Get mouse offset
            var mx = e.clientX - this.canvas.offsetLeft;
            var my = e.clientY - this.canvas.offsetTop;

            var wheel = e.wheelDelta / 120;

            this.ratio = Math.exp(wheel * this.zoomIntensity);
            var new_scale = this.scale * this.ratio;

            if (new_scale > this.scale && new_scale < this.settings.maxZoom || new_scale < this.scale && new_scale > this.settings.minZoom) {

                var originx = mx / (this.scale * this.ratio) - mx / this.scale;
                var originy = my / (this.scale * this.ratio) - my / this.scale;

                // Translate so the visible origin is at the context's origin.
                this.translate(this.originX, this.originY);

                // zoom to the point that the mouse is currently on
                this.originX -= originx;
                this.originY -= originy;

                // Scale it (centered around the origin due to the previous translate).
                this.context.scale(this.ratio, this.ratio);
                // Offset the visible origin to it's proper position.
                this.translate(-this.originX, -this.originY);

                // Update scale by scroll ratio
                this.scale = new_scale;
                this.initial_load = false;
            }
        }

        /**
         * Get a reference to the canvas/context, and bind event listeners
         */

    }, {
        key: 'initializeCanvas',
        value: function initializeCanvas() {
            this.canvas = document.querySelector("#zoomer-canvas");
            var parent_width = this.canvas.parentElement.getBoundingClientRect().width;
            this.canvas.style.width = parent_width + "px";
            this.canvas.setAttribute("width", parseInt(parent_width));

            var parent_height = this.canvas.parentElement.getBoundingClientRect().height;
            this.canvas.style.height = parent_height + "px";
            this.canvas.setAttribute("height", parseInt(parent_height));

            this.context = this.canvas.getContext("2d");

            this.bindEventListeners();
            this.initializeZoomer();
        }

        /**
         * Load the image, and then initialize the canvas
         */

    }, {
        key: 'initializeImage',
        value: function initializeImage() {
            var _this3 = this;

            this.image = new Image();
            this.image.onload = function (i) {
                _this3.initializeCanvas();
            };
            this.image.src = this.props.image;
        }

        /**
         * Initialize Zoomer variables to track scrolling and pinch-zoom
         */

    }, {
        key: 'initializeZoomer',
        value: function initializeZoomer() {
            this.canvasRect = this.canvas.getBoundingClientRect();
            this.originX = 0; // the X origin of the canvas
            this.originY = 0; // the Y origin of the canvas
            this.image_left = 0; // the left position of the drawn image
            this.image_top = 0; // the top position of the drawn image
            this.isDragging = false; // tracks whether the user is current dragging
            this.scale = 1; // the original scale of the canvas
            this.userHasInteracted = false; // used to track whether the user has interacted with the canvas


            // a few variables to help calculate pinch zoom
            this.finger_1 = {
                start: { x: 0, y: 0 },
                end: { x: 0, y: 0 }
            };
            this.finger_2 = {
                start: { x: 0, y: 0 },
                end: { x: 0, y: 0 }
            };

            this.fingers_down = false; // the user has not put their fingers down yet

            // get the offset of the canvas, relative to the viewport
            this.offset = {
                left: this.canvasRect.left,
                top: this.canvasRect.top
            };

            this.mouseX = this.offset.left; // the initial mouse X coordinate
            this.mouseY = this.offset.top; // the initial mouse Y coordinate

            this.startX = this.offset.left; // the initial loading position of the canvas contents
            this.startY = this.offset.top;

            this.zoomIntensity = 0.2; // the zoom intensity when using scroll wheel to zoom in

            // the difference between dragStart and dragMoveStart is that dragStart is calculated and recorded only 
            // on the down event, while dragMoveStart is recalculated on every move event
            this.dragMoveStart = [this.offset.left, this.offset.top]; // used to calculate the current position of the drag
            this.dragStart = [this.offset.left, this.offset.top]; // used to track where the user started dragging
            this.dragEnd = [this.offset.left, this.offset.top]; // used to calculate how far canvas contents have been dragged, and in what direction.

            this.renderCanvas();
        }

        /**
         * draw the image onto the scaled canvas
         */

    }, {
        key: 'renderCanvas',
        value: function renderCanvas() {
            var _this4 = this;

            // clear the canvas before drawing the image
            this.clearCanvas();

            this.image_left = -this.mouseX + (this.canvas.width / 2 - this.image.width / 2) + this.offset.left;
            this.image_top = -this.mouseY + (this.canvas.height / 2 - this.image.height / 2) + this.offset.top;

            this.context.drawImage(this.image, this.image_left, this.image_top, this.image.width, this.image.height);

            requestAnimationFrame(function () {
                _this4.renderCanvas();
            });
        }

        /**
         * render the component JSX
         */

    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'zoomer-container', style: this.zoomerStyle },
                React.createElement('canvas', { id: 'zoomer-canvas',
                    onMouseMove: this.handleMouseMove,
                    onTouchMove: this.handleTouchMove,
                    onMouseDown: this.handleDown,
                    onTouchStart: this.handleDown,
                    onMouseUp: this.handleUp,
                    onTouchEnd: this.handleUp,
                    onTouchCancel: this.handleUp,
                    onMouseOut: this.handleOut
                })
            );
        }

        /**
        * reset the X and Y coordinates for calculating movement distance on subsequent mouse / touch events
        * 
        * @param int clientX - the X coordinate of the new start position (current mouse/touch position)
        * @param int clientY - the Y coordinate of the new start position (current mouse/touch position) 
        */

    }, {
        key: 'resetCanvasContentCoords',
        value: function resetCanvasContentCoords(clientX, clientY) {
            this.startX = clientX;
            this.startY = clientY;
        }

        /**
         * 
         * @param int x 
         * @param int y 
         */

    }, {
        key: 'translate',
        value: function translate(x, y) {
            this.context.translate(x, y);
        }
    }]);

    return Zoomer;
}(Component);

export default Zoomer;