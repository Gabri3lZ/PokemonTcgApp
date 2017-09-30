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
  public viewOption = 'list';

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
    if (this.platform.is('ios')) {
      this.storageDirectory = this.file.documentsDirectory;
    } else {
      this.storageDirectory = this.file.dataDirectory;
    }
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
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
              if (this.platform.is('ios')) {
                set.imageEntry = set.imageEntry.substring(7, set.imageEntry.length);
              }
            }
            this.downloadFile(set.symbolUrl, 'sets/' + set.code + '-symbol.png').then((symbolEntry: FileEntry) => {
              counter++;
              if (symbolEntry) {
                set.symbolEntry = symbolEntry.toURL();
                if (this.platform.is('ios')) {
                  set.symbolEntry = set.symbolEntry.substring(7, set.symbolEntry.length);
                }
              }
              if (counter === sets.length) {
                this.storage.set('sets', sets).then(() => {
                  resolve(sets);
                });
              }
            });
          });
        }
      });
    });
  }

  public storeCards(setCode: string, cards?: Card[]): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      if (cards) {
        this.storage.set(setCode, cards).then(() => {
          resolve(cards);
        });
      } else {
        this.loadCards(setCode).then((cards: Card[]) => {
          this.storage.set(setCode, cards).then(() => {
            resolve(cards);
          });
        }, (error) => {
          reject(error);
        });
      }
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
            }
            if (counter === cards.length) {
              this.storeCards(setCode, cards).then(() => {
                resolve(cards);
              });
            }
          });
        } else {
          counter++;
        }
      }
    });
  }

  public storeCardImageHiRes(setCode: string, cardId: string): Promise<Card> {
    return new Promise((resolve, reject) => {
      this.getCardsFromStorage(setCode).then((cards: Card[]) => {
        let card = cards.find((card: Card) => {
          return card.id === cardId;
        });
        if (card && !card.imageEntryHiRes) {
          this.downloadFile(card.imageUrlHiRes, 'cards/' + setCode + '/' + card.number + '-hires.png').then((imageEntryHiRes: FileEntry) => {
            if (imageEntryHiRes) {
              card.imageEntryHiRes = imageEntryHiRes.toURL();
              if (this.platform.is('ios')) {
                card.imageEntryHiRes = card.imageEntryHiRes.substring(7, card.imageEntryHiRes.length);
              }
            }
            this.storeCards(setCode, cards).then(() => {
              resolve(card);
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
    return this.storage.get('sets');
  }

  public getSetFromStorage(setCode: string): Promise<Set> {
    return new Promise((resolve, reject) => {
      this.getSetsFromStorage().then((sets: Set[]) => {
        let set = sets.find((set: Set) => {
          return set.code === setCode;
        });
        if (set) {
          resolve(set);
        } else {
          reject(new Error('set not found'));
        }
      }, (error) => {
        reject(error);
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
        if (card) {
          resolve(card);
        } else {
          reject(new Error('card not found'));
        }
      }, (error) => {
        reject(error);
      });
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
