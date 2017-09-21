export class Set {

  code: string;
  ptcgoCode: string;
  name: string;
  series: string;
  totalCards: number;
  standardLegal: boolean;
  expandedLegal: boolean;
  releaseDate: string;
  symbolUrl: string;
  image: string;

  imageUrl: string;
  imageUrlOld: string;
  imageUrlHiRes: string;

  constructor(set: Set) {
    if (set) {
      for (let key in set) {
        if (set.hasOwnProperty(key)) {
          this[key] = set[key];
        }
      }

      this.imageUrl = this.getImageUrl();
      this.imageUrlOld = this.getImageUrlOld();
      this.imageUrlHiRes = this.getImageUrlHiRes();
    }
  }

  private getImageUrl(): string {
    let setNumber = this.getSetNumber();
    let seriesCode = this.getSeriesCode();

    let url: string = 'https://assets.pokemon.com/assets/cms2/img/trading-card-game/series/';
    url += seriesCode + '_series/';
    url += seriesCode + setNumber + '/';
    url += seriesCode + setNumber + '-slider-logo-en.png';
    return url;
  }

  private getImageUrlOld(): string {
    let setNumber = this.getSetNumber();
    let seriesCode = this.getSeriesCode();

    let url: string = 'https://assets.pokemon.com/assets/cms2/img/trading-card-game/series/';
    url += seriesCode + '_series/';
    url += seriesCode + setNumber + '/';
    url += seriesCode + setNumber + '_slider_logo_en.png';
    return url;
  }

  private getImageUrlHiRes() {
    let setNumber = this.getSetNumber();
    let seriesCode = this.getSeriesCode();

    let url: string = 'https://assets.pokemon.com/assets/cms2/img/trading-card-game/series/';
    url += seriesCode + '_series/';
    url += seriesCode + setNumber + '/';
    url += seriesCode + setNumber + '_logo_169_en.png';
    return url;
  }

  private getSetNumber() {
    if (this.code.search(/[0-9]/g) > 0) {
      return ('0' + this.code.substring(this.code.search(/[0-9]/g), this.code.length)).slice(-2);
    } else {
      return '';
    }
  }

  private getSeriesCode() {
    return this.code.replace(/[0-9]*/g, '');
  }
}
