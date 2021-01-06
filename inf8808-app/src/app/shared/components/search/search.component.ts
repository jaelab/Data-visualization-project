import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { ClusteringConfig } from '../../graph-configuration';
import { autoComplete } from './auto-complete.js'
import * as d3 from 'd3';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  @Input() config: ClusteringConfig;
  @Output() zoomBubbleChart = new EventEmitter;

  private isSearching: boolean;

  constructor() {
    this.isSearching = false;
  }

  ngOnInit(): void {
    this.completeSearch();
    this.searchEvent();
  }

  private completeSearch(): void {
    let sources = this.config.dataset.map(row => {
      return row.Name + ' (' + row.Platform + ')' });
    sources.sort(function (a, b) {
      return d3.ascending(a, b);
    });

    let view = this;
    let ac = new autoComplete({
      selector: "#search-bar input",
      minChars: 1,
      source: function(term, suggest) {
        term = term.toLowerCase();
        var matches = [];
        sources.forEach(function(d) {
          if (~d.toLowerCase().indexOf(term)) {
            matches.push(d);
          }
        });
        suggest(matches);
      },
      renderItem: function(item, search) {
        search = search.replace(/['-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
        return `<div class='autocomplete-suggestion' data-val="`
          + item + `">` + item.replace(re, "<b>$1</b>") + "</div>";
      },
      onSelect: function(e, term, item) {
        view.validateInput();
      }
    });
  }

  private searchEvent(): void  {
    let searchBarInput = d3.select("#search-bar input");
    searchBarInput.on("keydown", d => {
      if (d3.event.key == "Enter") {
        this.validateInput();
      } else {
        this.isSearching = false;
        searchBarInput.classed("error", false);
      }
    });

    d3.select("#search-bar button")
      .on("click", d => {this.validateInput()});
  }

  private validateInput(): void {
    let searchBarInput = d3.select("#search-bar input");
    if (this.isSearching) {
      return;
    }

    function normalize(str) {
      let index = str.lastIndexOf(" (");
      let name = str.substring(0, index);
      let platform = str.substring(index, str.length);
      platform = platform.substring(1, platform.length-1)

      return [name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), platform];
    }

    let value = (searchBarInput.node() as HTMLInputElement).value.toLowerCase();
    if (!value) {
      return;
    }
    let [currentValue, currentPlatform] = normalize(value);
    
    const valueFound = this.config.dataset.find(function(game) {
      let val: string = game.Name.toLowerCase() + " (" + game.Platform.toLowerCase() + ")";
      if (normalize(val)[0] === currentValue && normalize(val)[1] === currentPlatform) {
        return game;
      } else {
        return null;
      }
    });
    
    if (valueFound) {
      this.isSearching = true;
      let index = this.config.dataset.indexOf(valueFound);
      this.zoomBubbleChart.emit(index.toString());
    } else {
      this.isSearching = false;
      searchBarInput.classed("error", true);
    }
  }

}
