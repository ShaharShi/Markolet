import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @Output() searchTerm = new EventEmitter<string>();
  @Input() placeholder: string = 'Search for Products'
  search$ = new Subject<string>();
  constructor() { }

  ngOnInit(): void {
    this.search$.pipe(debounceTime(500), distinctUntilChanged()).subscribe(term => {
      this.searchTerm.emit(term);
    })
  }
  handleChange = (t: EventTarget | null) => {
    if (!t) return;
    const target = t as HTMLInputElement;
    this.search$.next(target.value);
  }
}
