import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Set } from "../../model/set";
import {CardsStorage} from "../../interfaces/cards/cardsStorage";

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

  constructor(private navCtrl: NavController,
              private cardsStorage: CardsStorage) {
    this.cardsStorage.getSetsFromStorage().then((sets: Set[]) => {
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
