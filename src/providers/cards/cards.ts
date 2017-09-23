import {EventEmitter, Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import {Set} from "../../model/set";
import {Card} from "../../model/card";
import {Storage} from "@ionic/storage";
import {File, FileEntry} from "@ionic-native/file";
import {FileTransfer, FileTransferObject} from "@ionic-native/file-transfer";
import {Platform} from "ionic-angular";

@Injectable()
export class CardsProvider {

  public cardsInitialized: EventEmitter<null> = new EventEmitter<null>();

  private baseUrl = 'https://api.pokemontcg.io/v1';
  // private baseUrl = 'http://localhost:3000';
  private setsUrl = this.baseUrl + '/sets';
  private cardsUrl = this.baseUrl + '/cards';

  private fileTransfer: FileTransferObject;
  private storageDirectory: string = '';

  constructor(public http: Http, public platform: Platform, private storage: Storage,
              private file: File, private transfer: FileTransfer) {
  }

  public init(): Promise<null> {
    this.fileTransfer = this.transfer.create();
    this.storageDirectory = this.file.dataDirectory;
    console.log('storageDirectory: ', this.storageDirectory);
    console.log('init');
    return new Promise((resolve, reject) => {
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
  }

  public initSets(): Promise<Set[]> {
    console.log('initSets');
    return new Promise((resolve, reject) => {
      this.getSetsFromStorage().then((sets: Set[]) => {
        if (sets) {
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
    console.log('initCards');
    return new Promise((resolve, reject) => {
      this.getCardsFromStorage(setCode).then((cards: Card[]) => {
        if (cards) {
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
    console.log('storeSets');
    return new Promise((resolve, reject) => {
      this.loadSets().then((sets: Set[]) => {
        let counter = 0;
        for (let set of sets) {
          this.downloadFileWithFallback(set.imageUrls, 'sets/' + set.code + '-image.png').then((imageEntry: FileEntry) => {
            if (imageEntry) {
              set.imageEntry = imageEntry.toURL();
              console.log('imageEntry: ', set.imageEntry);
            }
            this.downloadFile(set.symbolUrl, 'sets/' + set.code + '-symbol.png').then((symbolEntry: FileEntry) => {
              counter++;
              if (symbolEntry) {
                set.symbolEntry = symbolEntry.toURL();
                console.log('symbolEntry: ', set.symbolEntry);
              }
              if (counter === sets.length) {
                this.storage.set('sets', sets);
                resolve(sets);
              }
            });
          });
        }
      });
    });
  }

  public storeCards(setCode: string): Promise<Card[]> {
    console.log('storeCards');
    return new Promise((resolve, reject) => {
      this.loadCards(setCode).then((cards: Card[]) => {
        this.storage.set(setCode, cards);
        resolve(cards);
      });
    });
  }

  public getSetsFromStorage(): Promise<Set[]> {
    console.log('getSetsFromStorage');
    return this.storage.get('sets');
  }

  public getSetFromStorage(setCode: string): Promise<Set> {
    console.log('getSetFromStorage');
    return new Promise((resolve, reject) => {
      this.getSetsFromStorage().then((sets: Set[]) => {
        let set = sets.find((set: Set) => {
          return set.code === setCode;
        });
        resolve(set);
      });
    });
  }

  public getCardsFromStorage(setCode: string): Promise<Card[]> {
    console.log('getCardsFromStorage');
    return this.storage.get(setCode);
  }

  public getCardFromStorage(setCode: string, cardId: string): Promise<Card> {
    console.log('getCardFromStorage');
    return new Promise((resolve, reject) => {
      this.getCardsFromStorage(setCode).then((cards: Card[]) => {
        let card = cards.find((card: Card) => {
          return card.id === cardId;
        });
        resolve(card);
      });
    });
  }

  public loadSets(): Promise<Set[]> {
    console.log('loadSets');
    return new Promise((resolve, reject) => {
      console.log('loadSets start');
      this.http.get(this.setsUrl).map((res: Response) => {
        console.log('loadSets successful');
        return res.json().sets.reverse().map((set) => new Set(set));
      }).subscribe((sets: Set[]) => {
        console.log('loadSets resolve');
        resolve(sets);
      }, (error) => {
        console.log('loadSets error');
      });
    });
  }

  public loadSet(setCode: string): Promise<Set> {
    console.log('loadSet');
    return new Promise((resolve, reject) => {
      this.http.get(this.setsUrl + '/' + setCode).map((res: Response) => {
        return new Set(res.json().set)
      }).subscribe((set: Set) => {
        resolve(set);
      });
    });
  }

  public loadCards(setCode: string): Promise<Card[]> {
    console.log('loadCards');
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
      });
    });
  }

  public loadCard(cardId: string): Promise<Card> {
    console.log('loadCard');
    return new Promise((resolve, reject) => {
      this.http.get(this.cardsUrl + '/' + cardId).map((res) => {
        return new Card(res.json().card)
      }).subscribe((card: Card) => {
        resolve(card);
      });
    });
  }

  public downloadFile(url: string, path: string): Promise<FileEntry> {
    console.log('downloadFile');
    return new Promise((resolve, reject) => {
      this.fileTransfer.download(url, this.storageDirectory + path).then((entry) => {
        resolve(entry);
      }, (error) => {
        resolve(null);
      });
    });
  }

  public downloadFileWithFallback(urls: string[], path: string): Promise<FileEntry> {
    console.log('downloadFileWithFallback');
    return new Promise((resolve, reject) => {
      this.fileTransfer.download(urls.shift(), this.storageDirectory + path).then((entry) => {
        console.log('downloadFileWithFallback success: ', entry);
        resolve(entry);
      }, (error) => {
        console.log('downloadFileWithFallback error: ', error);
        if (urls.length > 0) {
          this.downloadFileWithFallback(urls, path).then((entry: FileEntry) => {
            resolve(entry);
          });
        } else {
          resolve(null);
        }
      });
    });
  }

}
