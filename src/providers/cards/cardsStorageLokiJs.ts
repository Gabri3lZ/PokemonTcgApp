import {Injectable} from '@angular/core';
import {Set} from "../../model/set";
import {Card} from "../../model/card";
import {CardsStorage} from "../../interfaces/cards/cardsStorage";
import loki from "lokijs";
import {LokiStorageAdapter} from "../adapter/lokiStorageAdapter";

@Injectable()
export class CardsStorageLokiJsProvider implements CardsStorage {

  private db: Loki;
  private sets: LokiCollection<Set>;
  private cards: LokiCollection<Card>;

  constructor(private lokiStorageAdapter: LokiStorageAdapter) {
  }

  public init(): Promise<void> {
    this.db = new loki('data.json', {
      adapter: this.lokiStorageAdapter,
      autosave: true
    });
    return new Promise<void>((resolve, reject) => {
      this.db.loadDatabase({}, () => {
        this.sets = this.db.getCollection<Set>('sets');
        if (!this.sets) {
          this.sets = this.db.addCollection<Set>('sets', {
            autoupdate: true,
            unique: ['code'],
            indices: [
              'code',
              'ptcgoCode',
              'name',
              'series',
              'standardLegal',
              'expandedLegal',
              'releaseDate'
            ]
          });
        }
        this.cards = this.db.getCollection<Card>('cards');
        if (!this.cards) {
          this.cards = this.db.addCollection<Card>('cards', {
            autoupdate: true,
            unique: ['id'],
            indices: [
              'id',
              'name',
              'types',
              'supertype',
              'subtype',
              'ability',
              'ancientTrait',
              'hp',
              'retreatCost',
              'number',
              'rarity',
              'series',
              'set',
              'setCode',
              'attacks',
              'resistances',
              'weaknesses'
            ]
          });
        }
        resolve();
      });
    });
  }

  public storeSets(sets: Set[]): Promise<Set[]> {
    return new Promise((resolve, reject) => {
      let storedSets: Set[] = [];
      for (let set of sets) {
        this.storeSet(set).then((storedSet) => {
          storedSets.push(storedSet);
          if (storedSets.length === sets.length) {
            resolve(storedSets);
          }
        }, (error) => {
          storedSets.push(set);
          if (storedSets.length === sets.length) {
            resolve(storedSets);
          }
        });
      }
    });
  }

  public storeSet(set: Set): Promise<Set> {
    let storedSet = this.sets.by('code', set.code);
    if (storedSet) {
      if (!set.meta) {
        set.meta = storedSet.meta;
        set.$loki = storedSet.$loki;
      }
      return Promise.resolve(new Set(this.sets.update(set)));
    } else {
      return Promise.resolve(new Set(this.sets.insert(set)));
    }
  }

  public storeCards(cards: Card[]): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      let storedCards: Card[] = [];
      for (let card of cards) {
        this.storeCard(card).then((storedCard: Card) => {
          storedCards.push(storedCard);
          if (storedCards.length === cards.length) {
            resolve(cards);
          }
        }, (error) => {
          storedCards.push(card);
          if (storedCards.length === cards.length) {
            resolve(cards);
          }
        });
      }
    });
  }

  public storeCard(card: Card): Promise<Card> {
    let storedCard = this.cards.by('id', card.id);
    if (storedCard) {
      if (!card.meta) {
        card.meta = storedCard.meta;
        card.$loki = storedCard.$loki;
      }
      return Promise.resolve(new Card(this.cards.update(card)));
    } else {
      return Promise.resolve(new Card(this.cards.insert(card)));
    }
  }

  public getSetsFromStorage(): Promise<Set[]> {
    return Promise.resolve(this.sets.find().map((set: Set) => {
      return new Set(set);
    }).sort((set1: Set, set2: Set) => {
      return set2.releaseDate.getTime() - set1.releaseDate.getTime()
    }));
  }

  public getSetFromStorage(setCode: string): Promise<Set> {
    let set = this.sets.by('code', setCode);
    if (set) {
      return Promise.resolve(new Set(set));
    } else {
      return Promise.resolve(null);
    }
  }

  public getCardsFromStorage(setCode: string): Promise<Card[]> {
    return Promise.resolve(this.cards.chain().find({'setCode': setCode}).sort((card1: Card, card2: Card) => {
      let num1 = parseInt(card1.number.replace( /^\D+0*/g, '1000'));
      let num2 = parseInt(card2.number.replace( /^\D+0*/g, '1000'));
      if (isNaN(num1)) {
        num1 = Number.MAX_SAFE_INTEGER;
      }
      if (isNaN(num2)) {
        num2 = Number.MAX_SAFE_INTEGER;
      }
      return num1 - num2;
    }).data().map((card: Card) => {
      return new Card(card);
    }));
  }

  public getCardFromStorage(cardId: string): Promise<Card> {
    let card = this.cards.by('id', cardId);
    if (card) {
      return Promise.resolve(new Card(card));
    } else {
      return Promise.resolve(null);
    }
  }
}
