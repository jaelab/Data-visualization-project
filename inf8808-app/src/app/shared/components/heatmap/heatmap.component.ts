import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HeatMapConfig } from '../../graph-configuration';
import * as d3 from 'd3';
import d3Tip from "d3-tip";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css']
})
export class HeatmapComponent implements OnInit {

  @Input() config: HeatMapConfig;
  @Input() events: Observable<HeatMapConfig>;
  @Output() displayPanel = new EventEmitter;

  private formatDecimal = d3.format(".4f");
  private formatString = function(d) { return d.replace(/_/g, ' '); }

  private svg;
  private g;
  private legendSVG;
  private x;
  private xLegend;
  private y;
  private colors;
  private tip;

  private attributesX: string[];
  private attributesY: string[];
  private width;
  private height;
  private legendHeight;
  private barHeight;
  private legendPadding;
  private innerWidth;

  constructor() {
    this.attributesX = ['Critic_Count', 'Critic_Score', 'EU_Sales','JP_Sales', 
                       'User_Score', 'NA_Sales', 'Other_Sales', 'User_Count'];
    this.attributesY = ['Critic_Score', 'EU_Sales','JP_Sales', 'User_Score', 'NA_Sales', 'Other_Sales', 'User_Count', 'Year_of_Release'];

    this.legendHeight = 28;
    this.barHeight = 8;
    this.legendPadding = 9;
  }

  ngOnInit(): void {
    this.configuration();
    this.setScales();
    this.createSVGobject();
    this.createLegendObject();
    this.createAxis();
    this.createHeatmap();
    this.addLegend();

    this.events.subscribe((data) => {
      this.config = data;

      this.configuration();
      this.setScales();
      this.updateHeatMap();
    });
  }

  private configuration(): void {
    this.width = this.config.width - this.config.marginLeft - this.config.marginRight;
    this.height = this.config.height - this.config.marginTop - this.config.marginBottom;

    this.innerWidth = this.width - (this.legendPadding * 2);
  }

  private setScales(): void {
    this.x = d3.scaleBand()
               .range([0, this.width])
               .domain(this.attributesX)
               .padding(0.01);

    this.y = d3.scaleBand()
              .range([this.height, 0 ])
              .domain(this.attributesY)
              .padding(0.01);

    this.colors = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]);
  }

  private createSVGobject(): void {
    this.svg = d3.select('#heatmap-svg')
               .append("svg")
               .attr("width", this.width + this.config.marginLeft + this.config.marginRight)
               .attr("height", this.height + this.config.marginTop + this.config.marginBottom);
    this.g = this.svg.append("g")
                     .attr("transform", "translate(" + this.config.marginLeft + "," + this.config.marginTop + ")");
  }

  private createAxis(): void {
    let xAxis = d3.axisBottom(this.x).tickFormat(this.formatString);
    this.g.append("g")
          .attr("class", "axis x")
          .attr("transform", "translate(0," + this.height + ")")
          .call(xAxis)
          .selectAll("text")
          .attr("transform", "rotate(30) ")
          .style("text-anchor", "start");

    let yAxis = d3.axisLeft(this.y).tickFormat(this.formatString);
    this.g.append('g')
          .attr("class", "axis y")
          .call(yAxis);
  }

  private createLegendObject(): void {
    this.legendSVG = d3.select("#legend-svg")
                       .append("svg")
                       .attr("width", this.width + this.config.marginLeft + this.config.marginRight)
                       .attr("height", this.legendHeight)
                       .append("g")
                       .attr("transform", "translate(" + (this.config.marginLeft + this.legendPadding) + ", 0)");
  }

  private createHeatmap(): void {
    this.tip = d3Tip().attr('class', 'd3-tip').offset([-10, 0]);
    this.tip.html(d => {
      return this.formatDecimal(d.value);
    });
    this.g.call(this.tip);

    let map = this.g.selectAll()
                    .data(this.config.dataset, d => {return d.x + ':' + d.y;})
                    .enter()
                    .append("rect")
                    .attr("x", d => { return this.x(d.x) })
                    .attr("y", d => { return this.y(d.y) })
                    .attr("width", this.x.bandwidth())
                    .attr("height", this.y.bandwidth())
                    .style("fill", d => { return this.colors(d.value)} )
                    .on("click", d => {
                      this.displayPanel.emit(d);
                    });

    map.on('mouseover', this.tip.show)
       .on('mouseout', this.tip.hide);
  }

  private createDataColor() {
    let data_colors = []
    let min = -1;
    for (let i=0; i<=8; i++){
        data_colors.push({
            "color": this.colors(min),
            "value": min
        });
        min += 0.25;
    }

    return data_colors
  }

  private addLegend(): void {
    let data_colors = this.createDataColor();

    let extent = d3.extent(data_colors, d => d.value);

    this.xLegend = d3.scaleLinear()
                     .range([0, this.innerWidth])
                     .domain(extent);

    let xTicks = data_colors.map(d => d.value);
    let xAxis = d3.axisBottom(this.xLegend)
                  .tickSize(this.barHeight * 1.5)
                  .tickValues(xTicks);

    this.legendSVG.append("g")
                  .call(xAxis)
                  .select(".domain")
                  .remove();

    var defs = this.legendSVG.append("defs");
    var linearGradient = defs.append("linearGradient")
                             .attr("id", "myGradient");
    linearGradient.selectAll("stop")
                  .data(data_colors)
                  .enter()
                  .append("stop")
                  .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
                  .attr("stop-color", d => d.color);

    this.legendSVG.append("rect")
                  .attr("width", this.innerWidth)
                  .attr("height", this.barHeight)
                  .style("fill", "url(#myGradient)");
  }

  private updateAxis(): void {
    let xAxis = d3.axisBottom(this.x);
    this.g.select('.x.axis')
          .attr("transform", "translate(0," + this.height + ")")
          .call(xAxis);

    let yAxis = d3.axisLeft(this.y);
    this.g.select('.y.axis')
          .call(yAxis);
  }

  private updateHeatMap(): void {
    this.svg.attr("width", this.config.width)
            .attr("height", this.config.height);
    
    this.updateAxis();

    let map = this.g.selectAll("rect")
                     .remove()
                     .exit()
                     .data(this.config.dataset)
                     .enter()
                     .append("rect")
                     .style("fill", d => this.colors(d.value))
                     .attr("x", d =>  this.x(d.x))
                     .attr("width", this.x.bandwidth())
                     .attr("y",  d => this.y(d.y))
                     .attr("height", this.y.bandwidth())
                     .on("click", d => {
                      this.displayPanel.emit(d);
                    });;

    map.on('mouseover', this.tip.show)
       .on('mouseout', this.tip.hide);
  }
}
