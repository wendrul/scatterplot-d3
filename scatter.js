"use strict";
//import * as d3 from "d3";

const height = 400;
const width = 650;
const margin = {
    "top": 20,
    "bottom": 40,
    "left": 40,
    "right": 20
}
const axisPadding =
{
    "horizontal": 0,
    "vertical": 0
}
const markRadius = 2;
const innerHeight = height - margin.top - margin.bottom;
const innerWidth = width - margin.left - margin.right;


function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = `<svg id="scatterPlot" height="${height}" width="${width}" xmlns="http://www.w3.org/2000/svg">` + svgEl.innerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\n';
    fetch("/style.css", (style1) => {
        fetch("/plot.css", (style2) => {
            svgData += "<style>\n";
            svgData += style1;
            svgData += "\n";
            svgData += style2;
            svgData += '\n</style>\n';
            //svgData += `<text class="plotTitle" id="svgPlotTitle" transform="translate(${width}, -${height})">${name}</text>`
            svgData += '\n</svg>\n';
            var svgBlob = new Blob([preface, svgData], { type: "image/svg+xml;charset=utf-8" });
            var svgUrl = URL.createObjectURL(svgBlob);
            var downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = `${name}.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        })
    })

}

function downloadSVG() {
    let svg = document.getElementById("scatterPlot");
    let title = document.getElementById("plotTitle");
    saveSvg(svg, `${title.textContent}`);
}

function getData(dataUrl, callback) {
    let data;
    fetch(dataUrl, function (dataString) {
        data = Papa.parse(dataString, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
        callback(data);
    })
    return data;
}

function plotScatter(dataURL, xFieldName, yFieldName) {
    let data = getData(dataURL, (data) => plotData(data, xFieldName, yFieldName));
}

function plotData(data, xName, yName) {
    let xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[xName]))
        .range([0, innerWidth]);
    let yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[yName]))
        .range([innerHeight, 0]);

    let svg = d3.select("svg#scatterPlot");

    let plot = svg.append("g")
        .attr("id", "plotArea")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    drawAxis(xScale, yScale, plot, innerHeight);
    drawPoints(data, plot, xScale, yScale, xName, yName);
}

function drawAxis(xScale, yScale, plot, innerHeight) {
    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale);
    plot.append("g")
        .attr("transform", `translate(0,${innerHeight + axisPadding.horizontal})`)
        .attr("class", "plotAxis")
        .attr("id", "xAxis")
        .call(xAxis);
    plot.append("g")
        .attr("transform", `translate(${-axisPadding.vertical},0)`)
        .attr("class", "plotAxis")
        .attr("id", "yAxis")
        .call(yAxis);
}

function drawPoints(data, plotArea, xScale, yScale, xName, yName) {
    let circles = plotArea.selectAll("circle.scatterPoint")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "scatterPoint")
        .attr("cx", d => xScale(d[xName]))
        .attr("cy", d => yScale(d[yName]))
        .attr("r", markRadius);
}

function fetch(data_url, callback) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", data_url, true);
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response;
        if (arrayBuffer) {
            var byteArray = new Uint8Array(arrayBuffer);
            //// Inflating when file is .gz
            // byteArray = pako.inflate(byteArray)
            var s = new TextDecoder("utf-8").decode(byteArray)
            callback(s)
        }
    };
    oReq.send(null);
}

plotScatter("/chains.csv", "idx", "radius");