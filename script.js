let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
let req = new XMLHttpRequest();

let baseTemp;
let values;

let yScale;
let xScale;

let minYear;
let maxYear;

let width = 1200;
let height = 600;
let padding = 60;

let canvas = d3.select("#canvas");
canvas.attr('width', width);
canvas.attr('height', height);

let generateScales = () => {
    minYear = d3.min(values, (item) => item.year);
    maxYear = d3.max(values, (item) => item.year);

    xScale = d3.scaleLinear()
               .range([padding, width - padding])
               .domain([minYear, maxYear + 1]);

    yScale = d3.scaleBand()
               .range([padding, height - padding])
               .domain(d3.range(12));
}

let tooltip = d3.select('#tooltip');

let drawCells = () => {
    let numberOfYears = maxYear - minYear + 1;

    canvas.selectAll('rect')
          .data(values)
          .enter()
          .append('rect')
          .attr('class', 'cell')
          .attr('fill', (item) => {
              let variance = item.variance;
              if (variance <= -2) {
                  return 'SteelBlue';
              } else if (variance <= 0) {
                  return 'LightSteelBlue';
              } else if (variance < 1) {
                  return 'Orange';
              } else {
                  return 'Crimson';
              }
          })
          .attr('data-year', (item) => item.year)
          .attr('data-month', (item) => item.month - 1)
          .attr('data-temp', (item) => baseTemp + item.variance)
          .attr('height', yScale.bandwidth()) // Use yScale.bandwidth() for consistent cell height
          .attr('y', (item) => yScale(item.month - 1))
          .attr('width', (width - 2 * padding) / numberOfYears)
          .attr('x', (item) => xScale(item.year))
          .on('mouseover', (event, item) => {
              tooltip.transition()
                     .style('visibility', 'visible');

              let monthNames = [
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December'
              ];

              tooltip.text(item.year + ' ' + monthNames[item.month - 1]
                           + ' - ' + (baseTemp + item.variance).toFixed(2) + '°C' + ' (' + item.variance.toFixed(2) + '°C)');
                tooltip.attr('data-year', item['year'])
          })
          .on('mouseout', () => {
              tooltip.transition()
                     .style('visibility', 'hidden');
          });
}

let drawAxes = () => {
    let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));

    let yAxis = d3.axisLeft(yScale).tickFormat((month) => {
        const date = new Date(0);
        date.setUTCMonth(month);
        return d3.timeFormat("%B")(date);
    });

    canvas.append('g')
          .call(xAxis)
          .attr('id', 'x-axis')
          .attr('transform', 'translate(0, ' + (height - padding) + ')');

    canvas.append('g')
          .call(yAxis)
          .attr('id', 'y-axis')
          .attr('transform', 'translate(' + padding + ', 0)');
}

req.open('GET', url, true);
req.onload = () => {
    let object = JSON.parse(req.responseText);
    baseTemp = object.baseTemperature;
    values = object.monthlyVariance;
    console.log(baseTemp);
    console.log(values);
    generateScales();
    drawAxes();
    drawCells();
}
req.send();
