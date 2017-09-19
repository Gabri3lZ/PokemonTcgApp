import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Set } from "../../model/set";
import { CardsProvider } from "../../providers/cards/cards";

@IonicPage({
  name: 'sets-page',
  segment: 'sets'
})
@Component({
  selector: 'page-sets',
  templateUrl: 'sets.html'
})
export class SetsPage {
  sets: Set[] = [];
  series: string[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private cardsProvider: CardsProvider) {
    this.cardsProvider.getSetsFromStorage().then((sets: Set[]) => {
      this.sets = sets;
      for (let set of sets) {
        if (this.series.indexOf(set.series) < 0) {
          this.series.push(set.series);
        }
      }
    });
  }

  getSets(serie: string) {
    return this.sets.filter((set: Set) => {
      return set.series === serie;
    });
  }

  itemTapped(event, set: Set) {
    this.navCtrl.push('set-page', {
      setCode: set.code,
      set: set
    });
  }
}
