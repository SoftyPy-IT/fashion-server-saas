import * as z from 'zod';

const phoneRegex = new RegExp(/(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/);

export const changePasswordSchema = z.object({
  oldPassword: z.string({
    required_error: 'Please enter your old password',
    invalid_type_error: 'Old password must be a string'
  }),
  newPassword: z
    .string({
      required_error: 'Please enter your new password',
      invalid_type_error: 'New password must be a string'
    })
    .min(6, { message: 'Password must be at least 6 characters long' })
});

export const updateProfileSchema = z.object({
  firstName: z
    .string({
      required_error: 'Please enter your first name',
      invalid_type_error: 'First name must be a string'
    })
    .optional(),
  lastName: z
    .string({
      required_error: 'Please enter your last name',
      invalid_type_error: 'Last name must be a string'
    })
    .optional(),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number').optional(),
  dateOfBirth: z
    .string({
      required_error: 'Please enter your date of birth',
      invalid_type_error: 'Date of birth must be a string'
    })

    .optional(),
  address: z
    .object({
      address: z
        .string({
          required_error: 'Please enter your address',
          invalid_type_error: 'Address must be a string'
        })
        .optional(),
      city: z
        .string({
          required_error: 'Please enter your city',
          invalid_type_error: 'City must be a string'
        })
        .optional(),
      postalCode: z
        .string({
          required_error: 'Please enter your postal code',
          invalid_type_error: 'Postal code must be a string'
        })
        .optional(),
      country: z
        .string({
          required_error: 'Please enter your country',
          invalid_type_error: 'Country must be a string'
        })
        .optional()
    })
    .optional()
});

const UserStatus = ['active', 'inactive', 'banned'] as const;

export const userChangeStatusValidationSchema = z.object({
  status: z.enum([...UserStatus] as [string, ...string[]], {
    required_error: 'Please enter the status',
    invalid_type_error: 'Status must be a string'
  })
});

const UserRole = ['user', 'admin'] as const;

export const userRoleChangeValidationSchema = z.object({
  role: z.enum([...UserRole] as [string, ...string[]], {
    required_error: 'Please enter the role',
    invalid_type_error: 'Role must be a string'
  })
});

export const createUserByAdminSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum([...UserRole] as [string, ...string[]], {
    required_error: 'Please enter the role',
    invalid_type_error: 'Role must be a string'
  }),
  firstName: z.string({
    required_error: 'Please enter first name',
    invalid_type_error: 'First name must be a string'
  }),
  lastName: z.string({
    required_error: 'Please enter last name',
    invalid_type_error: 'Last name must be a string'
  }),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      zipCode: z.string().optional()
    })
    .optional()
});

export const updateUserByAdminSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional(),
  firstName: z
    .string({
      required_error: 'Please enter first name',
      invalid_type_error: 'First name must be a string'
    })
    .optional(),
  lastName: z
    .string({
      required_error: 'Please enter last name',
      invalid_type_error: 'Last name must be a string'
    })
    .optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      zipCode: z.string().optional()
    })
    .optional()
});
