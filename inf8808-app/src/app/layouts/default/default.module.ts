import { HttpClientModule } from '@angular/common/http';
import { ParamWeightDataService } from './../../services/param-weight-data.service';
import { ParamweightComponent } from './../../modules/paramweight/paramweight.component';
import { MainpageComponent } from './../../modules/mainpage/mainpage.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultComponent } from './default.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { CorrelationComponent } from 'src/app/modules/correlation/correlation.component';
import { CorrelationDataService } from 'src/app/services/correlation-data.service';
import { ClusteranalysisComponent } from 'src/app/modules/clusteranalysis/clusteranalysis.component';
import { ClusteringDataService } from 'src/app/services/clustering-data.service';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { UiService } from 'src/app/services/ui.service';

@NgModule({
  declarations: [
    DefaultComponent,
    MainpageComponent,
    ParamweightComponent,
    CorrelationComponent,
    ClusteranalysisComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    MatSidenavModule,
    MatDividerModule,
    MatCardModule,
    MatTabsModule,
    MatSelectModule,
    HttpClientModule
  ],
  providers: [
    ParamWeightDataService,
    CorrelationDataService,
    ClusteringDataService,
    UiService
  ]
})
export class DefaultModule { }
