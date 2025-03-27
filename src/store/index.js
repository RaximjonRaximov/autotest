import { configureStore, createSlice } from "@reduxjs/toolkit";

// Load initial state from sessionStorage
const loadStateFromSessionStorage = () => {
  try {
    const serializedState = sessionStorage.getItem("cartState");
    return serializedState
      ? JSON.parse(serializedState)
      : { test: [], categoryId: null, role_id: null, testTuri: null }; // testTuri qo'shildi
  } catch (err) {
    console.error("Error loading state:", err);
    return { test: [], categoryId: null, role_id: null, testTuri: null };
  }
};

// Save state to sessionStorage
const saveStateToSessionStorage = (state) => {
  try {
    sessionStorage.setItem("cartState", JSON.stringify(state));
  } catch (err) {
    console.error("Error saving state:", err);
  }
};

// Initial state
const initialState = loadStateFromSessionStorage();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addTest: (state, action) => {
      state.test = action.payload;
    },
    setCategoryId: (state, action) => {
      state.categoryId = action.payload;
    },
    setCurrentBiletId: (state, action) => {
      state.CurrentBiletId = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setRole_id: (state, action) => {
      state.role_id = action.payload;
    },
    setTestTuri: (state, action) => {
      state.testTuri = action.payload; // testTuri uchun reducer
    },
  },
});

// Export actions individually
export const cartActions = cartSlice.actions;

// Configure store
const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
  },
});

// Subscribe to store updates
store.subscribe(() => {
  saveStateToSessionStorage(store.getState().cart);
});

export default store;