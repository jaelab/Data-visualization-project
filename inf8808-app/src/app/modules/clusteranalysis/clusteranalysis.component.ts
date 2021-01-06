import { Component, OnInit, HostListener } from '@angular/core';
import { ClusteringDataService, ClusteringData } from 'src/app/services/clustering-data.service';
import { ClusteringConfig } from 'src/app/shared/graph-configuration';
import { UiService } from 'src/app/services/ui.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-clusteranalysis',
  templateUrl: './clusteranalysis.component.html',
  styleUrls: ['./clusteranalysis.component.css']
})
export class ClusteranalysisComponent implements OnInit {
  public eventsSubject: Subject<ClusteringConfig> = new Subject<ClusteringConfig>();
  public cConfig: ClusteringConfig;
  private dataset: ClusteringData[] = [];
  private openSideNav: number;

  constructor(private dataService: ClusteringDataService,
              private uiService: UiService) {
    this.openSideNav = 350;

    this.uiService.changeEmitted$.subscribe(data => {
      data ? this.openSideNav = 300 : this.openSideNav = 50;

      this.configurateClustering();
      this.eventsSubject.next(this.cConfig);
    });
  }

  async ngOnInit(): Promise<void> {
    await this.mergeDataset();
    this.configurateClustering();
  }
  
  private async mergeDataset(): Promise<void> {
    await this.dataService.videogameData.then( async d => {
      await this.dataService.clusteringData.then(d2 => {
        for (let index = 0; index < d.length; index++) {
          this.dataset.push({
            Name: d[index].Name,
            Platform: d[index].Platform,
            Year_of_Release: d[index].Year_of_Release,
            Genre: d[index].Genre,
            Publisher: d[index].Publisher,
            Global_Sales: d[index].Global_Sales,
            NA_Sales: d[index].NA_Sales,
            EU_Sales: d[index].EU_Sales,
            JP_Sales: d[index].JP_Sales,
            Other_Sales: d[index].Other_Sales,
            Critic_Count: d[index].Critic_Count,
            Critic_Score: d[index].Critic_Score,
            User_Score: d[index].User_Score,
            User_Count: d[index].User_Count,
            Developer: d[index].Developer,
            Rating: d[index].Rating,
            x: d2[index].x,
            y: d2[index].y,
          })
        } 
      })
    })
  }

  private configurateClustering(): void {
    this.cConfig = {
      width: window.innerWidth - this.openSideNav,
      height: window.innerHeight - 100,
      marginTop: 10,
      marginBottom: 10,
      marginRight: 25,
      marginLeft: 25,
      radiusParameter: 'Global_Sales',
      dataset: this.dataset,
    };
  }

}
