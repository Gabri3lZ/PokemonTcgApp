import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import {IonicPage, NavController} from "ionic-angular";

@IonicPage({
  name: 'tabs-page',
  segment: 'tabs'
})
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {

  pages: Array<{title: string, icon: string, component: any}>;

  constructor(public navCtrl: NavController) {
    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Cards', icon: 'list-box', component: 'sets-page' },
      { title: 'Home', icon: 'home', component: HomePage }
    ];
  }
}
