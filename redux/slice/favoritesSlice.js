import { createSlice } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: {}, // object map use kar rahe hain { id: true }
  },
  reducers: {
    toggleFavorite: (state, action) => {
      const id = action.payload;
      if (state.items[id]) {
        delete state.items[id]; // remove if already fav
      } else {
        state.items[id] = true; // add as fav
      }
    },
    clearFavorites: state => {
      state.items = {};
    },
  },
});

export const { toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
