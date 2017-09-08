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
  private setsUrl = this.baseUrl + '/sets';
  private cardsUrl = this.baseUrl + '/cards';

  constructor(public http: Http) {
    console.log('Hello CardsProvider Provider');
  }

  public loadSets(): Promise<Set[]> {
    return new Promise((resolve, reject) => {
      this.http.get(this.setsUrl).map((res: Response) => res.json().sets).subscribe((sets: Set[]) => {
        resolve(sets);
      });
    });
  }

  public loadCards(setCode: string): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      this.http.get(this.cardsUrl, {
        params: {
          setCode: setCode
        }
      }).map(res => res.json().cards).subscribe((cards: Card[]) => {
        resolve(cards);
      });
    });
  }

}
