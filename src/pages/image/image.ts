import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';

@IonicPage({
  name: 'image-page'
})
@Component({
  selector: 'page-image',
  templateUrl: 'image.html',
})
export class ImagePage {

  imageUrl: string;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
    this.imageUrl = navParams.get('imageUrl');
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
