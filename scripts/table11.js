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

 d3.csv("table11.csv").then(function(data) {
  console.log(data);
  var margin = ({top: 60, right: 0, bottom: 30, left: 40})

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

  var yz =  new Array(m);
  for(let i = 0;i < yz.length; i++){
    yz[i] = new Array(n);
  }


  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++){
      yz[i][j] = parseInt(data[i + data.length - m][col_use[j]])
    }
  }

  console.log(yz);

  var xz = d3.range(m)

  var y01z = d3.stack()
      .keys(d3.range(n))(yz) // stacked yz

  var yMax = d3.max(yz, function(y) { return d3.max(y); })
  var y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); })
  var colMax = new Array(n)
  for (let i = 0; i < n; ++i){
    colMax[i] = 0
    for (let j = 0; j < m; ++j){
      colMax[i] = Math.max(colMax[i], yz[j][i])
    }
  }
  console.log(colMax);
  var width = 500 - margin.left - margin.right
  var height = 300 - margin.top - margin.bottom

  var svg = d3.select("#table11")
              .append("svg")
              .attr('width', 500)
              .attr('height', 400);

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

  var color = d3.scaleSequential(d3.interpolateRdYlGn)
    .domain([0, 1])

  function map(i) {
    return (i+n)/(2*n);
  }

  var series = g.selectAll(".series")
                .data(y01z)
                .enter().append("g")
                .attr("fill", function(d, i) { return color(map(i)); });

  var rect = series.selectAll("rect")
                   .data(function(d) { return d; })
                   .enter().append("rect")
                   .attr("x", function(d, i) { return x(i); })
                   .attr("y", height)
                   .attr("width", x.bandwidth())
                   .attr("height", 0)
                   .on("mouseover",mouseover)// mouseover is defined below.
                   .on("mouseout",mouseout);

    var totalpie = d3.pie()(total)

   function mouseover(D, I){  // utility function to be called on mouseover.
       // filter for selected state.

       var id  = this.parentNode.__data__.key;
       var angmin = 0;
       var angmax = 0;
       console.log(id);
       console.log(I);
       for (let i = 0; i < I; ++i) {
         angmin = angmin + yz[i][id];
       }
       angmax = angmin + yz[I][id]
       var totalang = totalpie[id]["endAngle"] - totalpie[id]["startAngle"]
       var arc = d3.arc().outerRadius(pieDim.r - 10).innerRadius(40)
                   .startAngle(totalpie[id]["startAngle"] + totalang * angmin / total[id])
                   .endAngle(totalpie[id]["startAngle"] + totalang * angmax / total[id])
      console.log(total);
      console.log(angmin);
      console.log(angmax);
      console.log(totalang * angmin / total[id]);
      console.log(totalang * angmax / total[id]);

       var p = piesvg.append("path").attr("d", arc).attr("class", "new")
                     .style("fill", color(0.9 * map(id)))

      console.log(p);
   }

   function mouseout(D, I){    // utility function to be called on mouseout.
       // reset the pie-chart and legend.
       var p = piesvg.select(".new");
       p.remove();
   }

    var pC ={},    pieDim ={w:200, h: 200};
    pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
    var piesvg = d3.select("#table11").append("svg")
        .attr("class", "pie")
        .attr("width", pieDim.w).attr("height", pieDim.h)
        .append("g")
        .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");

    var arc = d3.arc().outerRadius(pieDim.r - 10).innerRadius(40)
                      .padAngle(.02)
                      //.padRadius(100)
                      .cornerRadius(4);
    var pie = d3.pie();
    piesvg.selectAll("path").data(pie(total)).enter().append("path").attr("d", arc)
        .style("fill", function(d, i) { return color(map(i)); })
        .on("mouseover",mouseoverp).on("mouseout",mouseoutp);

    function mouseoverp(D, I){
        // call the update function of histogram with new data.
        y.domain([0, colMax[I]]);
        console.log(colMax);
        yaxis.transition()
             .duration(500)
             .call(d3.axisLeft(y).tickSizeOuter(0).tickFormat((d, i) => d))

        function isEq(a, b){
          if (a == b) return 1;
          return 0;
        }

        // 为转换为簇状图添加过渡动画
        rect.transition()
            .duration(500)
            // 设置动画的延迟时间
            .delay(function(d, i) { return i * 100; })
            // 设置矩形条柱的y位置
            .attr("y", function(d, i) {
              if (this.parentNode.__data__.key < I) return y(0)
              return y(y01z[I][i][1] - y01z[I][i][0]);
            })
            // 设置矩形条柱的高度
            .attr("height", function(d, i) { return (y(0) - y(d[1] - d[0])) * isEq(I, this.parentNode.__data__.key); })
            .transition()
            .duration(500)
            // 设置动画的延迟时间
            .delay(function(d, i) { return i * 100; })
            // 设置动画结束时矩形条需要达到的x的位置
            .attr("x", function(d, i) { return x(i); })
            // 设置动画结束时矩形条需要达到的宽度
            .attr("width", x.bandwidth());
    }
    //Utility function to be called on mouseout a pie slice.
    function mouseoutp(d, i){
        // call the update function of histogram with all data.


      d3.select("input[value=\"stacked\"]")
        .property("checked", true)
        .dispatch("change")

    }



   var leg = {};

   // create table for legend.
   var legend = d3.select("#table11").append("table").attr('class','legend');

   // create one row per segment.
   var tr = legend.append("tbody").selectAll("tr").data(col_use).enter().append("tr");

   // create the first column for each segment.
   tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
       .attr("width", '16').attr("height", '16')
       .attr("fill", function(d, i) { return color(map(i)); })
       .on("mouseover",mouseoverp).on("mouseout",mouseoutp);

   // create the second column for each segment.
   tr.append("td").text(function(d){ return d;});








  rect.transition()
      .delay(function(d, i) { return i * 10; })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })


  d3.selectAll("input")
    .on("change", changed)

  // var timeout = d3.timeout(function() {
  //   d3.select("input[value=\"grouped\"]")
  //     .property("checked", true)
  //     .dispatch("change")
  // }, 2000)

  function changed() {
    //timeout.stop()
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
        .duration(500)
        // 设置动画的延迟时间
        .delay(function(d, i) { return i * 100; })
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
         .duration(1000)
         .call(d3.axisLeft(y).tickSizeOuter(0).tickFormat((d, i) => d))


    // 为转换为堆栈图添加过渡动画
    rect.transition()
        // 设置动画的持续时长
        .duration(1000)
        // 设置动画的延迟时间
        .delay(function(d, i) { return i * 10 + 500; })
        // 设置矩形条柱的y位置
        .attr("y", function(d) { return y(d[1]); })
        // 设置矩形条柱的高度
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .transition()
        .duration(500)
        // 设置动画的延迟时间
        .delay(function(d, i) { return i * 100; })
        // 设置动画结束时矩形条需要达到的x的位置
        .attr("x", function(d, i) { return x(i); })
        // 设置动画结束时矩形条需要达到的宽度
        .attr("width", x.bandwidth());
  }
 })
