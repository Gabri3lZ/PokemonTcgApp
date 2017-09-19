import {Component, OnDestroy} from '@angular/core';
import {EventsProvider} from "../../providers/events/events";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'backdrop',
  templateUrl: 'backdrop.html'
})
export class BackdropComponent implements OnDestroy {

  backdropActive: boolean = false;
  backdropVidible: boolean = false;

  private toggleBackdropActiveSubscription: Subscription;
  private toggleBackdropVisibleSubscription: Subscription;

  constructor(private eventsProvider: EventsProvider) {
    this.eventsProvider.toggleBackdropActive.subscribe((value) => {
      this.backdropActive = value;
    });

    this.eventsProvider.toggleBackdropVisible.subscribe((value) => {
      this.backdropVidible = value;
    });
  }

  ngOnDestroy() {
    this.toggleBackdropActiveSubscription.unsubscribe();
    this.toggleBackdropVisibleSubscription.unsubscribe();
  }

}
