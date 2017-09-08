import {Attack} from "./attack";
import {Weakness} from "./weakness";
import {Resistance} from "./resistance";
import {AncientTrait} from "./ancienttrait";
import {Ability} from "./ability";

export class Card {
  id: string;
  name: string;
  nationalPokedexNumber: number;
  imageUrl: string;
  imageUrlHiRes: string;
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
