import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

export interface CorrMatrix {
  value: number;
  x: string;
  y: string;
}

export interface ScatterPlotData {
  'Critic_Count': number;
  'Critic_Score': number;
  'EU_Sales': number;
  'JP_Sales': number;
  'User_Score': number;
  'NA_Sales': number;
  'Other_Sales': number;
  'User_Count': number;
  'Year_of_Release': number;
}

@Injectable({
  providedIn: 'root'
})
export class CorrelationDataService {

  private PATH_DATA = ['assets/data/corr_matrix.csv', 'assets/data/videogames.csv'];

  public correlationData: Promise<CorrMatrix[]>;
  public scatterPlotData: Promise<ScatterPlotData[]>;

  constructor(private http: HttpClient) {
    this.correlationData = this.readData(this.PATH_DATA[0]);
    this.scatterPlotData = this.readScatterPlotData(this.PATH_DATA[1]);
  }

  private readData(path: string): Promise<CorrMatrix[]> {
    return this.http.get(path, { responseType: 'text' }).toPromise().then(results => {
      return d3.csvParse(results, function(d) {
        return {
          value: parseFloat(d.V),
          x: d.x,
          y: d.y
        }
      });
    });
  }

  private readScatterPlotData(path: string): Promise<ScatterPlotData[]> {
    return this.http.get(path, { responseType: 'text' }).toPromise().then(results => {
      return d3.csvParse(results, function(d) {
        return {
          'Critic_Count': parseFloat(d.Critic_Count),
          'Critic_Score': parseFloat(d.Critic_Score),
          'EU_Sales':parseFloat(d.EU_Sales),
          'JP_Sales': parseFloat(d.JP_Sales),
          'User_Score': parseFloat(d.User_Score),
          'NA_Sales': parseFloat(d.NA_Sales),
          'Other_Sales': parseFloat(d.Other_Sales),
          'User_Count': parseFloat(d.User_Count),
          'Year_of_Release': parseFloat(d.Year_of_Release),
        }
      })
    });
  }
}
