import { z } from 'zod';

// Email validation
export const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters');

// Password validation - min 8 chars, at least 1 number
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/\d/, 'Password must contain at least one number');

// Signup schema
export const signupSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(['user', 'artisan']).optional().default('user'),
    name: z.string().max(255).optional(),
    bio: z.string().max(1000).optional(),
    profile_image: z.string().url().optional().nullable(),
}).refine(
    (data) => data.role !== 'artisan' || (data.name && data.name.trim().length > 0),
    { message: 'Name is required for artisans', path: ['name'] }
);

// Login schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

// Sanitize string - remove potentially harmful characters
export function sanitizeString(str: string): string {
    return str
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>]/g, ''); // Remove remaining angle brackets
}

// Product validation
export const productSchema = z.object({
    name: z
        .string()
        .min(1, 'Product name is required')
        .max(255, 'Product name must be less than 255 characters')
        .transform(sanitizeString),
    description: z
        .string()
        .max(5000, 'Description must be less than 5000 characters')
        .optional()
        .transform((val) => val ? sanitizeString(val) : val),
    price: z
        .union([z.string(), z.number()])
        .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
        .refine((val) => !isNaN(val) && val >= 0, 'Price must be a positive number')
        .refine((val) => val <= 999999.99, 'Price must be less than 1,000,000'),
    categories: z.array(z.number().int().positive()).optional(),
});

// Review validation
export const reviewSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(255, 'Name must be less than 255 characters')
        .transform(sanitizeString),
    comment: z
        .string()
        .min(1, 'Comment is required')
        .max(2000, 'Comment must be less than 2000 characters')
        .transform(sanitizeString),
    star_rating: z
        .number()
        .int('Rating must be a whole number')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5'),
});

// Address validation
export const addressSchema = z.object({
    label: z.string().max(100).optional(),
    name: z
        .string()
        .min(1, 'Name is required')
        .max(255, 'Name must be less than 255 characters')
        .transform(sanitizeString),
    street: z
        .string()
        .min(1, 'Street address is required')
        .max(255, 'Street must be less than 255 characters')
        .transform(sanitizeString),
    city: z
        .string()
        .min(1, 'City is required')
        .max(100, 'City must be less than 100 characters')
        .transform(sanitizeString),
    state: z.string().max(100).optional(),
    zip: z
        .string()
        .min(1, 'ZIP code is required')
        .max(20, 'ZIP code must be less than 20 characters'),
    country: z.string().max(100).optional().default('USA'),
    is_default: z.boolean().optional().default(false),
});

// Helper to format Zod errors for API responses
export function formatZodError(error: z.ZodError): string {
    return error.issues.map((issue) => issue.message).join(', ');
}

// Profile update validation
export const profileUpdateSchema = z.object({
    name: z
        .string()
        .max(255, 'Name must be less than 255 characters')
        .transform(sanitizeString)
        .optional(),
    email: emailSchema.optional(),
    artisanName: z
        .string()
        .max(255, 'Shop name must be less than 255 characters')
        .transform(sanitizeString)
        .optional(),
    artisanBio: z
        .string()
        .max(1000, 'Bio must be less than 1000 characters')
        .transform(sanitizeString)
        .optional(),
});

// Change password validation
export const changePasswordSchema = z.object({
    type: z.literal('password'),
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    { message: 'New passwords do not match', path: ['confirmPassword'] }
);

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
