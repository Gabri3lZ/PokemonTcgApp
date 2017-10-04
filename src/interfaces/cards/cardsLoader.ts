import {Set} from "../../model/set";
import {Card} from "../../model/card";
import {FileEntry} from "@ionic-native/file";

export abstract class CardsLoader {
  abstract init(): Promise<void>;

  abstract downloadSets(): Promise<Set[]>;
  abstract downloadSet(setCode: string): Promise<Set>;
  abstract downloadCards(setCode: string): Promise<Card[]>;
  abstract downloadCard(cardId: string): Promise<Card>;

  abstract downloadSetImages(sets: Set[]): Promise<Set[]>;
  abstract downloadCardImages(cards: Card[]): Promise<Card[]>;
  abstract downloadCardImageHiRes(card: Card): Promise<Card>;

  abstract downloadFile(url: string, path: string): Promise<FileEntry>;
  abstract downloadFileWithFallback(urls: string[], path: string): Promise<FileEntry>;
}
