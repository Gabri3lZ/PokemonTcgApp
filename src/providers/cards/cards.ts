import {EventEmitter, Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import {Set} from "../../model/set";
import {Card} from "../../model/card";
import {File, FileEntry} from "@ionic-native/file";
import {FileTransfer, FileTransferObject} from "@ionic-native/file-transfer";
import {Platform} from "ionic-angular";
import PouchDB from 'pouchdb';
import pouchDbFindPlugin from 'pouchdb-find';
// import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import AllDocsResponse = PouchDB.Core.AllDocsResponse;
import PutResponse = PouchDB.Core.Response;
import ExistingDocument = PouchDB.Core.ExistingDocument;
import FindResponse = PouchDB.Find.FindResponse;

@Injectable()
export class CardsProvider {

  public cardsInitialized: EventEmitter<null> = new EventEmitter<null>();
  public viewOption = 'list';

  private baseUrl = 'https://api.pokemontcg.io/v1';
  private setsUrl = this.baseUrl + '/sets';
  private cardsUrl = this.baseUrl + '/cards';

  private fileTransfer: FileTransferObject;
  private storageDirectory: string = '';

  private setsDb: PouchDB.Database;
  private cardsDb: PouchDB.Database;

  constructor(public http: Http, public platform: Platform,
              private file: File, private transfer: FileTransfer) {
  }

  public init(): Promise<null> {
    this.fileTransfer = this.transfer.create();
    if (this.platform.is('ios')) {
      this.storageDirectory = this.file.documentsDirectory;
    } else if (this.platform.is('android')) {
      this.storageDirectory = this.file.dataDirectory;
    }
    return new Promise((resolve, reject) => {
      this.initDBs().then(() => {
        this.initSets().then((sets: Set[]) => {
          let counter = 0;
          for (let set of sets) {
            this.initCards(set.code).then(() => {
              counter++;
              if (counter === sets.length) {
                this.cardsInitialized.emit();
                resolve();
              }
            })
          }
        });
      });
    });
  }

  public initDBs(): Promise<any> {
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
    });
  }

  public initSets(): Promise<Set[]> {
    return new Promise((resolve, reject) => {
      this.getSetsFromStorage().then((sets: Set[]) => {
        if (sets && sets.length > 0) {
          resolve(sets);
        } else {
          this.storeSets().then((sets: Set[]) => {
            resolve(sets);
          });
        }
      });
    });
  }

  public initCards(setCode: string): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      this.getCardsFromStorage(setCode).then((cards: Card[]) => {
        if (cards && cards.length > 0) {
          resolve(cards);
        } else {
          this.storeCards(setCode).then((cards: Card[]) => {
            resolve(cards);
          });
        }
      });
    });
  }

  public storeSets(): Promise<Set[]> {
    return new Promise((resolve, reject) => {
      this.loadSets().then((sets: Set[]) => {
        let counter = 0;
        for (let set of sets) {
          this.downloadFileWithFallback(set.imageUrls, 'sets/' + set.code + '-image.png').then((imageEntry: FileEntry) => {
            if (imageEntry) {
              set.imageEntry = imageEntry.toURL();
              if (this.platform.is('ios')) {
                set.imageEntry = set.imageEntry.substring(7, set.imageEntry.length);
              }
            } else {
              set.imageEntry = set.imageUrls[0];
            }
            this.downloadFile(set.symbolUrl, 'sets/' + set.code + '-symbol.png').then((symbolEntry: FileEntry) => {
              counter++;
              if (symbolEntry) {
                set.symbolEntry = symbolEntry.toURL();
                if (this.platform.is('ios')) {
                  set.symbolEntry = set.symbolEntry.substring(7, set.symbolEntry.length);
                }
              } else {
                set.symbolEntry = set.symbolUrl;
              }
              this.setsDb.put(set).then((response: PutResponse) => {
                set._rev = response.rev;
                if (counter === sets.length) {
                  resolve(sets);
                }
              });
            });
          });
        }
      });
    });
  }

  public storeCards(setCode: string): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      this.loadCards(setCode).then((cards: Card[]) => {
        let counter = 0;
        for (let card of cards) {
          this.cardsDb.put(card).then((response: PutResponse) => {
            card._rev = response.rev;
            if (counter === cards.length) {
              resolve(cards);
            }
          });
        }
      }, (error) => {
        reject(error);
      });
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
          this.downloadFile(card.imageUrl, 'cards/' + setCode + '/' + card.number + '.png').then((imageEntry: FileEntry) => {
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

  public storeCardImageHiRes(setCode: string, cardId: string): Promise<Card> {
    return new Promise((resolve, reject) => {
      this.getCardFromStorage(cardId).then((card: Card) => {
        if (card && !card.imageEntryHiRes) {
          this.downloadFile(card.imageUrlHiRes, 'cards/' + setCode + '/' + card.number + '-hires.png').then((imageEntryHiRes: FileEntry) => {
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

  public loadSets(): Promise<Set[]> {
    return new Promise((resolve, reject) => {
      this.http.get(this.setsUrl).map((res: Response) => {
        return res.json().sets.reverse().map((set) => new Set(set));
      }).subscribe((sets: Set[]) => {
        resolve(sets);
      }, (error) => {
        resolve(null);
      });
    });
  }

  public loadSet(setCode: string): Promise<Set> {
    return new Promise((resolve, reject) => {
      this.http.get(this.setsUrl + '/' + setCode).map((res: Response) => {
        return new Set(res.json().set)
      }).subscribe((set: Set) => {
        resolve(set);
      }, (error) => {
        resolve(null);
      });
    });
  }

  public loadCards(setCode: string): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      this.http.get(this.cardsUrl, {
        params: {
          setCode: setCode,
          pageSize: 500
        }
      }).map((res) => {
        return res.json().cards.map((card => new Card(card))).sort((card1: Card, card2: Card) => {
          return parseInt(card1.number) - parseInt(card2.number);
        })
      }).subscribe((cards: Card[]) => {
        resolve(cards);
      }, (error) => {
        resolve(null);
      });
    });
  }

  public loadCard(cardId: string): Promise<Card> {
    return new Promise((resolve, reject) => {
      this.http.get(this.cardsUrl + '/' + cardId).map((res) => {
        return new Card(res.json().card)
      }).subscribe((card: Card) => {
        resolve(card);
      }, (error) => {
        resolve(null);
      });
    });
  }

  public downloadFile(url: string, path: string): Promise<FileEntry> {
    return new Promise((resolve, reject) => {
      if (this.storageDirectory) {
        this.fileTransfer.download(url, this.storageDirectory + path).then((entry) => {
          resolve(entry);
        }, (error) => {
          resolve(null);
        });
      } else {
        resolve(null);
      }
    });
  }

  public downloadFileWithFallback(urls: string[], path: string): Promise<FileEntry> {
    return new Promise((resolve, reject) => {
      if (this.storageDirectory) {
        this.fileTransfer.download(urls.shift(), this.storageDirectory + path).then((entry) => {
          resolve(entry);
        }, (error) => {
          if (urls.length > 0) {
            this.downloadFileWithFallback(urls, path).then((entry: FileEntry) => {
              resolve(entry);
            });
          } else {
            resolve(null);
          }
        });
      } else {
        resolve(null);
      }
    });
  }

}
