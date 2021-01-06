import { BarChartConfig } from '../../graph-configuration';
import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from "d3-tip";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.css']
})
export class BarchartComponent implements OnInit {

  @Input() config: BarChartConfig;
  @Input() events: Observable<BarChartConfig>;

  private width: number;
  private height: number;

  private formatDecimal = d3.format(".4f");
  private formatString = function(d) {
                          return d.replace(/_/g, ' ');
                         }
  private color = d3.scaleOrdinal(d3.schemeCategory10);

  private x;
  private y;
  private g;
  private svg;
  private xAxis;
  private yAxis;
  private tip;

  constructor() {
    this.tip = d3Tip().attr('class', 'd3-tip')
                      .offset([-10, 0])
                      .html(d => this.formatDecimal(d.weight));
  }

  ngOnInit(): void {
    let parameters = this.config.dataset.map(row => row.parameter);
    this.color.domain(parameters);

    this.configuration();
    this.setScales();
    this.createSVGobject();
    this.setDomains();
    this.createAxis();
    this.createBarChart();

    this.events.subscribe((data) => {
      this.config = data;
      this.updateBarChart();
    });
  }

  /**
   * Configuration of the svg elements
   */
  private configuration(): void {
    this.width = this.config.width - this.config.marginLeft - this.config.marginRight;
    this.height = this.config.height - this.config.marginTop - this.config.marginBottom;
  }

  /**
   * Set the scales of x and y
   */
  private setScales(): void {
    this.x = d3.scaleBand()
               .range([0, this.width]);
    this.y = d3.scaleLinear()
               .range([this.height, 0]);
  }

  /**
   * Set the scales of x and y
   */
  private createSVGobject(): void {
    this.svg = d3.select("#bar-chart-svg")
               .attr("width", this.config.width)
               .attr("height", this.config.height-10);
    this.g = this.svg.append('g')
               .attr('transform',
                     'translate(' + this.config.marginLeft + ','
                     + this.config.marginTop + ')');
  }

  /**
   * Set the domains of x and y
   */
  private setDomains(): void {
    let parameters = this.config.dataset.map(row => row.parameter);
    let coefs = this.config.dataset.map(d => d.weight);

    this.x.domain(parameters);
    this.y.domain([d3.min(coefs), d3.max(coefs)]);
  }

  /**
   * Create the x and y axis
   */
  private createAxis(): void {
    this.xAxis = d3.axisBottom(this.x).tickFormat(this.formatString);
    this.yAxis = d3.axisLeft(this.y);

    this.g.append("g")
          .attr("class", "axis x")
          .attr("transform", "translate(" + 0 + "," + this.height + ")")
          .call(this.xAxis)
          .selectAll("text")
          .attr("transform", "rotate(30) ")
          .style("text-anchor", "start")
          .style("fill", "black");

    this.g.append("text")
          .classed("xtitle", true)
          .attr("transform", "translate(" + (this.width/2) + " ," +  (this.height + 75) + ")")
          .style("text-anchor", "middle")
          .text("Parameters");

    this.g.append("g")
          .attr("class", "axis y")
          .call(this.yAxis)
          .selectAll("text")
          .style("fill", "black");

    this.g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -75)
          .attr("x", -(this.height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Coefficient");

    this.g.selectAll("line").style("stroke", "black");
    this.g.selectAll("path").style("stroke", "black");
  }

  /**
   * Create the barchart element
   */
  private createBarChart(): void {
    this.g.call(this.tip);

    this.g.append("text")
          .classed("title", true)
          .attr("x", (this.width / 2))             
          .attr("y", 0 - (this.config.marginTop / 2))
          .attr("text-anchor", "middle")  
          .style("font-size", "16px") 
          .style("text-decoration", "underline")  
          .text(this.config.title);

    let bars = this.g.selectAll(".bar")
                     .data(this.config.dataset)
                     .enter()
                     .append("rect")
                     .style("fill", d => this.color(d.parameter))
                     .attr("x", d => this.x(d.parameter))
                     .attr("width", this.x.bandwidth())
                     .attr("y",  d => { return this.height; })
                     .attr("height", 0);

    bars.transition()
        .duration(750)
        .delay(function (d, i) {
            return i * 150;
        })
        .attr("y",  d => {
          return this.y(d.weight);
        })
        .attr("height",  d => {
          return this.height - this.y(d.weight);
        });

    bars.on('mouseover', this.tip.show)
        .on('mouseout', this.tip.hide);
  }

  /**
   * Update the x axis
   */
  private updateAxis(): void {
    this.xAxis = d3.axisBottom(this.x).tickFormat(this.formatString);
    this.g.select('.x.axis')
          .call(this.xAxis)
          .selectAll("text")
          .attr("transform", "rotate(30) ")
          .style("text-anchor", "start")
          .style("fill", "black");
      
    this.g.selectAll("text.xtitle")
          .attr("transform", "translate(" + (this.width/2) + " ," +  (this.height + 75) + ")")
          .style("text-anchor", "middle");


    this.yAxis = d3.axisLeft(this.y);
    this.g.select('.y.axis')
          .call(this.yAxis)
          .selectAll("text")
          .style("fill", "black");
      
    this.g.selectAll("text.xtitle")
          .attr("transform", "translate(" + (this.width/2) + " ," +  (this.height + 75) + ")")
          .style("text-anchor", "middle");

    this.g.selectAll("line").style("stroke", "black");
    this.g.selectAll("path").style("stroke", "black");
  }

  /**
   * Update the barchart with the new data
   */
  private updateBarChart(): void {
    this.svg.attr("width", this.config.width)

    this.configuration();
    this.setScales();
    this.setDomains();

    this.g.selectAll("text.title")
          .attr("x", (this.width / 2))
          .text(this.config.title);
    
    this.updateAxis();
      
    var bars = this.g.selectAll("rect")
                     .remove()
                     .exit()
                     .data(this.config.dataset)
                     .enter()
                     .append("rect")
                     .style("fill", d => this.color(d.parameter))
                     .attr("x", d =>  this.x(d.parameter))
                     .attr("width", this.x.bandwidth())
                     .attr("y",  d => { return this.height; })
                     .attr("height", 0);
  
    bars.transition()
        .duration(1000)
        .delay(function (d, i) {
            return i * 150;
        })
        .attr("y",  d => { return this.y(d.weight); })
        .attr("height",  d => { return this.height - this.y(d.weight); });
  
    bars.on('mouseover', this.tip.show)
        .on('mouseout', this.tip.hide);
  }
}
