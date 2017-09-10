import {Attack} from "./attack";
import {Weakness} from "./weakness";
import {Resistance} from "./resistance";
import {AncientTrait} from "./ancienttrait";
import {Ability} from "./ability";

export class Card {
  id: string;
  name: string;
  nationalPokedexNumber: number;
  // imageUrl: string;
  get imageUrl(): string {
    return 'http://localhost:8100/assets/img/mock/card.png';
  }
  set imageUrl(url) {
  }
  // imageUrlHiRes: string;
  get imageUrlHiRes(): string {
    return 'http://localhost:8100/assets/img/mock/card_hires.png';
  }
  set imageUrlHiRes(url) {
  }
  types: string[];
  supertype: string;
  subtype: string;
  evolvesFrom: string;
  ability: Ability;
  ancientTrait: AncientTrait;
  hp: string;
  retreatCost: string[];
  number: string;
  artist: string;
  rarity: string;
  series: string;
  set: string;
  setCode: string;
  text: string;
  attacks: Attack[];
  resistances: Resistance[];
  weaknesses: Weakness[];
}
