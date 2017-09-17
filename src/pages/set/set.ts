import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {CardsProvider} from "../../providers/cards/cards";
import {Card} from "../../model/card";
import {Set} from "../../model/set";

@IonicPage({
  name: 'set-page',
  segment: 'sets/:setCode',
  defaultHistory: ['sets-page']
})
@Component({
  selector: 'page-set',
  templateUrl: 'set.html'
})
export class SetPage {
  setCode: string;
  set: Set;
  cards: Card[] = [];
  view: string = 'list';

  constructor(public navCtrl: NavController, public navParams: NavParams, private cardsProvider: CardsProvider) {
    this.setCode = navParams.get('setCode');
    this.set = navParams.get('set');

    if (this.navCtrl.last()) {
      if (!this.setCode) {
        this.setCode = this.navCtrl.last().getNavParams().get('setCode');
        this.navCtrl.getPrevious().data = {
          setCode: this.setCode
        };
      }
      if (!this.set) {
        this.set = this.navCtrl.last().getNavParams().get('set');
      }
    }

    this.cardsProvider.loadCards(this.setCode).then((cards: Card[]) => {
      this.cards = cards;
    });

    if (!this.set) {
      this.cardsProvider.loadSet(this.setCode).then((set: Set) => {
        this.set = set;
      });
    }
  }

  getIndexArray(devider: number = 1): number[] {
    let indices: number[] = new Array(Math.ceil(this.cards.length / devider));
    for (let i = 0; i < indices.length; i++) {
      indices[i] = i;
    }
    return indices;
  }

  itemTapped(event, card: Card) {
    this.navCtrl.push('card-page', {
      cardId: card.id,
      setCode: this.setCode,
      card: card,
      cards: this.cards,
      set: this.set
    });
  }

}
