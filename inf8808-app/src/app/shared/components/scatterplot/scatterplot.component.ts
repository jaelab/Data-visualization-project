import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ScatterPlotConfig } from '../../graph-configuration';
import * as d3 from 'd3';

@Component({
  selector: 'app-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.css']
})
export class ScatterplotComponent implements OnInit {

  @Input() config: ScatterPlotConfig;
  @Input() events: Observable<ScatterPlotConfig>;

  private formatString = function(d) { return d.replace(/_/g, ' '); }
  
  private width;
  private height;

  private g;
  private x;
  private y;

  private data = [];

  constructor() { }

  ngOnInit(): void {
    this.configuration();
    this.setScale();
    this.createSVGElement();
    this.createAxis();
    this.createScatterPlot();
    this.addTitle();

    this.events.subscribe((data) => {
      this.config = data;
      this.configuration();
      this.updateDomain();
      this.updateAxis();
      this.updateScatterPlot();
    });
  }

  private configuration(): void {
    this.data = []   
    for (let i = 0; i < this.config.dataset.length; i++) {
      this.data.push({
        'x': this.config.dataset[i][this.config.axisXTitle],
        'y': this.config.dataset[i][this.config.axisYTitle],
      });
    }

    this.width = this.config.width - this.config.marginLeft - this.config.marginRight;
    this.height = this.config.height - this.config.marginTop - this.config.marginBottom;
  }

  private setScale(): void {
    this.x = d3.scaleLinear().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);

    let dataX = this.config.dataset.map(row => row[this.config.axisXTitle]);
    let dataY = this.config.dataset.map(row => row[this.config.axisYTitle]);
    this.x.domain([d3.min(dataX), d3.max(dataX)]);
    this.y.domain([d3.min(dataY), d3.max(dataY)]);
  }

  private createSVGElement(): void {
    this.g = d3.select("#scatter")
               .append("svg")
               .attr("width", this.config.width)
               .attr("height", this.config.height)
               .append("g")
               .attr("transform", "translate(" + 
                     this.config.marginLeft + ", " + this.config.marginTop + ")");
  }

  private createAxis(): void {
    let xAxis = d3.axisBottom(this.x);
    
    this.g.append("g")
          .attr("class", "axis x")
          .attr("transform", "translate(0," + this.height + ")")
          .call(xAxis)
          .selectAll("text")
          .style("fill", "black");

    this.g.append("text")
          .classed("xTitle", true)
          .attr("transform", "translate(" + (this.width/2) + " ," +  (this.height  + this.config.marginBottom) + ")")
          .style("text-anchor", "middle")
          .text(this.formatString(this.config.axisXTitle))
          .style("fill", "black");

    let yAxis = d3.axisLeft(this.y);     
    this.g.append("g")
          .attr("class", "axis y")
          .call(yAxis)
          .selectAll("text")
          .style("fill", "black");;

    this.g.append("text")
          .classed("yTitle", true)
          .attr("transform", "rotate(-90)")
          .attr("y", -this.config.marginLeft)
          .attr("x", -(this.height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text(this.formatString(this.config.axisYTitle))
          .style("fill", "black");
    
    this.g.selectAll("line").style("stroke", "black");
    this.g.selectAll("path").style("stroke", "black");
  }

  private createScatterPlot(): void {
    this.g.append("g")
          .selectAll("dot")
          .data(this.data)
          .enter()
          .append("circle")
          .attr("cx", d => this.x(d.x))
          .attr("cy", d => this.y(d.y))
          .attr("r", 1.5)
          .style("fill", "#6699FF");
  }

  private addTitle(): void {
    this.g.append("text")
          .classed("title", true)
          .attr("x", (this.width / 2))             
          .attr("y", 0 - (this.config.marginTop / 2))
          .attr("text-anchor", "middle")  
          .style("font-size", "16px") 
          .style("text-decoration", "underline")  
          .text(this.config.title)
          .style("fill", "black");
  }
  
  private updateDomain(): void {
    let dataX = this.config.dataset.map(row => row[this.config.axisXTitle]);
    let dataY = this.config.dataset.map(row => row[this.config.axisYTitle]);

    this.x.domain([d3.min(dataX), d3.max(dataX)]);
    this.y.domain([d3.min(dataY), d3.max(dataY)]);
  }

  private updateAxis() {
    let xAxis = d3.axisBottom(this.x);
    this.g.select('.x.axis')
          .call(xAxis)
          .selectAll("text")
          .style("fill", "black");

    this.g.selectAll("text.xTitle") 
          .text(this.formatString(this.config.axisXTitle));

    let yAxis = d3.axisLeft(this.y);
    this.g.select('.y.axis')
          .call(yAxis)
          .selectAll("text")
          .style("fill", "black");

    this.g.selectAll("text.yTitle") 
          .text(this.formatString(this.config.axisYTitle));
  }

  private updateScatterPlot(): void {
    this.g.selectAll("text.title") 
          .text(this.config.title);

    this.g.selectAll("circle").remove();
    this.createScatterPlot();

    this.g.selectAll("line").style("stroke", "black");
    this.g.selectAll("path").style("stroke", "black");
  }
}
