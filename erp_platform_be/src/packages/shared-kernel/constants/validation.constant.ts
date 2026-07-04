export const VALIDATION = {
    STRING: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 255,
    },

    EMAIL: {
        MAX_LENGTH: 255,
    },

    PHONE: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 15,
    },

    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 50,
    },

    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100,
    },
} as const;