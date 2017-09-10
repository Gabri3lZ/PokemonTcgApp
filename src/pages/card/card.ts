import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Card} from "../../model/card";
import {Set} from "../../model/set";
import {CardsProvider} from "../../providers/cards/cards";

@IonicPage({
  name: 'card-page',
  segment: 'sets/:setCode/:cardId',
  defaultHistory: ['sets-page']
})
@Component({
  selector: 'page-card',
  templateUrl: 'card.html'
})
export class CardPage {

  cardId: string;
  setCode: string;
  card: Card;
  cards: Card[];
  set: Set;

  constructor(public navCtrl: NavController, public navParams: NavParams, private cardsProvider: CardsProvider) {
    this.cardId = navParams.get('cardId');
    this.setCode = navParams.get('setCode');
    this.card = navParams.get('card');
    this.cards = navParams.get('cards');
    this.set = navParams.get('set');

    if (!this.card) {
      this.cardsProvider.loadCard(this.cardId).then((card: Card) => {
        this.card = card;
      });
    }

    if (!this.set) {
      this.cardsProvider.loadSet(this.setCode).then((set: Set) => {
        this.set = set;
      });
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CardPage');
  }

  goBackToSet(event) {
    this.navCtrl.popTo('set-page');
  }

  itemTapped(event, cardName: string) {
    if (this.cards) {
      let evolvesFromCard: Card = this.cards.find((card: Card) => {
        return card.name === cardName;
      });
      this.navCtrl.push('card-page', {
        card: evolvesFromCard,
        cards: this.cards,
        set: this.set
      });
    }
  }

}
