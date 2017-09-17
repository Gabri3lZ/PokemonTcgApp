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

  private scrollEndSubscription: Subscription;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
    this.imageUrl = navParams.get('imageUrl');
  }

  ngAfterViewInit() {
    this.scrollEndSubscription = this.content.ionScrollEnd.subscribe((event) => {
      let maxScrollTop = event.scrollHeight - event.contentHeight;
      let scrollTop = event.scrollTop;
      let tolerance = Math.max(event.contentHeight, event.contentWidth) / 10;
      if ((scrollTop - maxScrollTop) > tolerance || scrollTop < -tolerance) {
        this.close();
      }
    });
  }

  ngOnDestroy() {
    this.scrollEndSubscription.unsubscribe();
  }

  close() {
    this.viewCtrl.dismiss();
  }

  test(event) {
    console.log('event: ', event);
  }

}
