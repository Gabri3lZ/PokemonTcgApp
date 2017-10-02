import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Set} from "../../model/set";
import {Card} from "../../model/card";
import {File, FileEntry} from "@ionic-native/file";
import {FileTransfer, FileTransferObject} from "@ionic-native/file-transfer";
import {Platform} from "ionic-angular";
import {CardsLoader} from "../../interfaces/cards/cardsLoader";

@Injectable()
export class CardsLoaderPokemonTcgApiProvider implements CardsLoader {

  private baseUrl = 'https://api.pokemontcg.io/v1';
  private setsUrl = this.baseUrl + '/sets';
  private cardsUrl = this.baseUrl + '/cards';

  private fileTransfer: FileTransferObject;
  private storageDirectory: string = '';

  constructor(private http: Http,
              private platform: Platform,
              private file: File,
              private transfer: FileTransfer) {
  }

  public init(): Promise<void> {
      this.fileTransfer = this.transfer.create();
      if (this.platform.is('ios')) {
        this.storageDirectory = this.file.documentsDirectory;
      } else if (this.platform.is('android')) {
        this.storageDirectory = this.file.dataDirectory;
      }
      return Promise.resolve();
  }

  public downloadSets(): Promise<Set[]> {
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

  public downloadSet(setCode: string): Promise<Set> {
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

  public downloadCards(setCode: string): Promise<Card[]> {
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

  public downloadCard(cardId: string): Promise<Card> {
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
