import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

export interface VideoGamesData {
  Name: string;
  Platform: string;
  Year_of_Release: number;
  Genre: string;
  Publisher: string;
  Global_Sales: number;
  NA_Sales: number;
  EU_Sales: number;
  JP_Sales: number;
  Other_Sales: number;
  Critic_Count: number;
  Critic_Score: number;
  User_Score: number;
  User_Count: number;
  Developer: string;
  Rating: string;
}

export interface PositionData {
  x: number,
  y: number
}

export interface ClusteringData {
  Name: string;
  Platform: string;
  Year_of_Release: number;
  Genre: string;
  Publisher: string;
  Global_Sales: number;
  NA_Sales: number;
  EU_Sales: number;
  JP_Sales: number;
  Other_Sales: number;
  Critic_Count: number;
  Critic_Score: number;
  User_Score: number;
  User_Count: number;
  Developer: string;
  Rating: string;
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClusteringDataService {

  public videogameData: Promise<VideoGamesData[]>;
  public clusteringData: Promise<PositionData[]>;

  constructor(private http: HttpClient) {
    this.videogameData = this.readVideoGameData();
    this.clusteringData = this.readClusteringData();

  }

  private readVideoGameData(): Promise<VideoGamesData[]> {
    const PATH = 'assets/data/videogames.csv';

    return this.http.get(PATH, { responseType: 'text' }).toPromise().then(results => {
      return d3.csvParse(results, function(d) {
        return {
          Name: d.Name,
          Platform: d.Platform,
          Year_of_Release: parseFloat(d.Year_of_Release),
          Genre: d.Genre,
          Publisher: d.Publisher,
          Global_Sales: parseFloat(d.Global_Sales),
          NA_Sales: parseFloat(d.NA_Sales),
          EU_Sales: parseFloat(d.EU_Sales),
          JP_Sales: parseFloat(d.JP_Sales),
          Other_Sales: parseFloat(d.Other_Sales),
          Critic_Count: parseFloat(d.Critic_Count),
          Critic_Score: parseFloat(d.Critic_Score),
          User_Score: parseFloat(d.User_Score),
          User_Count: parseFloat(d.User_Count),
          Developer: d.Developer,
          Rating: d.Rating
        }
      });
    });
  }

  private readClusteringData(): Promise<PositionData[]> {
    const PATH = 'assets/data/clustering.csv';

    return this.http.get(PATH, { responseType: 'text' }).toPromise().then(results => {
      return d3.csvParse(results, function(d) {
        return {
          x: parseFloat(d.X),
          y: parseFloat(d.Y)
        }
      });
    });
  }

}
