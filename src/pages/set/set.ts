import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {CardsProvider} from "../../providers/cards/cards";
import {Card} from "../../model/card";

@Component({
  selector: 'page-set',
  templateUrl: 'set.html',
})
export class SetPage {
  cards: Card[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private cardsProvider: CardsProvider) {
    let setCode = navParams.get('setCode');

    this.cardsProvider.loadCards(setCode).then((cards: Card[]) => {
      this.cards = cards;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SetPage');
  }

  itemTapped(event, cardId) {
    this.navCtrl.push(SetPage, {
      cardId: cardId
    });
  }

}
