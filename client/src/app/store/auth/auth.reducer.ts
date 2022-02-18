import {
  createReducer,
  on,
} from '@ngrx/store';
import { ISessionUser } from 'src/app/models/user';
import { fetchUserFail, fetchUserStart, fetchUserSuccess, loggedOut, setActivityMessages } from './auth.actions';

export interface IAuthState {
  user: ISessionUser | null;
  activity: {
    btnMessage: string;
    message: string;
  };
  fetchingUser: boolean;
}
const initialState: IAuthState = {
  user: null,
  activity: {
    btnMessage: 'Start Shopping',
    message: '',
  },
  fetchingUser: false
}

export const authReducer = createReducer(initialState,
  on(fetchUserStart, (state) => ({ ...state, fetchingUser: true })),
  on(fetchUserSuccess, fetchUserFail, (state) => ({ ...state, fetchingUser: false })),
  on(fetchUserFail, loggedOut, (state) => ({ ...state, user: initialState.user })),
  on(fetchUserSuccess, (state, { user }) => ({ ...state, user })),
  
  on(setActivityMessages, (state, { btnMessage, message }) => ({ ...state, activity: { btnMessage, message }})),
  on(loggedOut, (state) => ({ ...state, activity: initialState.activity })),
  )