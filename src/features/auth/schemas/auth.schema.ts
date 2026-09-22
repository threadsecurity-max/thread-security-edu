import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' }),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please provide a valid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
    confirmPassword: z.string(),
    careerGoal: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
