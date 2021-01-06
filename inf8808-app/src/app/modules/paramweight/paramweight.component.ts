import { BarChartConfig } from 'src/app/shared/graph-configuration';
import { ParamWeightDataService } from './../../services/param-weight-data.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subject } from 'rxjs';
import { UiService } from 'src/app/services/ui.service';

interface Selections {
  value: string,
  viewValue: string
}

@Component({
  selector: 'app-paramweight',
  templateUrl: './paramweight.component.html',
  styleUrls: ['./paramweight.component.css']
})
export class ParamweightComponent implements OnInit {

  public eventsSubject: Subject<BarChartConfig> = new Subject<BarChartConfig>();
  public bcConfig: BarChartConfig;
  private innerWidth: number;

  public selections: Selections[] = [
    {value: 'alpha', viewValue: 'Attribute name'},
    {value: 'ascending', viewValue: 'Ascending'},
    {value: 'descending', viewValue: 'Descending'},
  ]

  private tabSelection: number;

  constructor(private dataService: ParamWeightDataService,
              private uiService: UiService) {
    this.tabSelection = 0;
    this.innerWidth = window.innerWidth - 300;

    this.uiService.changeEmitted$.subscribe(async data => {
      data ? window.innerWidth - 300 : window.innerWidth + 300;
      await this.updateBarChart();
    });
  }

  async ngOnInit() {
    this.configurationBarChart(this.dataService.nonSaleData);
  }

  /**
   * Function that handle event when the windows is resized
   *
   */
  @HostListener('window:resize', ['$event'])
  private async onResize(event) {
    this.innerWidth = window.innerWidth;
    await this.updateBarChart();
  }

  /**
   * Function that handle event when tab is clicked
   *
   */
  public async selectTab(tab: MatTabChangeEvent) {
    this.tabSelection = tab.index;

    await this.updateBarChart();
  }

  /**
   * Configure the selections by adding the text and
   * handle event when they are clicked
   *
   */
  public async configureSelection(value): Promise<void> {
    await this.dataService.sortData(value);

    await this.updateBarChart();
  }

  private async updateBarChart(): Promise<void> {
    if (this.tabSelection == 0) {
      await this.configurationBarChart(this.dataService.nonSaleData);
    } else if (this.tabSelection == 1) {
      await this.configurationBarChart(this.dataService.saleData);
    }
    this.eventsSubject.next(this.bcConfig);
  }

  /**
   * Configure all the bar chart parameters
   *
   * @param data    Data that comes from a CSV file
   */
  private async configurationBarChart(dataset) {
    dataset.then(data => {
      let yed = this.innerWidth * 0.55;
      this.bcConfig = {
        width: yed,
        height: 650,
        marginTop: 55,
        marginBottom: 100,
        marginRight: 75,
        marginLeft: 85,
        title: this.tabSelection == 0 ? 'Non Sales Parameters Weight Coefficient' : 'Sales Parameters Weight Coefficient',
        dataset: data
      };
    });
  }
}
