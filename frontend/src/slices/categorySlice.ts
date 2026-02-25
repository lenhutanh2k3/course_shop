import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    categories: [],
    loading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/categories');
            return response.data;
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
        }
    }
);

// Add Category
export const addCategory = createAsyncThunk(
    'categories/addCategory',
    async (categoryData: { name: string; description?: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/admin/categories', categoryData);
            return response.data;
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to add category');
        }
    }
);

// Update Category
export const updateCategory = createAsyncThunk(
    'categories/updateCategory',
    async ({ id, data }: { id: number; data: { name: string; description?: string } }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/admin/categories/${id}`, data);
            return response.data;
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to update category');
        }
    }
);

// Delete Category
export const deleteCategory = createAsyncThunk(
    'categories/deleteCategory',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/categories/${id}`);
            return id;
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to delete category');
        }
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch
        builder.addCase(fetchCategories.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCategories.fulfilled, (state, action) => {
            state.loading = false;
            state.categories = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
        });
        builder.addCase(fetchCategories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Add
        builder.addCase(addCategory.fulfilled, (state, action) => {
            state.categories.push(action.payload);
        });

        // Update
        builder.addCase(updateCategory.fulfilled, (state, action) => {
            const index = state.categories.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.categories[index] = action.payload;
            }
        });

        // Delete
        builder.addCase(deleteCategory.fulfilled, (state, action) => {
            state.categories = state.categories.filter(c => c.id !== action.payload);
        });
    },
});

export default categorySlice.reducer;
