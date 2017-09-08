import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Set} from "../../model/set";
import {CardsProvider} from "../../providers/cards/cards";
import {SetPage} from "../set/set";

@Component({
  selector: 'page-sets',
  templateUrl: 'sets.html'
})
export class SetsPage {
  icons: string[];
  sets: Set[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private cardsProvider: CardsProvider) {
    this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane',
    'american-football', 'boat', 'bluetooth', 'build'];

    this.cardsProvider.loadSets().then((sets: Set[]) => {
      this.sets = sets;
    });
  }

  itemTapped(event, setCode) {
    this.navCtrl.push(SetPage, {
      setCode: setCode
    });
  }
}
