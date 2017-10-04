import {Injectable} from '@angular/core';
import {Set} from "../../model/set";
import {Card} from "../../model/card";
import {Platform} from "ionic-angular";
import {CardsStorage} from "../../interfaces/cards/cardsStorage";
import PouchDB from 'pouchdb';
import pouchDbFindPlugin from 'pouchdb-find';
import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import AllDocsResponse = PouchDB.Core.AllDocsResponse;
import PutResponse = PouchDB.Core.Response;
import ExistingDocument = PouchDB.Core.ExistingDocument;
import FindResponse = PouchDB.Find.FindResponse;

@Injectable()
export class CardsStoragePouchDbProvider implements CardsStorage {

  private setsDb: PouchDB.Database;
  private cardsDb: PouchDB.Database;

  constructor(private platform: Platform) {
  }

  public init(): Promise<void> {
    PouchDB.plugin(pouchDbFindPlugin);
    if (this.platform.is('ios') || this.platform.is('android')) {
      PouchDB.plugin(cordovaSqlitePlugin);
      this.setsDb = new PouchDB('sets.db', <any>{adapter: 'cordova-sqlite', location: 'default'});
      this.cardsDb = new PouchDB('cards.db', <any>{adapter: 'cordova-sqlite', location: 'default'});
    } else {
      this.setsDb = new PouchDB('sets.db');
      this.cardsDb = new PouchDB('cards.db');
    }

    return this.cardsDb.createIndex({
      index: {fields: [
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
      ]}
    }).then(() => {
      return Promise.resolve();
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
    return this.setsDb.put(set).then((response: PutResponse) => {
      set._rev = response.rev;
      return set;
    });
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
    return this.cardsDb.put(card).then((response: PutResponse) => {
      card._rev = response.rev;
      return card;
    });
  }

  public getSetsFromStorage(): Promise<Set[]> {
    return this.setsDb.allDocs({include_docs: true}).then((response: AllDocsResponse<Set>) => {
      return response.rows.map((row) => {
        return new Set(row.doc);
      }).sort((set1: Set, set2: Set) => {
        return set2.releaseDate.getTime() - set1.releaseDate.getTime()
      });
    });
  }

  public getSetFromStorage(setCode: string): Promise<Set> {
    return this.setsDb.get(setCode).then((doc: ExistingDocument<Set>) => {
      return new Set(doc);
    });
  }

  public getCardsFromStorage(setCode: string): Promise<Card[]> {
    return this.cardsDb.find({
      selector: {setCode: setCode},
    }).then((response: FindResponse<Card>) => {
      return response.docs.map((card: Card) => {
        return new Card(card);
      }).sort((card1: Card, card2: Card) => {
        let num1 = parseInt(card1.number.replace( /^\D+0*/g, '1000'));
        let num2 = parseInt(card2.number.replace( /^\D+0*/g, '1000'));
        if (isNaN(num1)) {
          num1 = Number.MAX_SAFE_INTEGER;
        }
        if (isNaN(num2)) {
          num2 = Number.MAX_SAFE_INTEGER;
        }
        return num1 - num2;
      });
    });
  }

  public getCardFromStorage(cardId: string): Promise<Card> {
    return this.cardsDb.get(cardId).then((doc: ExistingDocument<Card>) => {
      return new Card(doc);
    });
  }
}
