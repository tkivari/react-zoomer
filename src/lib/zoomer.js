import React, { Component } from 'react';
import './zoomer.css';

class Zoomer extends Component {
    constructor(props) {
        super(props);

        this.originX = 0;
        this.originY = 0;
        this.mouseX = 0; //  the initial mouse X coordinate
        this.mouseY = 0; // the initial mouse Y coordinate
        this.isDragging = false; // tracks whether the user is current dragging

        // User defineable settings
        let default_settings = {
            background_color: "#ccc", // the background color of the canvas
        }

        this.settings = Object.assign(default_settings, this.props.settings);
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

    clearCanvas() {
        this.context.clearRect(this.settings.originX, this.settings.originY, window.InnerWidth, window.innerHeight);
		this.context.fillStyle = "#323532";
    }

    handleMove(e) {
        console.log("move event");
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

    renderCanvas() {

        // this.canvas.drawImage

        requestAnimationFrame(() => {
            this.renderCanvas();
        });
    }

    initializeCanvas() {
        this.canvas = document.querySelector("#zoomer-canvas")
        this.context = this.canvas.getContext("2d");
        
        this.bindEventListeners();
        this.renderCanvas();
    }

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

    componentDidMount() {
        this.initializeImage();
    } 
    
    render() {
        return (
            <canvas id="zoomer-canvas" width="100%" height="100%"></canvas>
        )
    }
}

export default Zoomer;