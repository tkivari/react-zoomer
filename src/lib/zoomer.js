import React, { Component } from 'react';
import './zoomer.css';

class Zoomer extends Component {
    constructor(props) {
        super(props);

        // User defineable settings- these can be passed in via component props
        let defaultSettings = {
            backgroundColor: "#ccc", // the background color of the canvas
            minZoom: 1, // by default, user can't zoom out any more than 100%
            maxZoom: 4, // by default, user can zoom in to maximum 400%
            canvasWidth: 100,
            canvasHeight: 200
        }

        this.settings = Object.assign(defaultSettings, this.props.settings);
        
    }

    /**
     * Bind even listeners for relevant user-initiated events
     */
    bindEventListeners() {
        this.canvas.addEventListener("mousemove", (e) => {
            this.handleMove(e);
        })
        this.canvas.addEventListener("touchmove", (e) => {
            this.handleMove(e);
        })

        this.canvas.addEventListener("mousedown", (e) => {
            this.handleDown(e);
        })
        this.canvas.addEventListener("touchstart", (e) => {
            this.handleDown(e);
        })
        this.canvas.addEventListener("mouseup", (e) => {
            this.handleUp(e);
        })
        this.canvas.addEventListener("touchend", (e) => {
            this.handleUp(e);
        })
        this.canvas.addEventListener("touchcancel", (e) => {
            this.handleUp(e);
        })
        this.canvas.addEventListener("mouseout", (e) => {
            this.handleOut(e);
        })
        this.canvas.onmousewheel = (e) => {
            this.handleScrollWheel(e)
        }
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        this.context.clearRect(this.settings.originX, this.settings.originY, this.canvas.width, this.canvas.height);
		this.context.fillStyle = this.settings.backgroundColor;
    }

    componentDidMount() {
        this.initialize();
    }

    handleMove(e) {
        console.log("move event");

        e.preventDefault();
        // is the user zooming? If there are 2 fingers/touch points on the screen, this is a pinch zoom
        if (e.originalEvent.touches && e.originalEvent.touches.length == 2) {
			// if the user just put their fingers down and started dragging, record the x and y coordinates of the starting position of the pinch 
			if (this.fingers_down) {
				this.finger_1_start = { x: e.originalEvent.touches[0].clientX, y: e.originalEvent.touches[0].clientY };
				this.finger_2_start = { x: e.originalEvent.touches[1].clientX, y: e.originalEvent.touches[1].clientY };
				this.origin = { x: (e.originalEvent.touches[0].clientX + e.originalEvent.touches[1].clientX) / 2, y: (e.originalEvent.touches[0].clientY + e.originalEvent.touches[1].clientY) / 2 }
				this.fingers_down = false;
			} else { // if the user is continuing a pinch, record the *current* end coordinates of the pinch and set the new start coordinates to the previous end position
				if (this.finger_1_end) this.finger_1_start = this.finger_1_end;
				if (this.finger_2_end) this.finger_2_start = this.finger_2_end;
				this.finger_1_end = { x: e.originalEvent.touches[0].clientX, y: e.originalEvent.touches[0].clientY };
				this.finger_2_end = { x: e.originalEvent.touches[1].clientX, y: e.originalEvent.touches[1].clientY };
			}
			
			// use the start and end points to calculate the pinch zoom ratio 
			this.calculatePinchZoom();
		} else { // is the user dragging?
			var x = e.clientX ? e.clientX : e.originalEvent.targetTouches[0].pageX;
			var y = e.clientY ? e.clientY : e.originalEvent.targetTouches[0].pageY;
			
			// if the user is dragging the canvas, just move the canvas contents around based on the direction and length of the drag
			if (this.isDragging) {
				this.dragEnd = [x, y];
				this.calculateMovementCoords(x, y);
				this.drawMoveStart = [x, y];
				this.initial_load = false;
			}

		}


    }

    handleDown(e) {
        console.log("down event");
    }

    handleUp(e) {
        console.log("up event");
    }

    handleOut(e) {
        console.log("out event");
    }

    handleScrollWheel(e) {
        console.log("scroll event");
    }

    /**
     * Initialize Zoomer variables to track scrolling and pinch-zoom
     */
    initializeZoomer() {
        this.originX = 0;
        this.originY = 0;
        this.mouseX = 0;            //  the initial mouse X coordinate
        this.mouseY = 0;            // the initial mouse Y coordinate
        this.isDragging = false;    // tracks whether the user is current dragging
        this.scale = 1;             // the original scale of the canvas
        this.startX = this.offsetX; // the initial loading position of the canvas contents
	    this.startY = this.offsetY;
        this.dragStart = [this.startX, this.startY]; // used to calculate how far canvas contents have been dragged, and in what direction
	    this.dragEnd = [this.startX, this.startY];
	    this.drawMoveStart = [0,0]; // used to calculate the current position of the drag

        // a few variables to help calculate pinch zoom
        this.finger_1_start = { x: 0, y: 0 };
        this.finger_2_start = { x: 0, y: 0 };
        this.finger_1_end   = { x: 0, y: 0 };
        this.finger_2_end   = { x: 0, y: 0 };
        this.fingers_down = false;

        // get the offset of the canvas, relative to the viewport
        this.canvasRect = this.canvas.getBoundingClientRect();
        this.offset = {
            left: this.canvasRect.left,
            top: this.canvasRect.top
        }
        
        this.startX = this.offset.left; // the initial loading position of the canvas contents
	    this.startY = this.offset.top;
        
        // the difference between dragStart and dragMoveStart is that dragStart is calculated and recorded only 
		// on the down event, while dragMoveStart is recalculated on every move event
        this.dragMoveStart = [0,0]; // used to calculate the current position of the drag
        this.dragStart = [this.startX, this.startY]; // used to track where the user started dragging
        this.dragEnd = [this.startX, this.startY]; // used to calculate how far canvas contents have been dragged, and in what direction.


        this.renderCanvas();
    }

    /**
     * Get a reference to the canvas/context, and bind event listeners
     */
    initializeCanvas() {
        this.canvas = document.querySelector("#zoomer-canvas")
        this.context = this.canvas.getContext("2d");
        
        this.bindEventListeners();
        this.initializeZoomer();
    }

    /**
     * Load the image, and then initialize the canvas
     */
    initializeImage() {
        let image = new Image();
        console.log(this.props.image);
        image.onload = (i) => {
            this.image_width = i.width;
            this.image_height = i.height;
            this.initializeCanvas();
        }
        image.src = this.props.image;
    }

    /**
     * draw the scaled image onto the canvas
     */
    renderCanvas() {

        // this.canvas.drawImage

        requestAnimationFrame(() => {
            this.renderCanvas();
        });
    }

    render() {
        return (
            <canvas id="zoomer-canvas" width={this.settings.canvasWidth} height={this.settings.canvasHeight}></canvas>
        )
    }
}

export default Zoomer;