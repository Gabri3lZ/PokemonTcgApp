import {Injectable} from '@angular/core';
import {Set} from "../../model/set";
import {Card} from "../../model/card";
import {CardsStorage} from "../../interfaces/cards/cardsStorage";
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class CardsStorageSQLiteProvider implements CardsStorage {

  private db: SQLiteObject;

  constructor(private sqlite: SQLite) {
  }

  public init(): Promise<void> {
    return this.sqlite.create({
      name: 'data.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.db = db;

      this.db.executeSql('CREATE TABLE IF NOT EXISTS set(code TEXT PRIMARY KEY NOT NULL, ptcgoCode TEXT, name TEXT, series TEXT, totalCards INTEGER, standardLegal BOOLEAN, expandedLegal BOOLEAN, releaseDate DATE, symbolUrl TEXT, imageUrls TEXT, symbolEntry TEXT, imageEntry TEXT)', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));

      this.db.executeSql('CREATE TABLE IF NOT EXISTS card(id TEXT PRIMARY KEY NOT NULL, name TEXT, nationalPokedexNumber INTEGER, imageUrl TEXT, imageUrlHiRes TEXT, typesId, supertype TEXT, subtype TEXT, evolvesFrom TEXT, ability, ancientTrait, hp TEXT, retreatCost TEXT, number TEXT, artist TEXT, rarity TEXT, series TEXT, set TEXT, setCode TEXT, text TEXT, attacks, resistances, weaknesses, imageEntry TEXT, imageEntryHiRes TEXT)', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));

      this.db.executeSql('CREATE TABLE IF NOT EXISTS type(type TEXT PRIMARY KEY NOT NULL)', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));

      this.db.executeSql('CREATE TABLE IF NOT EXISTS ability(name TEXT NOT NULL, text TEXT, type TEXT, PRIMARY KEY (name, text, type))', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));

      this.db.executeSql('CREATE TABLE IF NOT EXISTS ancient_trait(name TEXT NOT NULL, text TEXT, PRIMARY KEY (name, text))', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));

      this.db.executeSql('CREATE TABLE IF NOT EXISTS attack(name TEXT NOT NULL, text TEXT, damage TEXT, cost TEXT, convertedEnergyCost INTEGER, PRIMARY KEY (name, text, damage, convertedEnergyCost))', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));

      this.db.executeSql('CREATE TABLE IF NOT EXISTS resistances(type TEXT NOT NULL, value TEXT, PRIMARY KEY (type, value))', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));

      this.db.executeSql('CREATE TABLE IF NOT EXISTS weaknesses(type TEXT NOT NULL, value TEXT, PRIMARY KEY (type, value))', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));

      this.db.executeSql('CREATE TABLE IF NOT EXISTS type_card(typeId TEXT NOT NULL, cardId TEXT NOT NULL)', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));

      this.db.executeSql('CREATE TABLE IF NOT EXISTS attack_card(attackId TEXT NOT NULL, cardId TEXT NOT NULL)', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));

      this.db.executeSql('CREATE TABLE IF NOT EXISTS resistance_card(resistanceId TEXT NOT NULL, cardId TEXT NOT NULL)', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));

      this.db.executeSql('CREATE TABLE IF NOT EXISTS weakness_card(weaknessId TEXT NOT NULL, cardId TEXT NOT NULL)', {})
        .then(() => console.log('Executed SQL'))
        .catch(e => console.log(e));

    }).catch((error) => {
      console.log(error);
      return Promise.reject(error);
    });
  }

  public storeSets(sets: Set[]): Promise<Set[]> {
    let sqlStatements: string[] = [];
    for (let set of sets) {
      let sqlStatement = 'INSERT OR REPLACE INTO set(code, ptcgoCode, name, series, totalCards, standardLegal, expandedLegal, releaseDate, symbolUrl, imageUrls, symbolEntry, imageEntry) VALUES('
      sqlStatement += set.code + ', ';
      sqlStatement += set.ptcgoCode + ', ';
      sqlStatement += set.name + ', ';
      sqlStatement += set.series + ', ';
      sqlStatement += set.totalCards + ', ';
      sqlStatement += set.standardLegal + ', ';
      sqlStatement += set.expandedLegal + ', ';
      sqlStatement += set.releaseDate + ', ';
      sqlStatement += set.symbolUrl + ', ';
      sqlStatement += set.imageUrls + ', ';
      sqlStatement += set.symbolEntry + ', ';
      sqlStatement += set.imageEntry + ');';
      sqlStatements.push(sqlStatement);
    }
    return this.db.sqlBatch(sqlStatements).then((resultSet) => {
      console.log(resultSet);
      return Promise.resolve(sets);
    });
  }

  public storeSet(set: Set): Promise<Set> {
    return Promise.resolve(null);
  }

  public storeCards(cards: Card[]): Promise<Card[]> {
    return Promise.resolve(null);
  }

  public storeCard(card: Card): Promise<Card> {
    return Promise.resolve(null);
  }

  public storeSetImages(setCode: string, cards: Card[]): Promise<Card[]> {
    return Promise.resolve(null);
  }

  public storeCardImageHiRes(setCode: string, card: Card): Promise<Card> {
    return Promise.resolve(null);
  }

  public getSetsFromStorage(): Promise<Set[]> {
    return Promise.resolve(null);
  }

  public getSetFromStorage(setCode: string): Promise<Set> {
    return Promise.resolve(null);
  }

  public getCardsFromStorage(setCode: string): Promise<Card[]> {
    return Promise.resolve(null);
  }

  public getCardFromStorage(cardId: string): Promise<Card> {
    return Promise.resolve(null);
  }
}
