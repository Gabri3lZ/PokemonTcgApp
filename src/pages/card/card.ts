import {Component, ViewChild} from '@angular/core';
import {IonicPage, ModalController, Navbar, NavController, NavParams, ViewController} from 'ionic-angular';
import {Card} from "../../model/card";
import {Set} from "../../model/set";
import {CardsProvider} from "../../providers/cards/cards";
import {EventsProvider} from "../../providers/events/events";
import {DIRECTION_LEFT, DIRECTION_RIGHT} from "ionic-angular/gestures/hammer";

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

  @ViewChild(Navbar) navBar: Navbar;

  cardId: string;
  setCode: string;
  card: Card;
  cards: Card[];
  set: Set;

  private setViewCtrl: ViewController;

  constructor(private modalCtrl: ModalController,
              private navCtrl: NavController,
              private viewCtrl: ViewController,
              private navParams: NavParams,
              private cardsProvider: CardsProvider,
              private eventsProvider: EventsProvider) {
    this.cardId = this.navParams.get('cardId');
    this.setCode = this.navParams.get('setCode');
    this.card = this.navParams.get('card');
    this.cards = this.navParams.get('cards');
    this.set = this.navParams.get('set');

    if (!this.card) {
      this.cardsProvider.getCardFromStorage(this.cardId).then((card: Card) => {
        this.card = card;
      });
    }

    if (!this.set) {
      this.cardsProvider.getSetFromStorage(this.setCode).then((set: Set) => {
        this.set = set;
      });
    }
  }

  ionViewDidLoad() {
    this.setViewCtrl = this.navCtrl.getViews().find((viewCtrl) => {
      return viewCtrl.id === 'set-page';
    });
    this.navBar.backButtonClick = (event: UIEvent) => {
      this.navCtrl.popTo(this.setViewCtrl);
    }
  }

  goBackToSet(event) {
    this.navCtrl.popTo(this.setViewCtrl);
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

    this.cardsProvider.storeCardImageHiRes(this.setCode, this.cardId).then((card: Card) => {
      this.card.imageEntryHiRes = card.imageEntryHiRes;
    });
  }

  cardSwiped(event) {
    if (!this.navCtrl.isTransitioning()) {
      let cardNumber;
      let direction;
      if (event.direction === DIRECTION_RIGHT) {
        cardNumber = parseInt(this.card.number) - 1;
        direction = 'back';
      } else if (event.direction === DIRECTION_LEFT) {
        cardNumber = parseInt(this.card.number) + 1;
        direction = 'forward';
      }
      if (cardNumber > 0 && cardNumber <= this.cards.length) {
        cardNumber = cardNumber.toString();
        let card = this.cards.find((card: Card) => {
          return card.number === cardNumber;
        });

        this.navCtrl.push('card-page', {
          cardId: card.id,
          setCode: this.setCode,
          card: card,
          cards: this.cards,
          set: this.set
        }, {
          direction: direction
        }).then(() => {
          let index = this.viewCtrl.index;
          this.navCtrl.remove(index, 1, {
            animate: false
          });
        });
      }
    }
  }

}
