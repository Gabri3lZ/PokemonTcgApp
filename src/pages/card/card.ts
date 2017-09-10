import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Card} from "../../model/card";
import {Set} from "../../model/set";

@IonicPage()
@Component({
  selector: 'page-card',
  templateUrl: 'card.html',
})
export class CardPage {

  card: Card;
  cards: Card[];
  set: Set;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.card = navParams.get('card');
    this.cards = navParams.get('cards');
    this.set = navParams.get('set');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CardPage');
  }

  goBackToSet(event) {
    this.navCtrl.popTo(this.navCtrl.getByIndex(1));
  }

  itemTapped(event, cardName: string) {
    let evolvesFromCard: Card = this.cards.find((card: Card) => {
      return card.name === cardName;
    });
    this.navCtrl.push('CardPage', {
      card: evolvesFromCard,
      cards: this.cards,
      set: this.set
    });
  }

}
