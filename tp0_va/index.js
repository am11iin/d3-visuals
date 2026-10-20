const main = (container) => {
  const data_csv = d3.csv('./us-cities.csv');
  console.log(data_csv);
  data_csv.then((data) => {
    console.log(data.length);
    const svg = d3.select(container)
                  .selectAll('svg')
                  .data([null])
                  .join('svg')
                  .attr('width', 960)
                  .attr('height', 500)
    svg.style('background', 'grey');

    const width = svg.attr('width');
    const height = svg.attr('height');
    const nbColumns = 15;
    const nbRows = 10;
    const spacingX = width / nbColumns;
    const spacingY = height / nbRows;
    
    const dataset = data.map((d, index) => ({
        x: (index % nbColumns) * spacingX + spacingX / 2,
        y: Math.floor(index / nbColumns) * spacingY + spacingY / 2,
        color: d.Hex,
        name: d.Name
      })
    )

    console.log(dataset);

    const groups = svg.selectAll('g')
                      .data(dataset)
                      .join('g')
                      .attr('transform', d => `translate(${d.x}, ${d.y})`)

    groups.append('circle')
        .attr('r', 12)
        .attr('fill', (d) => d.color)

    groups.append('text')
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '8px')
        .attr('fill', 'black')
        .text((d) => d.name)        
  })
}

const container = document.getElementById('container');
main(container);