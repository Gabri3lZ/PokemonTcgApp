import {Component} from '@angular/core';
import {IonicPage, ModalController, NavController, NavParams} from 'ionic-angular';
import {Card} from "../../model/card";
import {Set} from "../../model/set";
import {CardsProvider} from "../../providers/cards/cards";
import {EventsProvider} from "../../providers/events/events";

@IonicPage({
  name: 'card-page',
  segment: 'sets/:setCode/:cardId',
  defaultHistory: ['sets-page', 'set-page']
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

  constructor(public modalCtrl: ModalController, public navCtrl: NavController, public navParams: NavParams,
              private cardsProvider: CardsProvider, private eventsProvider: EventsProvider) {
    this.cardId = navParams.get('cardId');
    this.setCode = navParams.get('setCode');
    this.card = navParams.get('card');
    this.cards = navParams.get('cards');
    this.set = navParams.get('set');

    if (!this.card) {
      this.cardsProvider.getCardFromStorage(this.setCode, this.cardId).then((card: Card) => {
        this.card = card;
        this.storeCardImageHiRes();
      });
    } else {
      this.storeCardImageHiRes();
    }

    if (!this.set) {
      this.cardsProvider.getSetFromStorage(this.setCode).then((set: Set) => {
        this.set = set;
      });
    }
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

  imageTapped(event) {
    this.eventsProvider.toggleBackdropActive.emit(true);

    setTimeout(() => {
      let modal = this.modalCtrl.create('image-page', {
        card: this.card
      }, {cssClass: 'image-modal'});
      this.eventsProvider.toggleBackdropVisible.emit(true);
      modal.onWillDismiss(() => {
        this.eventsProvider.toggleBackdropVisible.emit(false);
      });
      modal.onDidDismiss(() => {
        this.eventsProvider.toggleBackdropActive.emit(false);
      });
      modal.present();
    });
  }

  private storeCardImageHiRes() {
    this.cardsProvider.storeCardImageHiRes(this.setCode, this.cards, this.cardId).then((card: Card) => {
      this.card = card;
    });
  }

}
