import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {CardsProvider} from "../../providers/cards/cards";
import {Card} from "../../model/card";
import {Set} from "../../model/set";

@IonicPage()
@Component({
  selector: 'page-set',
  templateUrl: 'set.html',
})
export class SetPage {
  set: Set;
  cards: Card[] = [];
  view: string = 'list';

  constructor(public navCtrl: NavController, public navParams: NavParams, private cardsProvider: CardsProvider) {
    this.set = navParams.get('set');

    this.cardsProvider.loadCards(this.set.code).then((cards: Card[]) => {
      this.cards = cards;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SetPage');
  }

  getIndexArray(devider: number = 1): number[] {
    let indices: number[] = new Array(Math.ceil(this.cards.length / devider));
    for (let i = 0; i < indices.length; i++) {
      indices[i] = i;
    }
    return indices;
  }

  itemTapped(event, card: Card) {
    this.navCtrl.push('CardPage', {
      card: card,
      cards: this.cards,
      set: this.set
    });
  }

}
