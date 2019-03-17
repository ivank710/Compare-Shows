import * as d3 from 'd3';



const renderSunburst = nodeData => {
  console.log(nodeData);
  // Variables
  let width = 500;
  let height = 500;
  let radius = Math.min(width, height) / 2;
  // let color = d3.scaleOrdinal();

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

  // Create primary <g> element
  let g = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  // Data strucure
  let partition = d3.partition()
    .size([2 * Math.PI, radius]);

  // Find data root
  let root = d3.hierarchy(nodeData)
    .sum(function (d) { return d.size });

  // Size arcs
  partition(root);
  let arc = d3.arc()
    .startAngle(function (d) { return d.x0 })
    .endAngle(function (d) { return d.x1 })
    .innerRadius(function (d) { return d.y0 })
    .outerRadius(function (d) { return d.y1 });

  // Put it all together
  g.selectAll('path')
    .data(root.descendants())
    .enter().append('path')
    .attr("display", function (d) { return d.depth ? null : "none"; })
    .attr("d", arc)
    .style('stroke', '#fff')
    .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); });


 
  
};

export default renderSunburst;