import React, { Component } from 'react';
import './zoomer.css';

class Zoomer extends Component {
    constructor(props) {
        super(props);

        this.image = null;  // the image DOM element

        if (this.props.settings.hasOwnProperty("minZoom")) {
            if (this.props.settings.minZoom < 0.1 || this.props.minZoom > 1) {
                console.error("minZoom setting must be a number between 0.1 and 1");
            }
        }

        if (this.props.settings.hasOwnProperty("maxZoom")) {
            if (this.props.settings.maxZoom < 1) {
                console.error("maxZoom setting must be a number greater than 1");
            }
        }

        // User defineable settings- these can be passed in via component props
        let defaultSettings = {
            backgroundColor: "#ccc", // the background color of the canvas
            minZoom: 1, // by default, user can't zoom out any more than 100%
            maxZoom: 4, // by default, user can zoom in to maximum 400%
            width: 300,
            height: 150
        }

        this.settings = Object.assign(defaultSettings, this.props.settings);

        this.zoomerStyle = {
            position: "relative",
            width: this.settings.width,
            height: this.settings.height
        }

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleOut = this.handleOut.bind(this);
        this.handleDown = this.handleDown.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleScrollWheel = this.handleScrollWheel.bind(this);
        this.handleUp = this.handleUp.bind(this);
        this.handleScrollWheel = this.handleScrollWheel.bind(this);
        
    }

    /**
     * Bind even listeners for relevant user-initiated events
     */
    bindEventListeners() {
        // the mouse wheel event must be bound through vanilla JS as the react synthetic onWheel event doesn't seem to work.
        this.canvas.onmousewheel = (e) => {
            this.handleScrollWheel(e)
        }
    }

    calculateDragMove(x, y) {
        // if the user is dragging the canvas, just move the canvas contents around based on the direction and length of the drag
        if (this.isDragging) {
            this.dragEnd = [x, y];
            this.calculateMovementCoords(x, y);
            this.dragMoveStart = [x, y];
            this.initialLoad = false;
        }
    }

    calculateMovementCoords(x, y) {
        let mouseX = Math.round(this.startX + (this.dragStart[0] - this.dragEnd[0])/this.scale);
        let mouseY = Math.round(this.startY + (this.dragStart[1] - this.dragEnd[1])/this.scale);
        
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
    calculatePinchZoom() {
        let distance_1 = Math.sqrt(Math.pow(this.finger_1.start.x - this.finger_2.start.x, 2) + Math.pow(this.finger_1.start.y - this.finger_2.start.y, 2));
		let distance_2 = Math.sqrt(Math.pow(this.finger_1.end.x - this.finger_2.end.x, 2) + Math.pow(this.finger_1.end.y - this.finger_2.end.y, 2));
		if (distance_1 && distance_2) {
  			this.ratio = (distance_2 / distance_1);
            
  			
  			let new_scale = this.scale * this.ratio;
		    
		    if ((new_scale > this.scale && new_scale < this.settings.maxZoom) || (new_scale < this.scale && new_scale > this.settings.minZoom)) { 
  			
	  			let focal_point = {
	  				x: (this.finger_1.start.x + this.finger_2.start.x) / 2, 
	  				y: (this.finger_1.start.y + this.finger_2.start.y) / 2 
	  			};
	  			
	  			this.translate(this.originX, this.originY)
	  			
	  			let originx = focal_point.x/(new_scale) - focal_point.x/this.scale;
	  			let originy = focal_point.y/(new_scale) - focal_point.y/this.scale;
	  			
	  			this.originX -= originx;
	 		 	this.originY -= originy;
	  			this.context.scale(this.ratio, this.ratio);
	  			
	  			this.translate(-this.originX, -this.originY)
	  			
	  			this.scale = new_scale; // redraw the empty rectangle at proper scaled size to avoid multiple instances of the image on the canvas
  			
		    }
		}
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        this.context.clearRect(this.originX,this.originY, this.canvas.width/this.scale, this.canvas.height/this.scale);
        this.context.fillStyle = this.settings.backgroundColor;
    }

    componentDidMount() {
        this.initializeImage();
    }

    handleTouchMove(e) {
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
                this.origin = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 }
                this.fingers_down = false;
			} else { // if the user is continuing a pinch, record the *current* end coordinates of the pinch and set the new start coordinates to the previous end position
				if (this.finger_1.end) this.finger_1.start = this.finger_1.end;
				if (this.finger_2.end) this.finger_2.start = this.finger_2.end;
				this.finger_1.end = { x: e.touches[0].clientX, y: e.touches[0].clientY };
				this.finger_2.end = { x: e.touches[1].clientX, y: e.touches[1].clientY };
			}
			
			// use the start and end points to calculate the pinch zoom ratio 
            this.calculatePinchZoom();
        }
        else { // is the user dragging?
            
            let x = e.targetTouches[0].pageX;
			let y = e.targetTouches[0].pageY;
            
            this.calculateDragMove(x, y);

		}


    }

    handleMouseMove(e) {
        this.userHasInteracted = true;

        e.preventDefault();
        e.stopPropagation();

        let x = e.clientX;
        let y = e.clientY;

        this.calculateDragMove(x, y);
    }

    handleDown(e) {
        e.preventDefault();
        this.userHasInteracted = true;
		
        // record the x and y coordinates of the click/tap
        let x, y;

        switch(e.type) {
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

    handleUp(e) {
        e.preventDefault();
        this.origin = null;
        this.userHasInteracted = true;
        this.isDragging = false;
        this.resetCanvasContentCoords(this.mouseX, this.mouseY);
    }

    handleOut(e) {
        this.userHasInteracted = true;
        this.isDragging = false;
        this.resetCanvasContentCoords(this.mouseX, this.mouseY);
    }

    handleScrollWheel(e) {
        e.preventDefault();
        this.userHasInteracted = true;

        // Get mouse offset
        let mx = e.clientX - this.canvas.offsetLeft;
        let my = e.clientY - this.canvas.offsetTop;

        let wheel = e.wheelDelta/120;

        this.ratio = Math.exp(wheel*this.zoomIntensity);
        let new_scale = this.scale * this.ratio;

        if ((new_scale > this.scale && new_scale < this.settings.maxZoom) || (new_scale < this.scale && new_scale > this.settings.minZoom)) { 
        
            let originx = mx/(this.scale*this.ratio) - mx/this.scale;
            let originy = my/(this.scale*this.ratio) - my/this.scale;
            
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
    initializeCanvas() {
        this.canvas = document.querySelector("#zoomer-canvas")
        let parent_width = this.canvas.parentElement.getBoundingClientRect().width;
        this.canvas.style.width = parent_width + "px";
        this.canvas.setAttribute("width", parseInt(parent_width));

        let parent_height = this.canvas.parentElement.getBoundingClientRect().height;
        this.canvas.style.height = parent_height+"px";
        this.canvas.setAttribute("height", parseInt(parent_height));

        this.context = this.canvas.getContext("2d");
        
        this.bindEventListeners();
        this.initializeZoomer();
    }

    /**
     * Load the image, and then initialize the canvas
     */
    initializeImage() {
        this.image = new Image();
        this.image.onload = (i) => {
            this.initializeCanvas();
        }
        this.image.src = this.props.image;
    }

    /**
     * Initialize Zoomer variables to track scrolling and pinch-zoom
     */
    initializeZoomer() {
        this.canvasRect = this.canvas.getBoundingClientRect();
        this.originX = 0;           // the X origin of the canvas
        this.originY = 0;           // the Y origin of the canvas
        this.image_left = 0;        // the left position of the drawn image
        this.image_top = 0;         // the top position of the drawn image
        this.isDragging = false;    // tracks whether the user is current dragging
        this.scale = 1;             // the original scale of the canvas
        this.userHasInteracted = false; // used to track whether the user has interacted with the canvas

        
        // a few variables to help calculate pinch zoom
        this.finger_1 = {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 }
        }
        this.finger_2 = {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 }
        }
        
        this.fingers_down = false; // the user has not put their fingers down yet

        // get the offset of the canvas, relative to the viewport
        this.offset = {
            left: this.canvasRect.left,
            top: this.canvasRect.top
        }

        this.mouseX = this.offset.left;            // the initial mouse X coordinate
        this.mouseY = this.offset.top;            // the initial mouse Y coordinate

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
    renderCanvas() {
        // clear the canvas before drawing the image
        this.clearCanvas();

        this.image_left = -this.mouseX + (this.canvas.width / 2 - this.image.width / 2) + this.offset.left;
        this.image_top = -this.mouseY + (this.canvas.height / 2 - this.image.height / 2) + this.offset.top;

        this.context.drawImage(this.image,this.image_left, this.image_top, this.image.width, this.image.height);

        requestAnimationFrame(() => {
            this.renderCanvas();
        });
    }

    /**
     * render the component JSX
     */
    render() {
        return (
            <div className="zoomer-container" style={this.zoomerStyle}>
                <canvas id="zoomer-canvas" 
                    onMouseMove={this.handleMouseMove} 
                    onTouchMove={this.handleTouchMove}
                    onMouseDown={this.handleDown}
                    onTouchStart={this.handleDown}
                    onMouseUp={this.handleUp}
                    onTouchEnd={this.handleUp}
                    onTouchCancel={this.handleUp}
                    onMouseOut={this.handleOut}
                ></canvas>
            </div>
        )
    }

    /**
	 * reset the X and Y coordinates for calculating movement distance on subsequent mouse / touch events
	 * 
	 * @param int clientX - the X coordinate of the new start position (current mouse/touch position)
	 * @param int clientY - the Y coordinate of the new start position (current mouse/touch position) 
	 */
	resetCanvasContentCoords(clientX, clientY)
	{
		this.startX = clientX;
		this.startY = clientY;
    }
    
    /**
     * 
     * @param int x 
     * @param int y 
     */
    translate(x,y) {
	    this.context.translate(x,y);
	}

}

export default Zoomer;