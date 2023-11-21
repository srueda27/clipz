import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabComponent } from './tab.component';
import { By } from '@angular/platform-browser';

describe('TabComponent', () => {
  let component: TabComponent;
  let fixture: ComponentFixture<TabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should have .hidden class', () => {
    const element = fixture.debugElement.query(By.css('.hidden'))

    /*
    const element2 = fixture.nativeElement.querySelector('.hidden')

    const element3 = document.querySelector('.hidden') // No es la mejor manera pues un objeto podría no estar en el DOM en el momento
    */

    expect(element).toBeTruthy()
  });

  it('Should not have .hidden class', () => {
    component.active = true
    fixture.detectChanges() // Have to be run after changing the component's properties

    const element = fixture.debugElement.query(By.css('.hidden'))

    expect(element).not.toBeTruthy()
  })
});
