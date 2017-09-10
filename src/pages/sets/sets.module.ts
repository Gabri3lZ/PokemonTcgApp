import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SetsPage } from './sets';

@NgModule({
  declarations: [
    SetsPage,
  ],
  imports: [
    IonicPageModule.forChild(SetsPage),
  ],
})
export class SetsPageModule {}
