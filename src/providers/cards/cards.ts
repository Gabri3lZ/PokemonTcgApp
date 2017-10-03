import {EventEmitter, Injectable} from '@angular/core';
import {Set} from "../../model/set";
import {Card} from "../../model/card";
import {CardsLoader} from "../../interfaces/cards/cardsLoader";
import {CardsStorage} from "../../interfaces/cards/cardsStorage";

@Injectable()
export class CardsProvider {

  public cardsInitialized: EventEmitter<null> = new EventEmitter<null>();
  public viewOption = 'list';

  constructor(private cardsLoader: CardsLoader,
              private cardsStorer: CardsStorage) {
  }

  public init(): Promise<null> {
    return new Promise((resolve, reject) => {
      this.cardsLoader.init().then(() => {
        this.cardsStorer.init().then(() => {
          this.initSets().then((sets: Set[]) => {
            let counter = 0;
            for (let set of sets) {
              this.initCards(set.code).then(() => {
                counter++;
                if (counter === sets.length) {
                  this.cardsInitialized.emit();
                  resolve();
                }
              });
            }
          });
        });
      });
    });
  }

  public initSets(): Promise<Set[]> {
    return new Promise((resolve, reject) => {
      this.cardsStorer.getSetsFromStorage().then((sets: Set[]) => {
        if (sets && sets.length > 0) {
          resolve(sets);
        } else {
          this.cardsLoader.downloadSets().then((sets: Set[]) => {
            this.cardsStorer.storeSets(sets).then((sets: Set[]) => {
              resolve(sets);
            });
          });
        }
      });
    });
  }

  public initCards(setCode: string): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      this.cardsStorer.getCardsFromStorage(setCode).then((cards: Card[]) => {
        if (cards && cards.length > 0) {
          resolve(cards);
        } else {
          this.cardsLoader.downloadCards(setCode).then((cards: Card[]) => {
            this.cardsStorer.storeCards(cards).then((cards: Card[]) => {
              resolve(cards);
            });
          });
        }
      });
    });
  }
}
