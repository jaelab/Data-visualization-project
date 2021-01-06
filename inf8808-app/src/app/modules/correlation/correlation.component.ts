import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HeatMapConfig, ScatterPlotConfig } from 'src/app/shared/graph-configuration';
import { CorrelationDataService } from 'src/app/services/correlation-data.service';
import { Subject } from 'rxjs';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-correlation',
  templateUrl: './correlation.component.html',
  styleUrls: ['./correlation.component.css']
})
export class CorrelationComponent implements AfterViewInit {

  public eventsSubject: Subject<ScatterPlotConfig> = new Subject<ScatterPlotConfig>();
  public hmEventsSubject: Subject<HeatMapConfig> = new Subject<HeatMapConfig>();

  public hmConfig: HeatMapConfig;
  public spConfig: ScatterPlotConfig;
  private innerWidth: number;
  private xSP: string;
  private ySP: string;

  private formatString = function(d) { return d.replace(/_/g, ' '); }

  constructor(private dataService: CorrelationDataService,
              private uiService: UiService) {
    this.innerWidth = window.innerWidth - 300;
    this.xSP = 'Critic_Count';
    this.ySP= 'Year_of_Release';
  }

  async ngAfterViewInit(): Promise<void> {
    this.configurationHeatmap();

    this.configurationScatterPlot(this.xSP, this.ySP);

    this.uiService.changeEmitted$.subscribe(async data => {
      data ? this.innerWidth = window.innerWidth - 300 : this.innerWidth = window.innerWidth;
      await this.configurationHeatmap();
      await this.configurationScatterPlot(this.xSP, this.ySP);

      this.hmEventsSubject.next(this.hmConfig);
      this.eventsSubject.next(this.spConfig);
    });
  }

  public async showScatterPlot(data): Promise<void> {
    await this.configurationScatterPlot(data.x, data.y);

    this.eventsSubject.next(this.spConfig);
  }

  /**
   * Configure all the heatmap parameters
   *
   */
  private configurationHeatmap(): void {
    this.dataService.correlationData.then(data => {
      this.hmConfig = {
        width: this.innerWidth*0.5,
        height: this.innerWidth*0.5-65,
        marginTop: 35,
        marginBottom: 85,
        marginRight: 100,
        marginLeft: 85,
        dataset: data
      };
    });
  }

  /**
   * Configure all the scatterplot parameters
   *
   */
  private configurationScatterPlot(x: string, y: string): void {
    this.xSP = x;
    this.ySP = y;
    this.dataService.scatterPlotData.then(data => {
      this.spConfig = {
        title: 'Correlation between ' + this.formatString(this.xSP) + " and " + this.formatString(this.ySP),
        axisYTitle: this.ySP,
        axisXTitle: this.xSP,
        width: this.innerWidth*0.4,
        height: (this.innerWidth*0.5) / 1.65,
        marginTop: 35,
        marginBottom: 50,
        marginRight: 30,
        marginLeft: 70,
        dataset: data
      };
    });
  }
}
