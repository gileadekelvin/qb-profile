import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as Chartist from 'chartist';
import * as d3 from "d3";

declare var $: any;

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'dashboard-cmp',  
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  private svg: any;
  private line: any;
  public height: any;
  public width: any;
  public margin: any;
  
  public data: any;
  public selectedQB: any;

  private maxYds: any;
  private minYds: any;

  ngOnInit() {
    this.svg = d3.select("svg");

    this.margin = { top: 50, right: 0, bottom: 50, left: 50 }

    this.margin.right = parseInt(this.svg.style("width")) * 0.0445;
    this.margin.left = this.margin.right;

    this.width = parseInt(this.svg.style("width")) - this.margin.right;
    this.height = this.width * 0.4 - this.margin.bottom;

    this.svg.attr("height", this.width * 0.4);

    window.addEventListener("resize", () => {
      this.width = parseInt(this.svg.style("width")) - this.margin.left;
      this.height = this.width * 0.4 - this.margin.bottom;      

      this.svg.attr("height", this.width * 0.4);
      
      this.plot()   
    });

    this.plot()
  }


  plot() {
    this.plotLine();
  }

  async getData() {
    this.data = await d3.csv("https://raw.githubusercontent.com/gileadekelvin/qb-profile-data/master/players_wbw.csv", (d:any) => {      
      return {WK: d.WK, Game_Date: d.Game_Date, Opp: d.Opp, Result:d.Result, G: +d.G, GS: +d.GS, Comp: +d.Comp, Att:+d.Att, Pct:+d.Pct, Yds:d.Yds, Avg:+d.Avg, TD: +d.TD, Int: +d.Int, Sck:+d.Sck,SckY: +d.SckY, Rate:+d.Rate, AttR:+d.AttR, YdsR: +d.YdsR, AvgR: +d.AvgR, TDR: d.TDR, FUM:d.FUM, Lost:d.Lost,player:d.player,year:+d.year};
      });

    this.selectedQB = this.data.filter(function(d) { 
      if( d.player == "Tom Brady" && d.Game_Date !== "Bye"){ 
            return d;
        } 
    })    

    this.maxYds = d3.max(this.selectedQB, (d: any) => parseInt(d.Yds));
    this.minYds = d3.min(this.selectedQB, (d: any) => parseInt(d.Yds));

    console.log(this.data);
  }

  async plotLine() {
    this.svg.selectAll("*").remove();

    var n = 21;

    await this.getData();

    // Scales
    var xScale = d3.scaleLinear()
      .domain([1, 17]) // input
      .range([0, this.width]); // output
    
    var yScale = d3.scaleLinear()
      .domain([this.minYds, this.maxYds]) // input 
      .range([this.height, 0]); // output 

    // Data
    var dataset = d3.range(n).map(function (d) { return { "y": d3.randomUniform(1)() } })

    
    // line
    this.line = d3.line()
      .x(function (d: any) { return xScale(parseInt(d.WK)); }) // set the x values for the line generator
      .y(function (d: any) { return yScale(parseInt(d.Yds)); }) // set the y values for the line generator 
      .curve(d3.curveMonotoneX) // apply smoothing to the line

    this.svg = d3.select("svg");

    // Call the x axis in a group tag
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

    // Call the y axis in a group tag
    this.svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    // 9. Append the path, bind the data, and call the line generator 
    this.svg.append("path")
      .datum(this.selectedQB) // 10. Binds data to the line 
      .attr("class", "line") // Assign a class for styling 
      .attr("d", this.line); // 11. Calls the line generator 

    // 12. Appends a circle for each datapoint 
    this.svg.selectAll(".dot")
      .data(this.selectedQB)
      .enter().append("circle") // Uses the enter().append() method
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function (d: any) { return xScale(parseInt(d.WK)) })
      .attr("cy", function (d) { return yScale(parseInt(d.Yds)) })
      .attr("r", 5);
  }
}
