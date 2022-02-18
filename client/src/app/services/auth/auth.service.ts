import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CookieService } from 'ngx-cookie-service';
import { lastValueFrom } from 'rxjs';
import { ISessionUser, IUser } from 'src/app/models/user';
import { fetchUserFail, fetchUserStart, fetchUserSuccess, loggedOut } from 'src/app/store/auth/auth.actions';
import { IState } from 'src/app/store/store';
import { environment } from 'src/environments/environment';


const API_BASE_URL = !environment.production ? 'http://localhost:4000/api/auth' : 'api/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private store: Store<IState>, private http: HttpClient, private cookieService: CookieService, private router: Router) { }

  login = async (email: string, password: string) => {
    this.store.dispatch(fetchUserStart());

    try {
      const results = await lastValueFrom<{ jwt: string, user: Pick<IUser, 'firstName' | 'lastName' | 'email' | 'isAdmin'> }>(
        this.http.get<{ jwt: string, user: Pick<IUser, 'firstName' | 'lastName' | 'email' | 'isAdmin'> }>(`${API_BASE_URL}/login`, {
          params: { email, password },
        })
      );
      if (!results.jwt) throw new Error('Login action failed due to unknown reason, please try again !.');

      this.cookieService.set('JWT', results.jwt)
      this.store.dispatch(fetchUserSuccess({ user: results.user }))
      return { user: results.user };
      
    } catch (error: any) {
      this.store.dispatch(fetchUserFail())
      console.log({ errorAt: '[AuthService] login method', message: error.error?.message, status: error?.status })
      return { error: error.error?.message }
    }
  }
  signup = async (user: Omit<IUser, '_id' | 'isAdmin'>) => {
    if (!user) return 'All Parametes are required !';
    this.store.dispatch(fetchUserStart());
    try {
      const results = await lastValueFrom<{ jwt: string, user: Pick<IUser, 'firstName' | 'lastName' | 'email'> }>(
        this.http.post<{ jwt: string, user: Pick<IUser, 'firstName' | 'lastName' | 'email'> }>(`${API_BASE_URL}/signup`, {
          personalID: user.personalID,
          email: user.email,
          password: user.password,
          city: user.address.city,
          street: user.address.street,
          firstName: user.firstName,
          lastName: user.lastName,
        })
      );
      if (!results.jwt) throw new Error('Signup action failed due to unknown reason, please try again !.');

      this.cookieService.set('JWT', results.jwt)
      this.store.dispatch(fetchUserSuccess({ user: results.user }))
      return null;
      
    } catch (error: any) {
      this.store.dispatch(fetchUserFail())
      console.log({ errorAt: '[AuthService] Signup method', message: error.error?.message, status: error?.status })
      return error.error?.message
    }
  }
  validateEmailAndPersonalID = async (email: string, personalID: string) => {
    try {
      return await lastValueFrom<null | { message: string }>(
        this.http.get<null | { message: string }>(`${API_BASE_URL}/validate-user`, {
          params: { email, personalID },
        })
      );
    } catch (error: any) {
      console.log({ errorAt: '[AuthService] validateEmailAndPersonalID method', message: error.error?.message, status: error?.status })
      return error.error?.message
    }
  }
  logout = () => {
    this.store.dispatch(loggedOut());
    this.cookieService.delete('JWT');
    this.router.navigate(['/']);
  }
  getAuthorizationHeader = () => {
    const token = this.cookieService.get('JWT');
    return token ? { "Authorization": `Bearer ${token}`} : null;
  }
  fetchUserSession = async (): Promise<ISessionUser | null> => {
    // fetchUserSession method has two goals:
    // 1. the main goal is to fetch the current user (ISessionUser), and update the auth state.
    // 2. check if the saved JWT is valid through the server and return the fetched user or null if there is'nt a user.
    // every route activate this method to check in real time with the server, if the session JWT (user) is valid, and to check which type the user is (customer, admin).

    const authHeader = this.getAuthorizationHeader();
    if (!authHeader) return null;
    this.store.dispatch(fetchUserStart());
    try {
      const results = await lastValueFrom<{user: ISessionUser | null , jwt?: string | undefined }>(
        this.http.get<{user: ISessionUser | null }>(`${API_BASE_URL}/user`, {
          headers: { ...authHeader }
        })
      );
      
      if (results.jwt) this.cookieService.set('JWT', results.jwt)
      if (!results.user) return null;
      this.store.dispatch(fetchUserSuccess({ user: results.user }));

      return results.user;
    } catch (error: any) {
      this.store.dispatch(fetchUserFail())
      console.log({ errorAt: '[AuthService] fetchUserSession method', message: error.error?.message, status: error?.status })
      return null;
    }
  }
}
