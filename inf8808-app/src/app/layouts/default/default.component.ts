import { Component, OnInit } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.css']
})
export class DefaultComponent implements OnInit {
  public sideBarOpen = true;

  constructor(private uiservice: UiService) { }

  ngOnInit(): void {
  }

  public sideBarToggler(): void {
    this.sideBarOpen = !this.sideBarOpen;

    this.uiservice.emitChange(this.sideBarOpen);
  }

}
