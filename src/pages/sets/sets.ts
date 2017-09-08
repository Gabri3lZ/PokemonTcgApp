import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Set} from "../../model/set";
import {CardsProvider} from "../../providers/cards/cards";

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  selectedSet: Set;
  icons: string[];
  sets: Set[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private cardsProvider: CardsProvider) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedSet = navParams.get('set');

    // Let's populate this page with some filler content for funzies
    this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane',
    'american-football', 'boat', 'bluetooth', 'build'];

    this.cardsProvider.loadSets().then((sets: Set[]) => {
      this.sets = sets;
    });
  }

  itemTapped(event, set) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(ListPage, {
      set: set
    });
  }
}
