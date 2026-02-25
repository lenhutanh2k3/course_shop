import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Course } from './courseSlice';
import api from '../api/axios';

export interface CartItem {
    course: Course;
    quantity: number;
}

interface CartState {
    items: CartItem[];
}

const loadCartFromStorage = (): CartItem[] => {
    try {
        const serializedCart = localStorage.getItem('cart');
        if (serializedCart === null) return [];
        return JSON.parse(serializedCart);
    } catch (err) {
        return [];
    }
};

const saveCartToStorage = (items: CartItem[]) => {
    try {
        localStorage.setItem('cart', JSON.stringify(items));
    } catch (err) {
        console.error('Failed to save cart to localStorage', err);
    }
};

const initialState: CartState = {
    items: loadCartFromStorage(),
};

// --- Async Thunks for Backend Sync ---

// 1. Sync local cart to backend on login (prioritize backend data if it exists)
export const syncCartBackend = createAsyncThunk(
    'cart/syncBackend',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { cart: CartState };
            const localCourseIds = state.cart.items.map(item => item.course.id);

            // Send local items to backend to merge. The backend will return the combined cart.
            const response = await api.post('/cart/sync', { course_ids: localCourseIds });
            return response.data; // Expected format: { data: { items: [...] } }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi đồng bộ giỏ hàng');
        }
    }
);

// 2. Fetch cart from backend (e.g., on app load if already logged in)
export const fetchCartBackend = createAsyncThunk(
    'cart/fetchBackend',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/cart');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi tải giỏ hàng');
        }
    }
);

// --- Slice ---

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<Course>) => {
            const course = action.payload;
            const existingItem = state.items.find(item => item.course.id === course.id);
            if (!existingItem) {
                state.items.push({ course, quantity: 1 });
            }
            saveCartToStorage(state.items);

            // Background sync if logged in
            if (localStorage.getItem('auth-token')) {
                api.post('/cart/add', { course_id: course.id }).catch(console.error);
            }
        },
        removeFromCart: (state, action: PayloadAction<number>) => {
            const courseId = action.payload;
            state.items = state.items.filter(item => item.course.id !== courseId);
            saveCartToStorage(state.items);

            // Background sync if logged in
            if (localStorage.getItem('auth-token')) {
                api.delete(`/cart/${courseId}`).catch(console.error);
            }
        },
        clearCart: (state) => {
            state.items = [];
            saveCartToStorage(state.items);

            // Background sync if logged in
            if (localStorage.getItem('auth-token')) {
                api.delete('/cart/clear/all').catch(console.error);
            }
        }
    },
    extraReducers: (builder) => {
        // Handle sync and fetch success by overriding local state with strict DB data
        const handleBackendSuccess = (state: CartState, action: any) => {
            if (action.payload?.data?.items) {
                // Map backend items structure to match local Redux state structure
                const backendItems = action.payload.data.items.map((item: any) => ({
                    course: item.course,
                    quantity: item.quantity
                }));
                state.items = backendItems;
                saveCartToStorage(state.items); // Force local storage to match DB
            }
        };

        builder.addCase(syncCartBackend.fulfilled, handleBackendSuccess);
        builder.addCase(fetchCartBackend.fulfilled, handleBackendSuccess);
    }
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
