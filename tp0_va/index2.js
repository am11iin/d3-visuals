
const main = (container) => {
  const data_csv = d3.csv('./us-cities.csv');
  console.log(data_csv);

  data_csv.then((data) => {
    console.log(data.length);

    const dataset = data.map((d) => ({
      place: d.place,
      population: Number(d.population)
    })).sort((a, b) => b.population - a.population);

    console.log(dataset);

    const svg = d3.select(container)
                  .selectAll('svg')
                  .data([null])
                  .join('svg')
                  .attr('width', 960)
                  .attr('height', 40 + dataset.length * 24 + 12);

    svg.style('background', 'white');

    const width = Number(svg.attr('width'));
    const height = Number(svg.attr('height'));

    const rowHeight = 24;
    const top = 40;
    const barStart = 420; 
    const barWidth = 420;

    const x = d3.scaleLinear()
                .domain([0, d3.max(dataset, (d) => d.population)])
                .range([0, barWidth]);

    svg.append('text')
       .attr('x', 12)
       .attr('y', 25)
       .attr('font-size', 18)
       .attr('font-weight', 'bold')
       .text('US Cities by Population');

    const groups = svg.selectAll('g')
                      .data(dataset)
                      .join('g')
                      .attr('transform', (d, index) =>
                        `translate(0, ${top + index * rowHeight})`
                      );

    groups.append('text')
          .attr('x', 12)
          .attr('y', 16)
          .attr('font-size', '12px')
          .attr('fill', '#222')
          .text((d) => d.place);

    groups.append('rect')
          .attr('x', barStart)
          .attr('y', 4)
          .attr('width', (d) => x(d.population))
          .attr('height', 15)
          .attr('fill', '#287c7a');

    groups.append('text')
          .attr('x', (d) => barStart + x(d.population) + 6)
          .attr('y', 16)
          .attr('font-size', '11px')
          .attr('fill', '#222')
          .text((d) => d3.format(',')(d.population));
  });
}

const container = document.getElementById('container');
main(container);
