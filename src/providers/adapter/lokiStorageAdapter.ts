import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";

@Injectable()
export class LokiStorageAdapter implements LokiPersistenceInterface {

  constructor(private storage: Storage) {

  }

  loadDatabase(dbName: string, callback: (dataOrErr: (string | Error)) => void): void {
    this.storage.get(dbName).then((dbString: string) => {
      console.log('database loaded');
      callback(dbString);
    }, (error: Error) => {
      callback(error);
    });
  }

  saveDatabase(dbName: string, dbString: string, callback: (resOrErr: (void | Error)) => void): void {
    this.storage.set(dbName, dbString).then(() => {
      console.log('database saved');
      callback(null);
    }, (error: Error) => {
      callback(error);
    })
  }

  deleteDatabase(dbName: string, callback?: (resOrErr: (void | Error)) => void): void {
    this.storage.remove(dbName).then(() => {
      callback(null);
    }, (error: Error) => {
      callback(error);
    });
  }

}
