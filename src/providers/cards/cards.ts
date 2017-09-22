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

  private fileTransfer: FileTransferObject = this.transfer.create();
  private storageDirectory: string = '';

  constructor(public http: Http, public platform: Platform, private storage: Storage,
              private file: File, private transfer: FileTransfer) {
    if (this.platform.is('ios')) {
      this.storageDirectory = this.file.documentsDirectory;
    } else {
      this.storageDirectory = this.file.dataDirectory;
    }
  }

  public init(): Promise<null> {
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
    return new Promise((resolve, reject) => {
      this.loadSets().then((sets: Set[]) => {
        let counter = 0;
        for (let set of sets) {
          this.downloadFileWithFallback(set.imageUrls, 'sets/' + set.code + '-image.png').then((imageEntry: FileEntry) => {
            if (imageEntry) {
              set.imageEntry = imageEntry.toURL();
            }
            this.downloadFile(set.symbolUrl, 'sets/' + set.code + '-symbol.png').then((symbolEntry: FileEntry) => {
              counter++;
              if (symbolEntry) {
                set.symbolEntry = symbolEntry.toURL();
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
    return new Promise((resolve, reject) => {
      this.loadCards(setCode).then((cards: Card[]) => {
        this.storage.set(setCode, cards);
        resolve(cards);
      });
    });
  }

  public getSetsFromStorage(): Promise<Set[]> {
    return this.storage.get('sets');
  }

  public getSetFromStorage(setCode: string): Promise<Set> {
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
    return this.storage.get(setCode);
  }

  public getCardFromStorage(setCode: string, cardId: string): Promise<Card> {
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
    return new Promise((resolve, reject) => {
      this.http.get(this.setsUrl).map((res: Response) => res.json().sets.reverse().map((set) => new Set(set))).subscribe((sets: Set[]) => {
        resolve(sets);
      });
    });
  }

  public loadSet(setCode: string): Promise<Set> {
    return new Promise((resolve, reject) => {
      this.http.get(this.setsUrl + '/' + setCode).map((res: Response) => new Set(res.json().set)).subscribe((set: Set) => {
        resolve(set);
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
      }).map(res => res.json().cards.map((card => new Card(card))).sort((card1: Card, card2: Card) => {
        return parseInt(card1.number) - parseInt(card2.number);
      })).subscribe((cards: Card[]) => {
        resolve(cards);
      });
    });
  }

  public loadCard(cardId: string): Promise<Card> {
    return new Promise((resolve, reject) => {
      this.http.get(this.cardsUrl + '/' + cardId).map(res => new Card(res.json().card)).subscribe((card: Card) => {
        resolve(card);
      });
    });
  }

  public downloadFile(url: string, path: string): Promise<FileEntry> {
    return new Promise((resolve, reject) => {
      this.fileTransfer.download(url, this.storageDirectory + path).then((entry) => {
        resolve(entry);
      }, (error) => {
        resolve(null);
      });
    });
  }

  public downloadFileWithFallback(urls: string[], path: string): Promise<FileEntry> {
    return new Promise((resolve, reject) => {
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
    });
  }

}
