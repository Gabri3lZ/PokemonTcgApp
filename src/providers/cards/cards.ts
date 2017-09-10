import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import {Set} from "../../model/set";
import {Card} from "../../model/card";

/*
  Generated class for the CardsProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class CardsProvider {

  private baseUrl = 'https://api.pokemontcg.io/v1';
  // private baseUrl = 'http://localhost:3000';
  private setsUrl = this.baseUrl + '/sets';
  private cardsUrl = this.baseUrl + '/cards';

  constructor(public http: Http) {
    console.log('Hello CardsProvider Provider');
  }

  public loadSets(): Promise<Set[]> {
    return new Promise((resolve, reject) => {
      this.http.get(this.setsUrl).map((res: Response) => res.json().sets.reverse()).subscribe((sets: Set[]) => {
        resolve(sets);
      });
    });
  }

  public loadSet(setCode: string): Promise<Set> {
    return new Promise((resolve, reject) => {
      this.http.get(this.setsUrl + '/' + setCode).map((res: Response) => res.json().set).subscribe((set: Set) => {
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
      }).map(res => res.json().cards.sort((card1: Card, card2: Card) => {
        return parseInt(card1.number) - parseInt(card2.number);
      })).subscribe((cards: Card[]) => {
        resolve(cards);
      });
    });
  }

  public loadCard(cardId: string): Promise<Card> {
    return new Promise((resolve, reject) => {
      this.http.get(this.cardsUrl + '/' + cardId).map(res => res.json().card).subscribe((card: Card) => {
        resolve(card);
      });
    });
  }

}
