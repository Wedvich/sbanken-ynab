import { Reducer } from 'redux';
import { ModalId } from './types';

export enum ModalsActionType {
  Show = 'modals/open',
  Close = 'modals/close'
}

const openModal = (modalId: ModalId) => ({
  type: ModalsActionType.Show as ModalsActionType.Show,
  modalId,
});

const closeModal = (modalId: ModalId) => ({
  type: ModalsActionType.Close as ModalsActionType.Close,
  modalId,
});

export const actions = {
  openModal,
  closeModal,
};
export type ModalsAction = ReturnType<typeof actions[keyof typeof actions]>

export const modalsStateKey = 'modals';

const initialState = [] as ModalId[];

export type ModalsState = typeof initialState;

const reducer: Reducer<ModalsState, ModalsAction> = (state = initialState, action) => {
  switch (action.type) {
    case ModalsActionType.Show:
      return [action.modalId].concat(state.filter((id) => id !== action.modalId));

    case ModalsActionType.Close:
      return state.filter((id) => id !== action.modalId);

    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _invariant: never = action;
      return state;
    }
  }
};

export default reducer;
