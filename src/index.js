import React from 'react';
import ReactDOM from 'react-dom';
import Zoomer from './lib';
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
            <Zoomer image="https://d3bx4ud3idzsqf.cloudfront.net/public/production/7386/68915_high_res_1536869974.jpg" settings={settings} />
        </div>
    ), document.getElementById("root")
);
