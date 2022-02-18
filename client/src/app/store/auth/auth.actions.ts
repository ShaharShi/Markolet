import { createAction, props } from '@ngrx/store';
import { IUser } from 'src/app/models/user';
import { createActionsGroup } from 'src/app/utils/context.helpers';

export const {
  start: fetchUserStart,
  success: fetchUserSuccess,
  fail: fetchUserFail,
} = createActionsGroup<{ user: Partial<IUser> }>('Auth', 'Fetch User');

export const loggedOut = createAction('[Auth] Log out user')
export const setActivityMessages = createAction('[Auth] Set Activity Messages', props<{ btnMessage: string, message: string }>())