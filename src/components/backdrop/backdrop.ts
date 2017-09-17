import { Component } from '@angular/core';

@Component({
  selector: 'backdrop',
  templateUrl: 'backdrop.html'
})
export class BackdropComponent {

  text: string;

  constructor() {
    console.log('Hello BackdropComponent Component');
    this.text = 'Hello World';
  }

}
