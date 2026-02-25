import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export interface Course {
    id: number;
    title: string;
    slug: string;
    description: string;
    instructor: string;
    original_price: number;
    discounted_price: number;
    image_url: string;
    category_id?: number;
    category?: {
        id: number;
        name: string;
        slug: string;
    };
    is_published?: number;
    download_file_path?: string;
    download_file_name?: string;
    // Add other fields as necessary from backend model
    rating?: number; // Backend might not send this yet, handling optionally
    reviews_count?: number;
    duration?: string;
}

interface CourseState {
    courses: Course[];
    featuredCourses: Course[];
    currentCourse: Course | null;
    loading: boolean;
    error: string | null;
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    } | null;
}

const initialState: CourseState = {
    courses: [],
    featuredCourses: [],
    currentCourse: null,
    loading: false,
    error: null,
    pagination: null,
};

export const fetchCourses = createAsyncThunk(
    'courses/fetchCourses',
    async (params: any = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/courses', { params });
            return response.data; // Assuming backend returns { data: [...] } or [...]
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch courses');
        }
    }
);

export const fetchAdminCourses = createAsyncThunk(
    'courses/fetchAdminCourses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/courses');
            return response.data.data;
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch admin courses');
        }
    }
);

export const fetchTrashedCourses = createAsyncThunk(
    'courses/fetchTrashedCourses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/courses/trashed');
            return response.data.data;
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch trashed courses');
        }
    }
);

export const restoreCourse = createAsyncThunk(
    'courses/restoreCourse',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.post(`/admin/courses/${id}/restore`);
            return id;
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to restore course');
        }
    }
);

export const forceDeleteCourse = createAsyncThunk(
    'courses/forceDeleteCourse',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/courses/${id}/force`);
            return id;
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to force delete course');
        }
    }
);

export const fetchCourseBySlug = createAsyncThunk(
    'courses/fetchCourseBySlug',
    async (slug: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/courses/${slug}`);
            return response.data;
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch course');
        }
    }
);

export const fetchFeaturedCourses = createAsyncThunk(
    'courses/fetchFeaturedCourses',
    async (_, { rejectWithValue }) => {
        try {
            // If backend doesn't have a specific featured endpoint, we might just take the first few or filter.
            // For now, let's assume we can pass a param or just fetch all and slice in component, 
            // but better to fetch fewer. Let's try fetching all for now as prototype.
            const response = await api.get('/courses');
            return response.data;
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch featured courses');
        }
    }
);

export const deleteCourse = createAsyncThunk(
    'courses/deleteCourse',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/courses/${id}`);
            return id;
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to delete course');
        }
    }
);

export const addCourse = createAsyncThunk(
    'courses/addCourse',
    async (courseData: FormData | any, { rejectWithValue }) => {
        try {
            const isFormData = courseData instanceof FormData;
            const response = await api.post('/admin/courses', courseData, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to add course');
        }
    }
);

export const updateCourse = createAsyncThunk(
    'courses/updateCourse',
    async ({ id, data }: { id: number; data: FormData | any }, { rejectWithValue }) => {
        try {
            // Laravel requires POST method with _method=PUT to parse multipart/form-data properly
            let isFormData = data instanceof FormData;
            if (isFormData) {
                data.append('_method', 'PUT');
                const response = await api.post(`/admin/courses/${id}`, data);
                return response.data;
            } else {
                const response = await api.put(`/admin/courses/${id}`, data);
                return response.data;
            }
        } catch (error: unknown) {
            const err = error as any;
            return rejectWithValue(err.response?.data?.message || 'Failed to update course');
        }
    }
);

const courseSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {
        clearCurrentCourse: (state) => {
            state.currentCourse = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Courses
        builder.addCase(fetchCourses.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCourses.fulfilled, (state, action) => {
            state.loading = false;
            const apiData = action.payload?.data;
            if (apiData && Array.isArray(apiData.courses)) {
                state.courses = apiData.courses;
            } else if (apiData && Array.isArray(apiData.data)) {
                state.courses = apiData.data;
            } else if (Array.isArray(apiData)) {
                state.courses = apiData;
            } else if (Array.isArray(action.payload)) {
                state.courses = action.payload;
            } else {
                state.courses = [];
            }

            // Extract Pagination Metadata
            if (apiData && apiData.pagination) {
                state.pagination = {
                    current_page: apiData.pagination.current_page,
                    last_page: apiData.pagination.last_page,
                    total: apiData.pagination.total,
                    per_page: apiData.pagination.per_page,
                };
            }
        });
        builder.addCase(fetchCourses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch Admin Courses
        builder.addCase(fetchAdminCourses.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAdminCourses.fulfilled, (state, action) => {
            state.loading = false;
            state.courses = action.payload || [];
        });
        builder.addCase(fetchAdminCourses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch Trashed Courses
        builder.addCase(fetchTrashedCourses.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchTrashedCourses.fulfilled, (state, action) => {
            state.loading = false;
            state.courses = action.payload || [];
        });
        builder.addCase(fetchTrashedCourses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch Course By Slug
        builder.addCase(fetchCourseBySlug.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCourseBySlug.fulfilled, (state, action) => {
            state.loading = false;
            // Handle different API response wrappers
            if (action.payload?.data?.data) {
                state.currentCourse = action.payload.data.data;
            } else if (action.payload?.data) {
                state.currentCourse = action.payload.data;
            } else {
                state.currentCourse = action.payload;
            }
        });
        builder.addCase(fetchCourseBySlug.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch Featured Courses
        builder.addCase(fetchFeaturedCourses.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchFeaturedCourses.fulfilled, (state, action) => {
            state.loading = false;
            let allCourses: Course[] = [];
            const apiData = action.payload?.data;

            if (apiData && Array.isArray(apiData.courses)) {
                allCourses = apiData.courses;
            } else if (apiData && Array.isArray(apiData.data)) {
                allCourses = apiData.data;
            } else if (Array.isArray(apiData)) {
                allCourses = apiData;
            } else if (Array.isArray(action.payload)) {
                allCourses = action.payload;
            }
            state.featuredCourses = allCourses.slice(0, 4);
        });
        builder.addCase(fetchFeaturedCourses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Delete Course
        builder.addCase(deleteCourse.fulfilled, (state, action) => {
            state.courses = state.courses.filter(course => course.id !== action.payload);
        });

        // Add/Update Course logic - typically we just navigate back or refresh list, 
        // but can update state if needed. For now, detailed handling in component.
        builder.addCase(addCourse.fulfilled, () => {
            // No-op or notification trigger
        });
        builder.addCase(updateCourse.fulfilled, () => {
            // No-op
        });
    },
});

export const { clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
