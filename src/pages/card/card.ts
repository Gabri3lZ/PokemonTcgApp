import {Component, ViewChild} from '@angular/core';
import {IonicPage, ModalController, Navbar, NavController, NavParams, ViewController} from 'ionic-angular';
import {Card} from "../../model/card";
import {Set} from "../../model/set";
import {EventsProvider} from "../../providers/events/events";
import {DIRECTION_LEFT, DIRECTION_RIGHT} from "ionic-angular/gestures/hammer";
import {CardsStorage} from "../../interfaces/cards/cardsStorage";
import {CardsLoader} from "../../interfaces/cards/cardsLoader";

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
              private cardsStorage: CardsStorage,
              private cardsLoader: CardsLoader,
              private eventsProvider: EventsProvider) {
    this.cardId = this.navParams.get('cardId');
    this.setCode = this.navParams.get('setCode');
    this.card = this.navParams.get('card');
    this.cards = this.navParams.get('cards');
    this.set = this.navParams.get('set');

    if (!this.card) {
      this.cardsStorage.getCardFromStorage(this.cardId).then((card: Card) => {
        this.card = card;
      });
    }

    if (!this.set) {
      this.cardsStorage.getSetFromStorage(this.setCode).then((set: Set) => {
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

    this.cardsLoader.downloadCardImageHiRes(this.card).then((card: Card) => {
      this.cardsStorage.storeCard(card).then((card: Card) => {
        this.card.imageEntryHiRes = card.imageEntryHiRes;
      });
    });
  }

  cardSwiped(event) {
    if (!this.navCtrl.isTransitioning()) {
      let cardIndex;
      let direction;
      if (event.direction === DIRECTION_RIGHT) {
        cardIndex = this.cards.indexOf(this.card) - 1;
        direction = 'back';
      } else if (event.direction === DIRECTION_LEFT) {
        cardIndex = this.cards.indexOf(this.card) + 1;
        direction = 'forward';
      }
      if (cardIndex >= 0 && cardIndex < this.cards.length) {
        let card = this.cards[cardIndex];

        this.navCtrl.push('card-page', {
          cardId: card.id,
          setCode: this.setCode,
          card: card,
          cards: this.cards,
          set: this.set
        }, {
          direction: direction,
          animation: 'ios-transition'
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
