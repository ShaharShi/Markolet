import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { IState } from 'src/app/store/store';
import { APP_IMAGES } from 'src/app/utils/images';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  currentUserName!: string;
  fetchingUser$!: Observable<boolean>;
  isGuest: boolean = true;
  isHomePage: boolean = false;
  IMAGES = APP_IMAGES;

  constructor(private store: Store<IState>, private authService: AuthService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.router.events.subscribe((event: any) => {
      // Show navigate to home-page icon in every route, except home-page.
      if (event instanceof NavigationEnd) event.url === '/' ? this.isHomePage = true : this.isHomePage = false;
    });
    this.store.select('authState').subscribe((authState) => {
      this.currentUserName = `${authState.user?.firstName} ${authState.user?.lastName}`;
      this.isGuest = authState.user ? false : true;
    })
    this.fetchingUser$ = this.store.select(state => state.authState.fetchingUser)
  }
  navigateToHome = () => {
    this.router.navigate(['/'])
  }
  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: 'Are you sure you want to log out ?',
      panelClass: 'dialog-box'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.logout()
    });
  }
  logout = () => {
    this.authService.logout();
    this.navigateToHome()
  }

}