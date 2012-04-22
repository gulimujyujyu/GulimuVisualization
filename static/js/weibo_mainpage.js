/**
 * Created with PyCharm.
 * User: xlzhu
 * Date: 12-4-19
 * Time: 下午5:39
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function(){
  $('.dropdown-toggle').dropdown();
  $("#information").modal();
  $('div#information').modal('hide');
  $('.modal-footer a').click(function(){
    $(this).parent().parent().modal('hide');
  })
  //visualizaiton
  var day = d3.time.format("%w"),
      date = d3.time.format("%d"),
      week = d3.time.format("%U"),
      year = d3.time.format("%Y"),
      month = d3.time.format("%m"),
      format = d3.time.format("%a %b %e %H:%M:%S %Z %Y"),
      day_key = d3.time.format("%Y-%m-%d"),
      month_key = d3.time.format("%Y-%m");
  //Wed Apr 18 00:01:12 +0800 2012
  //%a %b %e %H:%M:%S %Z %Y

  var color = d3.scale.quantize().range(d3.range(11));
  var power_me = d3.scale.pow().exponent(.25);
  var current_date = new Date();
  current_date.setFullYear(year(current_date),month(current_date),0);
  var myDate = new Date();

  //day
  var day_view_option = {
    "m": [10, 10, 10, 20], // top right bottom left margin
    "w": $('#day_view').width() - 10 - 20, // - m[1] - m[3], // width
    "h": 5000 - 10 - 10, // - m[0] - m[2], // height
    "z": 20,
    "current_year": year(current_date),
    "current_month": month(current_date),
    "current_week": week(current_date),
    "current_day": date(current_date),
    "from_year": 2010,
    "from_month": 11,
    "from_week": 1,
    "from_day": 1,
    "label_offset": -40,
    "range": 11
  }

  var day_view = d3.select("#day_view")
      .append("svg")
      .attr("width",day_view_option.w)
      .attr("height", day_view_option.h)
      .attr("class","RdYlGn")
      .append("g")
      .attr("transform","translate(" +
      (day_view_option.m[3] + "," +
          (day_view_option.m[0] + ")")));

  var day_rect = day_view.selectAll("rect.day")
      .data(d3.time.days(
      new Date(day_view_option.from_year, day_view_option.from_month, day_view_option.from_day),
      new Date(day_view_option.current_year, day_view_option.current_month, 0)))
      .enter().append("rect")
      .attr("class","day")
      .attr("width",day_view_option.z)
      .attr("height",day_view_option.z)
      .attr("x", function(d){ return day(d)*day_view_option.z;})
      .attr("y", function(d){
        var tmp = 0;
        myDate.setFullYear(year(d)+1,11,31)
        if(day(myDate) == 6)
          tmp = -day_view_option.z;
        return tmp
            + (day_view_option.current_year-year(d))*53*day_view_option.z
            + (day_view_option.current_week-week(d))*day_view_option.z;})
      .datum(day_key)

  day_rect.append("title")
      .text( function(d){ return d+": 0";});

  var day_data = d3.nest()
      .key(function(d) { return day_key(new Date(d.created_at)); })
      .entries(Globals.weibo_data);

  day_data = d3.nest()
      .key(function(d) { return d.key; })
      .rollup(function(d){ return d[0].values.length; })
      .map(day_data);

  var day_data_min = d3.min(d3.values(day_data));
  var day_data_max = d3.max(d3.values(day_data));
  color.domain([power_me(day_data_min), power_me(day_data_max+1)]);
  day_rect.filter(function(d){return d in day_data;})
      .attr("class", function(d) {
        return "day q"+(day_view_option.range-1-color(power_me(day_data[d])))+"-"+day_view_option.range; })
      .on("click",function(d,idx){
        console.log('mouseclick start');
        $("table#weibo_table tbody tr").hide();
        $("table#weibo_table tbody tr.day_"+d).show();
        console.log('mouseclick process');
        $("#information").modal('show');
        console.log('mouseclick finished');
      })
      .select("title")
      .text( function(d){ return d+": "+day_data[d];});

  var monthPath = function(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = +day(t0), w0 = +week(t0),
        d1 = +day(t1), w1 = +week(t1);
    var tmp = 0;
    myDate.setFullYear(year(t0)+1,11,31)
    if(day(myDate) == 6)
      tmp = -day_view_option.z;
    var tmp_offset_y = tmp + (day_view_option.current_year-year(t0))*53*day_view_option.z
    return "M" + (d0) * day_view_option.z + "," + (tmp_offset_y + (day_view_option.current_week-w0+1)
        *day_view_option.z)
        + "V" + (tmp_offset_y + (day_view_option.current_week-w0)*day_view_option.z )+ "H" + 0
        + "V" + (tmp_offset_y + (day_view_option.current_week-w1)*day_view_option.z )+ "H" + (d1+1) *
        day_view_option.z
        + "V" + (tmp_offset_y + (day_view_option.current_week-w1+1)*day_view_option.z )+ "H" + 7 *
        day_view_option.z
        + "V" + (tmp_offset_y + (day_view_option.current_week-w0+1)*day_view_option.z )+ "H" + (d0) *
        day_view_option.z + "Z";
  }

  var day_month = day_view.selectAll("path.month")
      .data(function(d) { return d3.time.months(
          new Date(day_view_option.from_year, day_view_option.from_month, day_view_option.from_day),
          new Date(day_view_option.current_year, day_view_option.current_month-1, day_view_option.current_day))})
      .enter().append("path")
      .attr("class", "month")
      .attr("id", function(d){ return "day_view_"+month_key(d);})
      .attr("d", monthPath);

  var day_month_label = day_view.selectAll("text.month")
      .data(function(d) { return d3.time.months(
          new Date(day_view_option.from_year, day_view_option.from_month, day_view_option.from_day),
          new Date(day_view_option.current_year, day_view_option.current_month-1, day_view_option.current_day))})
      .enter().append("text")
      .attr("class", "month")
      .text(function(d){ return month_key(d); })
      .attr("transform", function(d){
        var tmp = 0;
        myDate.setFullYear(year(d)+1,11,31)
        if(day(myDate) == 6)
          tmp = -day_view_option.z;
        var offset_y = tmp+day_view_option.label_offset
            + (day_view_option.current_year-year(d))*53*day_view_option.z
            + (day_view_option.current_week-week(d))*day_view_option.z;
        return "translate(-6," + offset_y + ")rotate(-90)";
      })
      .attr("text-anchor", "middle");

  //month
  current_date.setFullYear(parseInt(year(current_date))+1,0,0);
  console.log(current_date);
  var month_view_option = {
    "m": [10, 0, 10, 20], // top right bottom left margin
    "w": $('#month_view').width() - 0 - 20, // - m[1] - m[3], // width
    "h": 5000 - 10 - 10, // - m[0] - m[2], // height
    "cw": 20,
    "ch": 20,
    "current_year": year(current_date),
    "current_month": month(current_date),
    "current_week": week(current_date),
    "current_day": date(current_date),
    "from_year": 2010,
    "from_month": 12,
    "from_week": 1,
    "from_day": 1,
    "label_offset": 100,
    "nav_offset": 10,
    "year_nav_offset": 60,
    "range": 11
  }

  var month_view = d3.select("#month_view")
      .append("svg")
      .attr("width",month_view_option.w)
      .attr("height", month_view_option.h)
      .attr("class","RdYlGn")
      .append("g")
      .attr("transform","translate(" +
      (month_view_option.m[3] + "," +
          (month_view_option.m[0] + ")")));


  var month_rect = month_view.selectAll("rect.month")
      .data(d3.time.months(
      new Date(month_view_option.from_year, month_view_option.from_month, month_view_option.from_day),
      new Date(month_view_option.current_year, month_view_option.current_month-1, month_view_option.current_day)))
      .enter().append("rect")
      .attr("class","month")
      .attr("width",month_view_option.cw)
      .attr("height",month_view_option.ch)
      .attr("x", function(d){ return 0;})
      .attr("y", function(d){
        return (month_view_option.current_year-year(d))*12*month_view_option.ch
            + (month_view_option.current_month-month(d))*month_view_option.ch;})
      .datum(month_key)
      .on("click", function(d,idx){
        var idd = "path#day_view_"+d;
        console.log(idd);
        d3.selectAll(idd)
            .transition()
            .duration(500)
            .style("stroke-width", "5px")
            .style("stroke", "blue")
            .each("end", function(){
              d3.select(this)
                  .transition()
                  .duration(500)
                  .style("stroke-width", "2px")
                  .style("stroke", "#000");
            });
        var val = 0;
        if($(idd).size() > 0) {
          val = $(idd).offset().top;
        }
        $("#vertical_nav").animate({
          paddingTop: val - parseInt($('div#information_hint').height()) - parseInt($('body').css('paddingTop'))
        },'slow');

        $('body').animate({
              scrollTop: val - parseInt($('body').css('paddingTop')) - month_view_option.nav_offset
            },
            'slow'
        );
        $("table#weibo_table tbody tr").hide();
        $("table#weibo_table tbody tr.month_"+d).show();
        //$("#information").modal('show');
      });

  month_rect.append("title")
      .text( function(d){ return d+": 0";});

  var month_data = d3.nest()
      .key(function(d) { return month_key(new Date(d.created_at)); })
      .entries(Globals.weibo_data);

  month_data = d3.nest()
      .key(function(d) { return d.key; })
      .rollup(function(d){ return d[0].values.length; })
      .map(month_data);

  var month_data_min = d3.min(d3.values(month_data));
  var month_data_max = d3.max(d3.values(month_data))+1;
  color.domain([power_me(month_data_min), power_me(month_data_max)]);
  month_rect.filter(function(d){return d in month_data;})
      .attr("class", function(d) { console.log(d);console.log(color(power_me(month_data[d])));
        return "day q"+(month_view_option.range-1-color(power_me((month_data[d]))))+"-"+month_view_option.range; })
      .select("title")
      .text( function(d){ return d+": "+month_data[d];});

  var yearPath = function(t0) {
    var t1 = new Date(t0.getFullYear()+1, t0.getMonth(), 0),
        m0 = month(t0),
        m1 = month(t1),
        offset_y = (month_view_option.current_year-year(t0))*12,
        offset_m0 = (month_view_option.current_month-m0),
        offset_m1 = (month_view_option.current_month-m1);
    return "M" + 0 + "," + (offset_m0 + offset_y+1)*month_view_option.ch
        + "V" + (offset_m1 + offset_y )*month_view_option.ch + "H" + 1*month_view_option.cw
        + "V" + (offset_m0 + offset_y+1)*month_view_option.ch + "H" + 0 +"Z";
  }

  var month_year = month_view.selectAll("path.year")
      .data(function(d) { return d3.time.years(
          new Date(month_view_option.from_year, month_view_option.from_month, month_view_option.from_day),
          new Date(month_view_option.current_year, month_view_option.current_month-1,
              month_view_option.current_day))})
      .enter().append("path")
      .attr("class", "year")
      .attr("d", yearPath);

  var month_year_label = month_view.selectAll("text.year")
      .data(function(d) { return d3.time.years(
          new Date(month_view_option.from_year, month_view_option.from_month, month_view_option.from_day),
          new Date(month_view_option.current_year, month_view_option.current_month-1,
              month_view_option.current_day))})
      .enter().append("text")
      .attr("class","year")
      .text(function(d){ return year(d); })
      .attr("transform", function(d){
        var yy = month_view_option.label_offset + (month_view_option.current_year-year(d))*12*month_view_option.ch;
        return "translate(-6," + yy + ")rotate(-90)"
      })
      .attr("text-anchor", "middle");


  //reposts and replies matrix
  var rr_view_option = {
    "m": [40, 0, 10, 40], // top right bottom left margin
    "w": $('#rr_view').width() - 0 - 20, // - m[1] - m[3], // width
    "h": 5000 - 10 - 10, // - m[0] - m[2], // height
    "z": 20,
    "label_offset": 100,
    "nav_offset": 10,
    "range": 11
  }

  var rr_mat_z_max = 0;;
  var rr_mat = d3.nest()
      .key(function(d) { return +d.reposts_count; })
      .key(function(d) { return +d.comments_count; })
      .rollup(function(d) { if(rr_mat_z_max<(+d.length)) rr_mat_z_max = +d.length;
        return +d.length; })
      .entries(Globals.weibo_data);

  console.log(rr_mat_z_max);

  var rr_mat_marginal_x = d3.nest()
      .key(function(d) { return +d.reposts_count;})
      .rollup(function(d) { return +d[0].reposts_count})
      .map(Globals.weibo_data);

  var rr_mat_marginal_y = d3.nest()
      .key(function(d) { return +d.comments_count;})
      .rollup(function(d) { return +d[0].comments_count})
      .map(Globals.weibo_data);

  var rr_mat_x_max = d3.max(d3.values(rr_mat_marginal_x))+1;
  var rr_mat_y_max = d3.max(d3.values(rr_mat_marginal_y))+1;

  console.log(rr_mat_marginal_x);
  console.log(rr_mat_marginal_y);

  var rr_mat_draw = d3.range(rr_mat_y_max*rr_mat_x_max).map(function(d){
    return {x:d%rr_mat_x_max, y:parseInt(d/rr_mat_x_max), z:0};
  });
  rr_mat.forEach(function(d){
    d.values.forEach(function(dd){
      //console.log((+dd.key)*rr_mat_x_max+(+d.key));
      rr_mat_draw[(+dd.key)*rr_mat_x_max+(+d.key)].z = +dd.values;
    });
  });

  var rr_view = d3.select("#rr_view")
      .append("svg")
      .attr("width",rr_view_option.w)
      .attr("height", rr_view_option.h)
      .attr("class","RdYlGn")
      .append("g")
      .attr("transform","translate(" +
      (rr_view_option.m[3] + "," +
          (rr_view_option.m[0] + ")")));


  color.domain([power_me(0), power_me(rr_mat_z_max+1)]);
  var rr_rect = rr_view.selectAll("rect.rr")
      .data(rr_mat_draw)
      .enter().append("rect")
      .attr("class", function(d){
        if(+d.z!=0)
          return "rr q"+(rr_view_option.range-1-color(power_me(+d.z)))+"-"+rr_view_option.range;
        else
          return "rr";})
      .attr("width",rr_view_option.z)
      .attr("height",rr_view_option.z)
      .attr("x", function(d){ return d.x*rr_view_option.z;})
      .attr("y", function(d){ return d.y*rr_view_option.z;})
      .on("click", function(d){
        $("table#weibo_table tbody tr").hide();
        $("table#weibo_table tbody tr.rc_"+ d.x +".cc_"+ d.y).show();
        $("#information").modal('show');
      })
      .append("title")
      .text(function(d){ return "Reposts: "+ d.x+", Comments: " + d.y + " Counts: " + d.z;})

  rr_view.append("text")
      .attr("class","rr_title_x")
      .text("Reposts")
      .attr("transform",function(d){ return "translate(10,-20)";});

  rr_view.append("text")
      .attr("class","rr_title_y")
      .text("Comments")
      .attr("transform",function(d){ return "translate(-20,70)rotate(-90)";});

  rr_view.selectAll("text.rr_label_x")
      .data(d3.range(rr_mat_x_max))
      .enter().append("text")
      .attr("class","rr_label_x")
      .text(function(d){ return d;})
      .attr("transform",function(d){ return "translate(" + (d+.25)*rr_view_option.z + ",-6)";});

  rr_view.selectAll("text.rr_label_y")
      .data(d3.range(rr_mat_y_max))
      .enter().append("text")
      .attr("class","rr_label_x")
      .text(function(d){ return d;})
      .attr("transform",function(d){ return "translate(-6," + (d+.75)*rr_view_option.z + ")rotate(-90)";});

  console.log("Weibo Calendar: Finish");

});
