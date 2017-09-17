import {AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {Content, IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {Subscription} from "rxjs/Subscription";

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
  imageUrl: string;

  private scrollStartSubscription: Subscription;
  private scrollEndSubscription: Subscription;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
    this.imageUrl = navParams.get('imageUrl');
  }

  ngAfterViewInit() {
    let scrollTopStart;
    this.scrollStartSubscription = this.content.ionScrollStart.subscribe((event) => {
      scrollTopStart = event.scrollTop;
    });
    this.scrollEndSubscription = this.content.ionScrollEnd.subscribe((event) => {
      let scrollTopEnd = event.scrollTop;
      let scrollDiff = Math.abs(scrollTopEnd - scrollTopStart);
      if (scrollDiff > 100) {
        this.close();
      }
    });
  }

  ngOnDestroy() {
    this.scrollStartSubscription.unsubscribe();
    this.scrollEndSubscription.unsubscribe();
  }

  close() {
    this.viewCtrl.dismiss();
  }

  test(event) {
    console.log('event: ', event);
  }

}
