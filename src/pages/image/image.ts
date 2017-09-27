import {AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {Content, IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {Subscription} from "rxjs/Subscription";
import {Card} from "../../model/card";

@IonicPage({
  name: 'image-page'
})
@Component({
  selector: 'page-image',
  templateUrl: 'image.html',
})
export class ImagePage implements AfterViewInit, OnDestroy {

  @ViewChild(Content)
  content: Content;
  card: Card;

  private scrollSubscription: Subscription;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
    this.card = navParams.get('card');
  }

  ngAfterViewInit() {
    this.scrollSubscription = this.content.ionScroll.subscribe((event) => {
      let maxScrollTop = event.scrollHeight - event.contentHeight;
      let scrollTop = event.scrollTop;
      let tolerance = Math.max(event.contentHeight, event.contentWidth) / 5;
      if ((scrollTop - maxScrollTop) > tolerance || scrollTop < -tolerance) {
        this.close();
      }
    });
  }

  ngOnDestroy() {
    this.scrollSubscription.unsubscribe();
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
