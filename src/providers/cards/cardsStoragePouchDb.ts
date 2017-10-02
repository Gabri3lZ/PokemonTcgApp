import {Injectable} from '@angular/core';
import {Set} from "../../model/set";
import {Card} from "../../model/card";
import {FileEntry} from "@ionic-native/file";
import {Platform} from "ionic-angular";
import {CardsStorage} from "../../interfaces/cards/cardsStorage";
import {CardsLoader} from "../../interfaces/cards/cardsLoader";
import PouchDB from 'pouchdb';
import pouchDbFindPlugin from 'pouchdb-find';
// import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import AllDocsResponse = PouchDB.Core.AllDocsResponse;
import PutResponse = PouchDB.Core.Response;
import ExistingDocument = PouchDB.Core.ExistingDocument;
import FindResponse = PouchDB.Find.FindResponse;

@Injectable()
export class CardsStoragePouchDbProvider implements CardsStorage {

  private setsDb: PouchDB.Database;
  private cardsDb: PouchDB.Database;

  constructor(private platform: Platform,
              private cardsLoader: CardsLoader) {
  }

  public init(): Promise<void> {
    /*
    PouchDB.plugin(cordovaSqlitePlugin);
    this.setsDb = new PouchDB('sets.db', <any>{adapter: 'cordova-sqlite', location: 'default'});
    this.cardsDb = new PouchDB('cards.db', <any>{adapter: 'cordova-sqlite', location: 'default'});
    */
    PouchDB.plugin(pouchDbFindPlugin);
    this.setsDb = new PouchDB('sets.db');
    this.cardsDb = new PouchDB('cards.db');

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
      let counter = 0;
      for (let set of sets) {
        this.cardsLoader.downloadFileWithFallback(set.imageUrls, 'sets/' + set.code + '-image.png').then((imageEntry: FileEntry) => {
          if (imageEntry) {
            set.imageEntry = imageEntry.toURL();
            if (this.platform.is('ios')) {
              set.imageEntry = set.imageEntry.substring(7, set.imageEntry.length);
            }
          } else {
            set.imageEntry = set.imageUrls[0];
          }
          this.cardsLoader.downloadFile(set.symbolUrl, 'sets/' + set.code + '-symbol.png').then((symbolEntry: FileEntry) => {
            counter++;
            if (symbolEntry) {
              set.symbolEntry = symbolEntry.toURL();
              if (this.platform.is('ios')) {
                set.symbolEntry = set.symbolEntry.substring(7, set.symbolEntry.length);
              }
            } else {
              set.symbolEntry = set.symbolUrl;
            }
            this.storeSet(set).then((storedSet: Set) => {
              set._rev = storedSet._rev;
              if (counter === sets.length) {
                resolve(sets);
              }
            });
          });
        });
      }
    });
  }

  public storeSet(set: Set): Promise<Set> {
    return new Promise((resolve, reject) => {
      this.setsDb.put(set).then((response: PutResponse) => {
        set._rev = response.rev;
        resolve(set);
      });
    });
  }

  public storeCards(cards: Card[]): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      let counter = 0;
      for (let card of cards) {
        this.cardsDb.put(card).then((response: PutResponse) => {
          counter++;
          card._rev = response.rev;
          if (counter === cards.length) {
            resolve(cards);
          }
        });
      }
    });
  }

  public storeCard(card: Card): Promise<Card> {
    return new Promise((resolve, reject) => {
      this.cardsDb.put(card).then((response: PutResponse) => {
        card._rev = response.rev;
        resolve(card);
      });
    });
  }

  public storeSetImages(setCode: string, cards: Card[]): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      let counter = 0;
      for (let card of cards) {
        if (!card.imageEntry) {
          this.cardsLoader.downloadFile(card.imageUrl, 'cards/' + setCode + '/' + card.number + '.png').then((imageEntry: FileEntry) => {
            counter++;
            if (imageEntry) {
              card.imageEntry = imageEntry.toURL();
              if (this.platform.is('ios')) {
                card.imageEntry = card.imageEntry.substring(7, card.imageEntry.length);
              }
            } else {
              card.imageEntry = card.imageUrl;
            }
            this.storeCard(card).then((storedCard: Card) => {
              card._rev = storedCard._rev;
              if (counter === cards.length) {
                resolve(cards);
              }
            });
          });
        } else {
          counter++;
        }
      }
    });
  }

  public storeCardImageHiRes(setCode: string, card: Card): Promise<Card> {
    return new Promise((resolve, reject) => {
      this.getCardFromStorage(card.id).then((card: Card) => {
        if (card && !card.imageEntryHiRes) {
          this.cardsLoader.downloadFile(card.imageUrlHiRes, 'cards/' + setCode + '/' + card.number + '-hires.png').then((imageEntryHiRes: FileEntry) => {
            if (imageEntryHiRes) {
              card.imageEntryHiRes = imageEntryHiRes.toURL();
              if (this.platform.is('ios')) {
                card.imageEntryHiRes = card.imageEntryHiRes.substring(7, card.imageEntryHiRes.length);
              }
            } else {
              card.imageEntryHiRes = card.imageUrlHiRes;
            }
            this.storeCard(card).then((storedCard: Card) => {
              resolve(storedCard);
            }, (error) => {
              reject(error);
            });
          });
        } else {
          if (card) {
            resolve(card);
          } else {
            reject(new Error('card not found'));
          }
        }
      });
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
