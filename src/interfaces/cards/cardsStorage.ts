import {Set} from "../../model/set";
import {Card} from "../../model/card";

export abstract class CardsStorage {
  abstract init(): Promise<void>;

  abstract storeSets(sets: Set[]): Promise<Set[]>;
  abstract storeSet(set: Set): Promise<Set>;
  abstract storeCards(cards: Card[]): Promise<Card[]>;
  abstract storeCard(card: Card): Promise<Card>;

  abstract getSetsFromStorage(): Promise<Set[]>;
  abstract getSetFromStorage(setCode: string): Promise<Set>;
  abstract getCardsFromStorage(setCode: string): Promise<Card[]>;
  abstract getCardFromStorage(cardId: string): Promise<Card>;
}
