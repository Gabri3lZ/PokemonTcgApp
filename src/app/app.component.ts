import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {CardsProvider} from "../providers/cards/cards";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = 'loading-page';

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
              private cardsProvider: CardsProvider) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.cardsProvider.init().then(() => {
        this.rootPage = 'tabs-page';
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      });
    });
  }
}
