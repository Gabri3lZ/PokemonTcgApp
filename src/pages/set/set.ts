import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {CardsProvider} from "../../providers/cards/cards";
import {Card} from "../../model/card";
import {Set} from "../../model/set";
import {CardsStorage} from "../../interfaces/cards/cardsStorage";
import {CardsLoader} from "../../interfaces/cards/cardsLoader";

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

  get view(): string {
    return this.cardsProvider.viewOption;
  }

  set view(viewOption: string) {
    this.cardsProvider.viewOption = viewOption;
  }

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private cardsProvider: CardsProvider,
              private cardsStorage: CardsStorage,
              private cardsLoader: CardsLoader) {
    this.setCode = this.navParams.get('setCode');
    this.set = this.navParams.get('set');

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

    this.cardsStorage.getCardsFromStorage(this.setCode).then((cards: Card[]) => {
      this.cards = cards;
      this.cardsLoader.downloadCardImages(this.cards).then((cards: Card[]) => {
        this.cardsStorage.storeCards(cards).then((cards: Card[]) => {
          this.cards = cards;
        });
      });
    });

    if (!this.set) {
      this.cardsStorage.getSetFromStorage(this.setCode).then((set: Set) => {
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
