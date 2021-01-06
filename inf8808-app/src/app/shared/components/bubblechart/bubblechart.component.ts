import { Component, OnInit, Input } from '@angular/core';
import { ClusteringConfig } from '../../graph-configuration';
import { legendColor } from 'd3-svg-legend'
import { Observable } from 'rxjs';
import * as d3 from 'd3';
import d3Tip from "d3-tip";

interface Selections {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-bubblechart',
  templateUrl: './bubblechart.component.html',
  styleUrls: ['./bubblechart.component.css']
})
export class BubblechartComponent implements OnInit {

  @Input() config: ClusteringConfig;
  @Input() events: Observable<ClusteringConfig>;

  private svg;
  private g;
  private x;
  private y;
  private r;
  private myColor;
  private tip;
  private width: number;
  private height: number;

  public regions: Selections[] = [
    {value: 'Global_Sales', viewValue: 'Global'},
    {value: 'NA_Sales', viewValue: 'North America'},
    {value: 'EU_Sales', viewValue: 'Europe'},
    {value: 'JP_Sales', viewValue: 'Japan'},
    {value: 'Other_Sales', viewValue: 'Other'},
  ]
  public selectedValue: string;

  constructor() {
    this.selectedValue = 'Global_Sales';
  }

  ngOnInit(): void {
    this.configuration();
    this.createSVGobject();
    this.setScaleDomain();
    this.createTooltip();
    this.createBubbleChart();
    this.addLegend();

    this.events.subscribe((data) => {
      this.config = data;
      this.configuration();
      this.updateScale();
      this.updateBubbleChart();
    });
  }

  private configuration(): void {
    this.width = this.config.width - this.config.marginLeft - this.config.marginRight;
    this.height = this.config.height - this.config.marginTop - this.config.marginBottom;
  }

  private createSVGobject(): void {
    this.svg = d3.select("#bubble-chart")
                  .append("svg")
                  .attr("width", this.config.width)
                  .attr("height", this.config.height)
                  .call(d3.zoom().on("zoom", d => {
                    this.g.attr("transform", d3.event.transform)
                  }));

    this.g = this.svg.append("g")
                     .attr("transform", "translate(" + this.config.marginLeft + "," + this.config.marginTop + ")");
  }

  private setScaleDomain(): void {
    let xValues = this.config.dataset.map(row => row.x);
    this.x = d3.scaleLinear().range([0, this.width]);
    this.x.domain([d3.min(xValues), d3.max(xValues)]);

    let yValues = this.config.dataset.map(row => row.y);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.y.domain([d3.min(yValues), d3.max(yValues)]);

    let rValues = this.config.dataset.map(row => row[this.selectedValue]);
    this.r = d3.scaleLinear().range([2, 40]);
    this.r.domain([d3.min(rValues), d3.max(rValues)]);

    let colorValues = this.config.dataset.map(row => row.Genre);
    colorValues = [...new Set(colorValues)];
    this.myColor = d3.scaleOrdinal()
                     .domain(colorValues)
                     .range(d3.schemeSet3);
  }

  private createTooltip(): void {
    this.tip = d3Tip().attr('class', 'd3-tip')
                      .offset([-10, 0])
                      .html(d => "Game: " + d.Name);
  }

  private createBubbleChart(): void {
    this.g.call(this.tip);
    this.g.append('g')
          .selectAll('dot')
          .data(this.config.dataset)
          .enter()
          .append('circle')
          .attr('class', 'bubbles')
          .attr('id', function(d){
            let name = d.Name.replace(/\s/g, '').replace(':', '').replace("'", '');
            let platform = d.Platform.replace(/\s/g, '');
            return 'name' + name + platform;
          })
          .attr('cx', d => this.x(d.x))
          .attr('cy', d => this.y(d.y))
          .attr('r', d => this.r(d[this.config.radiusParameter]))
          .style('fill', d => this.myColor(d.Genre))
          .style('fill-opacity', 0.8)
          .style('stroke', 'black')
          .style('stroke-width', 0.1)
          .on('mouseover', this.tip.show)
          .on('mouseout', this.tip.hide);
  }

  private addLegend(): void {
    let widthLegend: number = window.innerWidth - 750

    let svg = d3.select("#Legend")
                .attr('width', widthLegend)
                .style("fill", "white");

    let legend = legendColor()
                  .orient('horizontal')
                  .shapeWidth(Math.floor(widthLegend/12.5))
                  .shapeHeight(10)
                  .scale(this.myColor)

    svg.append('g').attr("transform", "translate(0,0)").call(legend);
  }

  private transition() {
    let rValues = this.config.dataset.map(row => row[this.selectedValue]);
    this.r = d3.scaleLinear().range([2, 40]);
    this.r.domain([d3.min(rValues), d3.max(rValues)]);

    this.g.selectAll("circle")
          .data(this.config.dataset)
          .transition()
          .duration(1000)
          .attr('id', function(d){
            let name = d.Name.replace(/\s/g, '').replace(':', '').replace("'", '');
            let platform = d.Platform.replace(/\s/g, '');
            return 'name' + name + platform;
          })
          .attr('cx', d => this.x(d.x))
          .attr('cy', d => this.y(d.y))
          .attr("r", d => this.r(d[this.selectedValue]));
  }

  public onRegionSelection(value): void {
    this.selectedValue = value;
    this.transition();
  }

  private updateScale(): void {
    this.x.range([0, this.width]);
    this.y.range([this.height, 0]);
  }

  private updateBubbleChart(): void {
    this.svg.attr("width", this.config.width)
            .attr("height", this.config.height);

    this.transition();
  }

  public zoomGame(value: string): void {
    let index: number = parseInt(value);
    let x = this.config.dataset[index].x;
    let y = this.config.dataset[index].y;
    let name = this.config.dataset[index].Name;
    let platform = this.config.dataset[index].Platform;
    name = name.replace(/\s/g, '').replace(':', '').replace("'", '');
    platform = platform.replace(/\s/g, '');

    this.g.selectAll('circle').classed('unselected', false);
    this.g.selectAll('circle').classed('selected', false);

    this.svg.call(d3.zoom().on("zoom", d => {this.g.attr("transform", d3.event.transform) }).transform, 
    d3.zoomIdentity.scale(20).translate(-this.x(x) + this.width/40, -this.y(y) + this.height/47));

    this.g.selectAll('circle').classed('unselected', true);
    this.g.select('#name' + name + platform)
          .classed('unselected', false)
          .classed('selected', true);

  }
}
