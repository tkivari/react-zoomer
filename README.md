## React Zoomer

This package provides a React component that takes an image URL as a prop and loads it into a canvas. The user can zoom via mouse wheel on desktop or pinch-zoom on a mobile device.  

## Installation

```
npm i --save react-zoomer 
```

## Usage

the zoomable component has only a few settings and props and is easily added into any React application:

```
import React from 'react';
import ReactDOM from 'react-dom';
import Zoomer from './lib/zoomer';
import './index.css';

let settings = {
    background_color: "#eee",
    width: "100%",
    height: "500px",
    minZoom: 0.5 // set minimum zoom to  50% of original size
 };

ReactDOM.render(
    (
        <div className="zoomer-demo">
            <Zoomer
              image="https://d3bx4ud3idzsqf.cloudfront.net/public/production/7386/68915_high_res_1536869974.jpg"
              settings={settings} 
            />
        </div>
    ), document.getElementById("root")
);
```

## Supported props 

```
image: the URL of the image
settings: an object containing any of the following keys:
  - background_color: sets the background color of the canvas
  - width: sets the width of the canvas, in % or px
  - height: sets the height of the canvas, in % or px
  - minZoom: a number between 0.1 and 1, sets the minimum zoom.  This is the furthest a user will be able to zoom out of the image. 
  - maxZoom: a number greater than 1, the maximum a user will be able to zoom into the image.
```

## More information

The code for this package can be found at https://github.com/tkivari/react-zoomer

A working demo can be found at https://tyler.digital
