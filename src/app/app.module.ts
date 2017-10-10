import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {CardsProvider} from '../providers/cards/cards';
import {HttpModule} from "@angular/http";
import {ComponentsModule} from "../components/components.module";
import {EventsProvider} from '../providers/events/events';
import {IonicStorageModule} from "@ionic/storage";
import {File} from "@ionic-native/file";
import {FileTransfer} from "@ionic-native/file-transfer";
import {CardsLoaderPokemonTcgApiProvider} from "../providers/cards/cardsLoaderPokemonTcgApi";
import {CardsLoader} from "../interfaces/cards/cardsLoader";
import {CardsStorage} from "../interfaces/cards/cardsStorage";
import {SQLite} from "@ionic-native/sqlite";
import {CardsStorageLokiJsProvider} from "../providers/cards/cardsStorageLokiJs";
import {LokiStorageAdapter} from "../providers/adapter/lokiStorageAdapter";

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    ComponentsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    CardsProvider,
    {provide: CardsLoader, useClass: CardsLoaderPokemonTcgApiProvider},
    {provide: CardsStorage, useClass: CardsStorageLokiJsProvider},
    LokiStorageAdapter,
    EventsProvider,
    File,
    FileTransfer,
    SQLite
  ]
})
export class AppModule {}
