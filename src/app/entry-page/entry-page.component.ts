import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-entry-page',
  templateUrl: './entry-page.component.html',
  styleUrls: ['./entry-page.component.scss']
})
export class EntryPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('entry page')
  }

}
