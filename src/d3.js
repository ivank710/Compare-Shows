import * as d3 from 'd3';


function arcTweenPath(a, i) {

  var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);

  function tween(t) {
    var b = oi(t);
    a.x0s = b.x0;
    a.x1s = b.x1;
    return arc(b);
  }

  return tween;
}


function arcTweenText(a, i) {

  var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);
  function tween(t) {
    var b = oi(t);
    return "translate(" + arc.centroid(b) + ")rotate(" + computeTextRotation(b) + ")";
  }
  return tween;
}

function computeTextRotation(d) {
  var angle = (d.x0 + d.x1) / Math.PI * 90;

  // Avoid upside-down labels
  return (angle < 120 || angle > 270) ? angle : angle + 180;  // labels as rims
  //return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
}

const renderSunburst = nodeData => {
  console.log(nodeData);
  // Variables
  let width = 800;
  let height = 800;
  let radius = Math.min(width, height) / 2;
  var sizeIndicator = "size";
  var colorIndicator = "sentiment";

  const dark = [
    '#B08B12',
    '#BA5F06',
    '#8C3B00',
    '#6D191B',
    '#842854',
    '#5F7186',
    '#193556',
    '#137B80',
    '#144847',
    '#254E00'
  ];

  const mid = [
    '#E3BA22',
    '#E58429',
    '#BD2D28',
    '#D15A86',
    '#8E6C8A',
    '#6B99A1',
    '#42A5B3',
    '#0F8C79',
    '#6BBBA1',
    '#5C8100'
  ];

  const light = [
    '#F2DA57',
    '#F6B656',
    '#E25A42',
    '#DCBDCF',
    '#B396AD',
    '#B0CBDB',
    '#33B6D0',
    '#7ABFCC',
    '#C8D7A1',
    '#A0B700'
  ];

  const palettes = [light, mid, dark];
  const lightGreenFirstPalette = palettes
    .map(d => d.reverse())
    .reduce((a, b) => a.concat(b));

  const color = d3.scaleOrdinal(lightGreenFirstPalette);

   // Size our <svg> element, add a <g> element, and move translate 0,0 to the center of the element.
  let g = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  // Create our sunburst data structure and size it.
  let partition = d3.partition()
    .size([2 * Math.PI, radius]);

  // Find the root node, calculate the node.value, and sort our nodes by node.value
  let root = d3.hierarchy(nodeData)
    .sum(function (d) { return d.size })
    .sort(function (a, b) { return b.value - a.value; });

   // Calculate the size of each arc; save the initial angles for tweening.
  partition(root);
  let arc = d3.arc()
    .startAngle(function (d) { return d.x0 })
    .endAngle(function (d) { return d.x1 })
    .innerRadius(function (d) { return d.y0 })
    .outerRadius(function (d) { return d.y1 });

  // Put it all together
  let slice = g.selectAll('g')
    .data(root.descendants())
    .enter().append('g').attr("class", "node");
    // .attr("display", function (d) { return d.depth ? null : "none"; })
    // .attr("d", arc)
    // .style('stroke', '#fff')
    // .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); });
  // Append <path> elements and draw lines based on the arc calculations. Last, color the lines and the slices.
  slice.append('path').attr("display", function (d) { return d.depth ? null : "none"; })
    .attr("d", arc)
    .style('stroke', '#fff')
    .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); });


  // Populate the <text> elements with our data-driven titles.
  slice.append("text")
    .attr("transform", function (d) {
      return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")";
    })
    .attr("dx", "-20")
    .attr("dy", ".5em")
    .text(function (d) { return d.parent ? d.data.name : "" });

  // Redraw the Sunburst Based on User Input
  d3.selectAll(".sizeSelect").on("click", function (d, i) {

    // Determine how to size the slices.
    if (this.value === "size") {
      root.sum(function (d) { return d.size; });
    } else {
      root.count();
    }

    partition(root);

    slice.selectAll("path").transition().duration(750).attrTween("d", arcTweenPath);
    slice.selectAll("text").transition().duration(750).attrTween("transform", arcTweenText);
  });

  // g.selectAll(".node")
  //   .append("text")
  //   .attr("transform", function (d) {
  //     return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")";
  //   })
  //   .attr("dx", "-20") // radius margin
  //   .attr("dy", ".5em") // rotation align
  //   .text(function (d) { return d.parent ? d.data.name : "" });
 
  
};

export default renderSunburst;