import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  // The pipe need to be inyected as providers for the component 
  providers: [DatePipe]
})
export class ClipsListComponent implements OnInit, OnDestroy {
  @Input()
  scrollable = true

  constructor(public clipService: ClipService) {
    this.clipService.getClips()
  }

  ngOnInit(): void {
    if (this.scrollable) {
      window.addEventListener('scroll', this.handleScroll)
    }
  }

  ngOnDestroy(): void {
    if (this.scrollable) {
      window.removeEventListener('scroll', this.handleScroll)
    }

    this.clipService.pageClips = []
  }

  // is being define as a arrow function because otherwise we wouldn't be able to access the component inyected services
  handleScroll = () => {
    const { scrollTop, offsetHeight } = document.documentElement
    const { innerHeight } = window

    const bottomOfWindow = Math.floor(scrollTop) + innerHeight === offsetHeight

    if (bottomOfWindow) {
      this.clipService.getClips()
    }
  }
}
