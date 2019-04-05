import * as d3 from 'd3';

const renderSunburst = nodeData => {
  console.log(nodeData);

  let loader = document.getElementsByTagName("div")[13];
  loader.classList.remove('loader');

  const width = window.innerWidth,
    height = window.innerHeight,
    maxRadius = Math.min(width, height) / 2 - 5;

  const formatNumber = d3.format(',d');

  const x = d3
    .scaleLinear()
    .range([0, 2 * Math.PI])
    .clamp(true);

  const y = d3.scaleSqrt().range([maxRadius * 0.1, maxRadius]);

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


  const palettes = [dark];
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
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 7);
    const perimeter = (r * deltaAngle) - 3;

    return d.data.name.length * CHAR_SPACE < perimeter;
  };


  // define tooltip
  var tooltip = d3.select('body') // select element in the DOM with id 'chart'
    .append('div').classed('tooltip', true); // append a div element to the element we've selected    
  tooltip.append('div') // add divs to the tooltip defined above 
    .attr('class', 'label'); // add class 'label' on the selection                



  const svg = d3
    .select('svg')
    .style('width', '95vw')
    .style('height', '95vh')
    .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
    .on('click', () => focusOn()); // Reset zoom on canvas click


  let root = d3.hierarchy(nodeData)
  .sum(function (d) { return d.size; });

  const slice = svg.selectAll('g.slice').data(partition(root).descendants());

  slice.exit().remove();

  const newSlice = slice
    .enter()
    .append('g')
    .attr('class', 'slice')
    .on('mouseover', function (d) {
      var total = d.parent.value;
      tooltip.select('.label').html(d.data.name); // set current label                 
      tooltip.style('display', 'block'); // set display   
    })
    .on('mouseout', function () { // when mouse leaves div                        
      tooltip.style('display', 'none'); // hide tooltip for that element
    })
    .on('mousemove', function (d) { // when mouse moves                  
      tooltip.style('top', (d3.event.layerY + 10) + 'px'); // always 10px below the cursor
      tooltip.style('left', (d3.event.layerX + 10) + 'px'); // always 10px to the right of the mouse
    })
    .on('click', d => {
      d3.event.stopPropagation();
      focusOn(d);
    });

  newSlice
    .append("title")
    .text(d => d.data.name);

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
    .style('stroke-width', 13)
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


