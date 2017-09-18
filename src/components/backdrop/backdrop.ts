import { Component } from '@angular/core';
import {EventsProvider} from "../../providers/events/events";

@Component({
  selector: 'backdrop',
  templateUrl: 'backdrop.html'
})
export class BackdropComponent {

  backdropActive: boolean = false;
  backdropVidible: boolean = false;

  constructor(private eventsProvider: EventsProvider) {
    this.eventsProvider.toggleBackdropActive.subscribe((value) => {
      this.backdropActive = value;
    });

    this.eventsProvider.toggleBackdropVisible.subscribe((value) => {
      this.backdropVidible = value;
    });
  }

}
