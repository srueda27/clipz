import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { TabsContainerComponent } from './tabs-container.component';
import { TabComponent } from '../tab/tab.component';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <app-tabs-container>
      <app-tab tabTitle='Tab 1'>Tab 1</app-tab>
      <app-tab tabTitle='Tab 2'>Tab 2</app-tab>
    </app-tabs-container>
  `
})
class TestHostComponent { } // Needed to test the TabsContainer component because it has a tabcomponent dependency

describe('TabsContainerComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabsContainerComponent, TabComponent, TestHostComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 2 tabs', () => {
    // Select an rendered element directly in the Debug DOM
    const tabs = fixture.debugElement.queryAll(By.css('li'));

    expect(tabs.length).withContext("Tabs did not render").toBe(2);
  });

  it('should have 2 tabs', () => {
    // Selecting the tabs property from the component
    const containerComponent = fixture.debugElement.query(By.directive(TabsContainerComponent))

    const tabsProp = containerComponent.componentInstance.tabs

    expect(tabsProp.length).withContext("Could not grab component property").toBe(2);
  });
});
