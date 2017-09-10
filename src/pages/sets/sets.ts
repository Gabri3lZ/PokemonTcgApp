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
    this.cardsProvider.loadSets().then((sets: Set[]) => {
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

  getImageUrlMock(set: Set): string {
    return 'http://localhost:8100/assets/img/mock/sm02-slider-logo-en.png';
  }

  getImageUrl(set: Set): string {
    let setNumber = this.getSetNumber(set.code);
    let seriesCode = this.getSeriesCode(set.code);

    let url: string = 'https://assets.pokemon.com/assets/cms2/img/trading-card-game/series/';
    url += seriesCode + '_series/';
    url += seriesCode + setNumber + '/';
    url += seriesCode + setNumber + '-slider-logo-en.png';
    return url;
  }

  getImageUrlOld(set: Set): string {
    let setNumber = this.getSetNumber(set.code);
    let seriesCode = this.getSeriesCode(set.code);

    let url: string = 'https://assets.pokemon.com/assets/cms2/img/trading-card-game/series/';
    url += seriesCode + '_series/';
    url += seriesCode + setNumber + '/';
    url += seriesCode + setNumber + '_slider_logo_en.png';
    return url;
  }

  getImageUrlHiRes(set: Set) {
    let setNumber = this.getSetNumber(set.code);
    let seriesCode = this.getSeriesCode(set.code);

    let url: string = 'https://assets.pokemon.com/assets/cms2/img/trading-card-game/series/';
    url += seriesCode + '_series/';
    url += seriesCode + setNumber + '/';
    url += seriesCode + setNumber + '_logo_169_en.png';
    return url;
  }

  private getSetNumber(setCode: string) {
    if (setCode.search(/[0-9]/g) > 0) {
      return ('0' + setCode.substring(setCode.search(/[0-9]/g), setCode.length)).slice(-2);
    } else {
      return '';
    }
  }

  private getSeriesCode(setCode: string) {
    return setCode.replace(/[0-9]*/g, '');
  }

  itemTapped(event, set: Set) {
    this.navCtrl.push('set-page', {
      setCode: set.code,
      set: set
    });
  }
}
