import { ParamWeight } from './../services/param-weight-data.service';
import { CorrMatrix, ScatterPlotData } from '../services/correlation-data.service';
import { ClusteringData, VideoGamesData } from '../services/clustering-data.service';
/**
 * All configuration parameters
 */
export interface BarChartConfig {
  width: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  marginRight: number;
  marginLeft: number;
  title: string;
  dataset: Array<ParamWeight>;
}

export interface HeatMapConfig {
  width: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  marginRight: number;
  marginLeft: number;
  dataset: Array<CorrMatrix>;
}

export interface ScatterPlotConfig {
  title: string;
  axisYTitle: string;
  axisXTitle: string;
  width: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  marginRight: number;
  marginLeft: number;
  dataset: Array<ScatterPlotData>;
}

export interface ClusteringConfig {
  width: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  marginRight: number;
  marginLeft: number;
  radiusParameter: string;
  dataset: Array<ClusteringData>;
}
