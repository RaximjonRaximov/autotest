import { configureStore, createSlice } from "@reduxjs/toolkit";

// Load initial state from sessionStorage
const loadStateFromSessionStorage = () => {
  try {
    const serializedState = sessionStorage.getItem('cartState');
    if (serializedState === null) {
      return { test: [] }; // Default state if nothing is in sessionStorage
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading state from sessionStorage:", err);
    return { test: [] }; // Fallback to default state
  }
};

// Save state to sessionStorage
const saveStateToSessionStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem('cartState', serializedState);
  } catch (err) {
    console.error("Error saving state to sessionStorage:", err);
  }
};

const initialLoginState = loadStateFromSessionStorage();

const cartSlice = createSlice({
  name: "cart",
  initialState: initialLoginState,
  reducers: {
    addTest(state, action) {
      state.test = action.payload;
    },
  },
});

export const cartActions = cartSlice.actions;

const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
  },
});

// Subscribe to store updates to save state to sessionStorage
store.subscribe(() => {
  saveStateToSessionStorage(store.getState().cart);
});

export default store;