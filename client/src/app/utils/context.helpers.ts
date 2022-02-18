import { createAction, props } from "@ngrx/store";

export function createActionsGroup<P extends object = object>(
    namespace: string,
    actionType: string
  ) {
    return {
      start: createAction(`[${namespace}] ${actionType} Start`),
      // @ts-ignore
      success: createAction(`[${namespace}] ${actionType} Success`, props<P?>()),
      fail: createAction(`[${namespace}] ${actionType} Fail`),
    };
  }