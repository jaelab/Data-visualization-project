import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private emitChangeSource = new Subject<any>();
  changeEmitted$ = this.emitChangeSource.asObservable();

  constructor() { }

  public emitChange(data: Boolean) {
      this.emitChangeSource.next(data);
  }
}
