// var svg = d3.select('body')
//             .append('svg')
//             .attr('width', window.innerWidth)
//             .attr('height', window.innerHeight);
//
// const margin = 60;
//
// var width = window.innerWidth - margin - margin;
// var height = window.innerHeight - margin - margin;
//
// var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
// var y = d3.scaleLinear().rangeRound([height, 0]);
//
//
// var g = svg.append('g')
//            .attr('transform', `translate(${margin}, ${margin})`);
//
// const data = [12, 15, 44, 24, 94, 35, 38, 59];
//
// x.domain([...Array(data.length).keys()]);
// y.domain([0, d3.max(data, (d) => d)]);
//
// g.append("g")
//  .attr("transform", `translate(0, ${height})`)
//  .call(d3.axisBottom(x));
//
//
//  g.append("g")
//   .call(d3.axisLeft(y))
//   .append("text")
//   .attr("fill", "#000")
//   .attr("transform", "rotate(-90)")
//   .attr("y", 6)
//   .attr("dy", "0.9em")
//   .attr("text-anchor", "end")
//   .text("Some Secret Value");
//
//   g.selectAll('.bar')
//    .data(data)
//    .enter()
//    .append('rect')
//    .attr('class', 'bar')
//    .attr("x", (_, i) => x(i))
//    .attr("y", (d) => y(d))
//    .attr("width", x.bandwidth())
//    .attr("height", (d) => height - y(d));


// function bumps(m) {
//   const values = [];
//
//   // Initialize with uniform random values in [0.1, 0.2).
//   for (let i = 0; i < m; ++i) {
//     values[i] = 0.1 + 0.1 * Math.random();
//   }
//
//   // Add five random bumps.
//   for (let j = 0; j < 5; ++j) {
//     const x = 1 / (0.1 + Math.random());
//     const y = 2 * Math.random() - 0.5;
//     const z = 10 / (0.1 + Math.random());
//     for (let i = 0; i < m; i++) {
//       const w = (i / m - y) * z;
//       values[i] += x * Math.exp(-w * w);
//     }
//   }
//
//   // Ensure all values are positive.
//   for (let i = 0; i < m; ++i) {
//     values[i] = Math.max(0, values[i]);
//   }
//
//   return values;
// }

 d3.csv("table12.csv").then(function(data) {
  console.log(data);
  var margin = ({top: 100, right: 100, bottom: 100, left: 100})

  const col_info = data['columns']
  const row_info = new Array(data.length)
  for (let i = 0; i < data.length; ++i){
    row_info[i] = data[i]['0']
  }

  const col_use = col_info.slice(2, col_info.length)
  const row_use = row_info.slice(1, row_info.length)
  console.log(col_use);
  console.log(row_use);
  var m = row_use.length
  var n = col_use.length

  var yz =  new Array(n);
  for(let i = 0;i < yz.length; i++){
    yz[i] = new Array(m);
  }


  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++){
      yz[j][i] = parseInt(data[i + data.length - m][col_use[j]])
    }
  }

  console.log(yz);

  var xz = d3.range(m)

  var y01z = d3.stack()
      .keys(d3.range(n))
      (d3.transpose(yz)) // stacked yz

  var yMax = d3.max(yz, function(y) { return d3.max(y); })
  var y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); })

  var svg = d3.select("svg")
              .attr('width', window.innerWidth)
              .attr('height', window.innerHeight);
  var width = svg.attr("width") - margin.left - margin.right
  var height = svg.attr("height") - margin.top - margin.bottom
  var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var x = d3.scaleBand()
            .domain(xz)
            .rangeRound([0, width])
            .padding(0.08)

  var y = d3.scaleLinear()
            .domain([0, y1Max])
            .range([height, 0])

  g.append("g")
   .attr("transform", `translate(0, ${height})`)
   .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat((d, i) => row_use[i]))
   .selectAll("text")
   .attr("class", "vertical-text")
   .attr("y", 0)
   .attr("dy", "1em")
   .style("text-anchor", "start");

  var yaxis = g.append("g")
               .call(d3.axisLeft(y).tickSizeOuter(0).tickFormat((d, i) => d))


  var total = Array(n)
  for (let i = 0; i < n; ++i){
    total[i] = parseInt(data[0][col_use[i]]);
  }
  var tMax = d3.max(total)

  var color = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, 1])

  var series = g.selectAll(".series")
                .data(y01z)
                .enter().append("g")
                .attr("fill", function(d, i) { return color((2*parseInt(data[0][col_use[i]]) + tMax) / (3*tMax)); });

  var rect = series.selectAll("rect")
                   .data(function(d) { return d; })
                   .enter().append("rect")
                   .attr("x", function(d, i) { return x(i); })
                   .attr("y", height)
                   .attr("width", x.bandwidth())
                   .attr("height", 0)

  rect.transition()
      .delay(function(d, i) { return i * 10; })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })


  d3.selectAll("input")
    .on("change", changed)

  var timeout = d3.timeout(function() {
    d3.select("input[value=\"grouped\"]")
      .property("checked", true)
      .dispatch("change")
  }, 2000)

  function changed() {
    timeout.stop()
     if (this.value === "grouped") transitionGrouped()
     else transitionStacked()
   }


   function transitionGrouped() {
    // 定义y的定义域
    y.domain([0, yMax]);

    yaxis.transition()
         .duration(500)
         .call(d3.axisLeft(y).tickSizeOuter(0).tickFormat((d, i) => d))


    // 为转换为簇状图添加过渡动画
    rect.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        // 计算每个矩形条柱的x位置
        .attr("x", function(d, i) { return x(i) + x.bandwidth() / n * this.parentNode.__data__.key; })
        // 设置矩形条柱的宽度，由于簇状图一组n个系列，因此计算矩形的宽度要除以n
        .attr("width", x.bandwidth() / n)
        .transition()
        // 设置矩形条柱的y位置
        .attr("y", function(d) { return y(d[1] - d[0]); })
        // 设置矩形条柱的高度
        .attr("height", function(d) { return y(0) - y(d[1] - d[0]); });
  }

  // 切换为堆栈图
  function transitionStacked() {
    // 切换y的定义域
    y.domain([0, y1Max]);

    yaxis.transition()
         .duration(500)
         .call(d3.axisLeft(y).tickSizeOuter(0).tickFormat((d, i) => d))


    // 为转换为堆栈图添加过渡动画
    rect.transition()
        // 设置动画的持续时长
        .duration(500)
        // 设置动画的延迟时间
        .delay(function(d, i) { return i * 10; })
        // 设置矩形条柱的y位置
        .attr("y", function(d) { return y(d[1]); })
        // 设置矩形条柱的高度
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .transition()
        // 设置动画结束时矩形条需要达到的x的位置
        .attr("x", function(d, i) { return x(i); })
        // 设置动画结束时矩形条需要达到的宽度
        .attr("width", x.bandwidth());
  }
 })
