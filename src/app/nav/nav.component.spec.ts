import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { NavComponent } from './nav.component';
import { AuthService } from '../services/auth.service';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  /*
    The parameters are
    1- The Class of the objet we want to mock
    2- Array of methods to mock
    3- Object of properties that we want to mock from the class
  */
  const mockedAuthService = jasmine.createSpyObj('AuthService', [
    'createUser', 'logout'
  ], {
    isAuthenticated$: of(true) // An observable that always emits true
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavComponent],
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: mockedAuthService }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('It should display the logout link', () => {
    const logoutLink = fixture.debugElement.query(By.css('li:nth-child(3) a'))

    expect(logoutLink).withContext('Not logged in').toBeTruthy()

    logoutLink.triggerEventHandler('click')

    const service = TestBed.inject(AuthService)

    expect(service.logout)
      .withContext('Could not click logout link')
      .toHaveBeenCalledTimes(1)
  })

  it('It should display the logout link', () => {
    const links = fixture.debugElement.queryAll(By.css('li a'))
    let logoutLink: DebugElement | undefined

    for (let i = 0; i < links.length; i++) {
      const li = links[i]

      if ((li.nativeElement as HTMLLinkElement).innerHTML == 'Logout') {
        logoutLink = li
        break;
      }
    }

    expect(logoutLink).withContext('Not logged in').toBeTruthy()
  })

});
