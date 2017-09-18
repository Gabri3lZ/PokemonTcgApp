import {EventEmitter, Injectable} from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class EventsProvider {

  public toggleBackdropVisible: EventEmitter<boolean> = new EventEmitter<boolean>();
  public toggleBackdropActive: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public http: Http) {
  }

}
