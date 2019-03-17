import * as d3 from 'd3';


// function arcTweenPath(a, i) {

//   var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);

//   function tween(t) {
//     var b = oi(t);
//     a.x0s = b.x0;
//     a.x1s = b.x1;
//     return arc(b);
//   }

//   return tween;
// }


// function arcTweenText(a, i) {

//   var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);
//   function tween(t) {
//     var b = oi(t);
//     return "translate(" + arc.centroid(b) + ")rotate(" + computeTextRotation(b) + ")";
//   }
//   return tween;
// }

// function computeTextRotation(d) {
//   var angle = (d.x0 + d.x1) / Math.PI * 90;

//   // Avoid upside-down labels
//   return (angle < 120 || angle > 270) ? angle : angle + 180;  // labels as rims
//   //return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
// }




const renderSunburst = nodeData => {
  console.log(nodeData);

  const width = window.innerWidth,
    height = window.innerHeight,
    maxRadius = Math.min(width, height) / 2 - 5;

  const formatNumber = d3.format(',d');

  const x = d3
    .scaleLinear()
    .range([0, 2 * Math.PI])
    .clamp(true);

  const y = d3.scaleSqrt().range([maxRadius * 0.1, maxRadius]);

  // sunlight style guide network colors
  // https://github.com/amycesal/dataviz-style-guide/blob/master/Sunlight-StyleGuide-DataViz.pdf
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

  const partition = d3.partition();

  const arc = d3
    .arc()
    .startAngle(d => x(d.x0))
    .endAngle(d => x(d.x1))
    .innerRadius(d => Math.max(0, y(d.y0)))
    .outerRadius(d => Math.max(0, y(d.y1)));

  const middleArcLine = d => {
    const halfPi = Math.PI / 2;
    const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

    const middleAngle = (angles[1] + angles[0]) / 2;
    const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
    if (invertDirection) {
      angles.reverse();
    }

    const path = d3.path();
    path.arc(0, 0, r, angles[0], angles[1], invertDirection);
    return path.toString();
  };

  const textFits = d => {
    const CHAR_SPACE = 6;

    const deltaAngle = x(d.x1) - x(d.x0);
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
    const perimeter = r * deltaAngle;

    return d.data.name.length * CHAR_SPACE < perimeter;
  };

  const svg = d3
    .select('body')
    .append('svg')
    .style('width', '100vw')
    .style('height', '100vh')
    .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
    .on('click', () => focusOn()); // Reset zoom on canvas click
  

  let root = d3.hierarchy(nodeData)
  .sum(function (d) { return d.size })

  const slice = svg.selectAll('g.slice').data(partition(root).descendants());

  slice.exit().remove();

  const newSlice = slice
    .enter()
    .append('g')
    .attr('class', 'slice')
    .on('click', d => {
      d3.event.stopPropagation();
      focusOn(d);
    });

  newSlice
    .append('title')
    .text(d => d.data.name + '\n' + formatNumber(d.value));

  newSlice
    .append('path')
    .attr('class', 'main-arc')
    .style('fill', d => color((d.children ? d : d.parent).data.name))
    .attr('d', arc);

  newSlice
    .append('path')
    .attr('class', 'hidden-arc')
    .attr('id', (_, i) => `hiddenArc${i}`)
    .attr('d', middleArcLine);

  const text = newSlice
    .append('text')
    .attr('display', d => (textFits(d) ? null : 'none'));

  // Add white contour
  text
    .append('textPath')
    .attr('startOffset', '50%')
    .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
    .text(d => d.data.name)
    .style('fill', 'none')
    .style('stroke', '#E5E2E0')
    .style('stroke-width', 12)
    .style('stroke-linejoin', 'round');

  text
    .append('textPath')
    .attr('startOffset', '50%')
    .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
    .text(d => d.data.name);

  function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
    // Reset to top-level if no data point specified

    const transition = svg
      .transition()
      .duration(750)
      .tween('scale', () => {
        const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
          yd = d3.interpolate(y.domain(), [d.y0, 1]);
        return t => {
          x.domain(xd(t));
          y.domain(yd(t));
        };
      });

    transition.selectAll('path.main-arc').attrTween('d', d => () => arc(d));

    transition
      .selectAll('path.hidden-arc')
      .attrTween('d', d => () => middleArcLine(d));

    transition
      .selectAll('text')
      .attrTween('display', d => () => (textFits(d) ? null : 'none'));

    moveStackToFront(d);

    //

    function moveStackToFront(elD) {
      svg
        .selectAll('.slice')
        .filter(d => d === elD)
        .each(function (d) {
          this.parentNode.appendChild(this);
          if (d.parent) {
            moveStackToFront(d.parent);
          }
        });
    }
  }

};

export default renderSunburst;


// Variables
// let width = 800;
// let height = 800;
// let radius = Math.min(width, height) / 2;
// var sizeIndicator = "size";
// var colorIndicator = "sentiment";

// const dark = [
//   '#B08B12',
//   '#BA5F06',
//   '#8C3B00',
//   '#6D191B',
//   '#842854',
//   '#5F7186',
//   '#193556',
//   '#137B80',
//   '#144847',
//   '#254E00'
// ];

// const mid = [
//   '#E3BA22',
//   '#E58429',
//   '#BD2D28',
//   '#D15A86',
//   '#8E6C8A',
//   '#6B99A1',
//   '#42A5B3',
//   '#0F8C79',
//   '#6BBBA1',
//   '#5C8100'
// ];

// const light = [
//   '#F2DA57',
//   '#F6B656',
//   '#E25A42',
//   '#DCBDCF',
//   '#B396AD',
//   '#B0CBDB',
//   '#33B6D0',
//   '#7ABFCC',
//   '#C8D7A1',
//   '#A0B700'
// ];

// const palettes = [light, mid, dark];
// const lightGreenFirstPalette = palettes
//   .map(d => d.reverse())
//   .reduce((a, b) => a.concat(b));

// const color = d3.scaleOrdinal(lightGreenFirstPalette);

//  // Size our <svg> element, add a <g> element, and move translate 0,0 to the center of the element.
// let g = d3.select('svg')
//   .attr('width', width)
//   .attr('height', height)
//   .append('g')
//   .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

// // Create our sunburst data structure and size it.
// let partition = d3.partition()
//   .size([2 * Math.PI, radius]);

// // Find the root node, calculate the node.value, and sort our nodes by node.value
// let root = d3.hierarchy(nodeData)
//   .sum(function (d) { return d.size })
//   .sort(function (a, b) { return b.value - a.value; });

//  // Calculate the size of each arc; save the initial angles for tweening.
// partition(root);
// let arc = d3.arc()
//   .startAngle(function (d) { return d.x0 })
//   .endAngle(function (d) { return d.x1 })
//   .innerRadius(function (d) { return d.y0 })
//   .outerRadius(function (d) { return d.y1 });

// // Put it all together
// let slice = g.selectAll('g')
//   .data(root.descendants())
//   .enter().append('g').attr("class", "node");
//   // .attr("display", function (d) { return d.depth ? null : "none"; })
//   // .attr("d", arc)
//   // .style('stroke', '#fff')
//   // .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); });
// // Append <path> elements and draw lines based on the arc calculations. Last, color the lines and the slices.
// slice.append('path').attr("display", function (d) { return d.depth ? null : "none"; })
//   .attr("d", arc)
//   .style('stroke', '#fff')
//   .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); });


// // Populate the <text> elements with our data-driven titles.
// slice.append("text")
//   .attr("transform", function (d) {
//     return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")";
//   })
//   .attr("dx", "-20")
//   .attr("dy", ".5em")
//   .text(function (d) { return d.parent ? d.data.name : "" });

// // Redraw the Sunburst Based on User Input
// d3.selectAll(".sizeSelect").on("click", function (d, i) {

//   // Determine how to size the slices.
//   if (this.value === "size") {
//     root.sum(function (d) { return d.size; });
//   } else {
//     root.count();
//   }

//   partition(root);

//   slice.selectAll("path").transition().duration(750).attrTween("d", arcTweenPath);
//   slice.selectAll("text").transition().duration(750).attrTween("transform", arcTweenText);
// });

// g.selectAll(".node")
//   .append("text")
//   .attr("transform", function (d) {
//     return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")";
//   })
//   .attr("dx", "-20") // radius margin
//   .attr("dy", ".5em") // rotation align
//   .text(function (d) { return d.parent ? d.data.name : "" });