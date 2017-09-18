import { NgModule } from '@angular/core';
import { BackdropComponent } from './backdrop/backdrop';
import { CommonModule } from "@angular/common";

@NgModule({
	declarations: [BackdropComponent],
	imports: [CommonModule],
	exports: [BackdropComponent],
  entryComponents: [
    BackdropComponent
  ],
})
export class ComponentsModule {}
