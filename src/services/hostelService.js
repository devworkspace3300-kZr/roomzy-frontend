// Dummy API service — will be replaced with real API calls
import { hostels, featuredHostels } from '../data/hostels';

export const hostelService = {
    getAll: async (filters = {}) => {
        // Simulate API delay
        await new Promise((r) => setTimeout(r, 500));
        let result = [...hostels];

        if (filters.city) {
            result = result.filter((h) => h.city === filters.city);
        }
        if (filters.university) {
            result = result.filter((h) => h.nearUniversity === filters.university);
        }
        if (filters.minPrice) {
            result = result.filter((h) => h.price >= filters.minPrice);
        }
        if (filters.maxPrice) {
            result = result.filter((h) => h.price <= filters.maxPrice);
        }
        if (filters.roomType) {
            result = result.filter((h) => h.roomType === filters.roomType);
        }
        if (filters.amenities && filters.amenities.length > 0) {
            result = result.filter((h) =>
                filters.amenities.every((a) => h.amenities.includes(a))
            );
        }

        // Sorting
        if (filters.sortBy === 'price_low') {
            result.sort((a, b) => a.price - b.price);
        } else if (filters.sortBy === 'price_high') {
            result.sort((a, b) => b.price - a.price);
        } else if (filters.sortBy === 'rating') {
            result.sort((a, b) => b.rating - a.rating);
        }

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 9;
        const start = (page - 1) * limit;
        const paginatedResult = result.slice(start, start + limit);

        return {
            data: paginatedResult,
            total: result.length,
            page,
            totalPages: Math.ceil(result.length / limit),
        };
    },

    getById: async (id) => {
        await new Promise((r) => setTimeout(r, 300));
        return hostels.find((h) => h.id === id) || null;
    },

    getFeatured: async () => {
        await new Promise((r) => setTimeout(r, 300));
        return featuredHostels;
    },

    getSimilar: async (id) => {
        await new Promise((r) => setTimeout(r, 300));
        const hostel = hostels.find((h) => h.id === id);
        if (!hostel) return [];
        return hostels
            .filter((h) => h.id !== id && h.city === hostel.city)
            .slice(0, 4);
    },
};
