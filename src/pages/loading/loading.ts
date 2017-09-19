import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {CardsProvider} from "../../providers/cards/cards";
import {Subscription} from "rxjs/Subscription";

@IonicPage({
  name: 'loading-page',
  segment: 'loading'
})
@Component({
  selector: 'page-loading',
  templateUrl: 'loading.html',
})
export class LoadingPage implements AfterViewInit, OnDestroy {

  private cardsInitializedSubscription: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController,
              private cardsProvider: CardsProvider) {
  }

  ngAfterViewInit() {
    this.presentLoadingDefault();
  }

  ngOnDestroy() {
    this.cardsInitializedSubscription.unsubscribe();
  }

  presentLoadingDefault() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    this.cardsInitializedSubscription = this.cardsProvider.cardsInitialized.subscribe(() => {
      loading.dismiss();
    });
  }

}
