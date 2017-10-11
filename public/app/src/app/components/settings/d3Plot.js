var width = 720,
    height = 410;
/*
var points = d3.range(1, 5).map(function(i) {
  return [i * width / 5, 50 + Math.random() * (height - 100)];
});*/

var points = [ getPoint(0,0.5), getPoint(24,0.5)];

var dragged = null,
    selected = points[0];

var rightBisector = d3.bisector(function(a, b) { return a[0]-b[0]; }).right;

var leftBisector = d3.bisector(function(a, b) { return a[0]-b[0]; }).left;

var line = d3.svg.line();
line.interpolate("monotone");

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("tabindex", 1);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", mousedown);

svg.append("path")
    .datum(points)
    .attr("class", "line")
    .call(redraw);

d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup)
    .on("keydown", keydown);

d3.select("#interpolate")
    .on("change", change)
  .selectAll("option")
    .data([
      "linear",
      "step-before",
      "step-after",
      "basis",
      "basis-open",
      "basis-closed",
      "cardinal",
      "cardinal-open",
      "cardinal-closed",
      "monotone"
    ])
  .enter().append("option")
    .attr("value", function(d) { return d; })
    .attr("class", function(d) { return d; })
    .text(function(d) { return d; });

d3.selectAll("option.basis").data([{}])
    .attr("selected", "")

svg.node().focus();

function getPoint(x, y ){
  return [(x/24.0)*width, y*height];
}

function redraw() {
  svg.select("path").attr("d", line);

  var circle = svg.selectAll("circle")
      .data(points, function(d) { return d; });

  circle.enter().append("circle")
      .attr("r", 1e-6)
      .on("mousedown", function(d) { selected = dragged = d; redraw(); })
    .transition()
      .duration(750)
      .ease("elastic")
      .attr("r", 6.5);

  circle
      .classed("selected", function(d) { return d === selected; })
      .attr("cx", function(d) { return d[0]; })
      .attr("cy", function(d) { return d[1]; });

  circle.exit().remove();

  if (d3.event) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
  }
}

function change() {
  line.interpolate(this.value);
  redraw();
}

function mousedown() {
  selected = dragged = d3.mouse(svg.node());
  var insertionPoint = rightBisector(points, selected);
  points.splice(insertionPoint, 0, selected);
  redraw();
}

function mousemove() {
  if (!dragged) return;
  var m = d3.mouse(svg.node());
  dragged[0] = Math.max(0, Math.min(width, m[0]));
  dragged[1] = Math.max(0, Math.min(height, m[1]));
  var selectedIndex = points.indexOf(selected);
  var rightIndex = rightBisector(points, dragged)-1;
  var leftIndex = leftBisector(points, dragged);
  console.clear();
  console.log("old: " + selectedIndex + ". right: " + rightIndex + ". left: " + leftIndex);
  
  if( rightIndex != selectedIndex ){
    points.splice(selectedIndex, 1);
    points.splice(rightIndex, 0, dragged);
    selected = dragged;
  }
  else if( leftIndex !=selectedIndex){
    points.splice(selectedIndex, 1);
    points.splice(leftIndex, 0, dragged);
    selected = dragged;
  }
  redraw();
}

function mouseup() {
  if (!dragged) return;
  mousemove();
  dragged = null;
}

function keydown() {
  if (!selected) return;
  switch (d3.event.keyCode) {
    case 8: // backspace
    case 46: { // delete
      var i = points.indexOf(selected);
      points.splice(i, 1);
      selected = points.length ? points[i > 0 ? i - 1 : 0] : null;
      redraw();
      break;
    }
  }
}