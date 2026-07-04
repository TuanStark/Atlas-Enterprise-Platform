export const REGEX = {
    EMAIL:
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    PHONE_NUMBER:
        /^\+?[1-9]\d{7,14}$/,

    USERNAME:
        /^[a-zA-Z0-9._-]{4,30}$/,

    PASSWORD:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,50}$/,

    UUID:
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;