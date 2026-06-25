import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email")
    .refine((value) => value.endsWith("@gmail.com") || value.endsWith("@icloud.com"), {
      message: "Only Gmail or iCloud addresses are accepted",
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const artSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  image: z.string().url(),
  price: z.number().min(1000),
  stock: z.number().min(1),
  style: z.string().min(1),
  theme: z.string().min(1),
  color: z.string().min(1),
  isCommission: z.boolean().optional(),
});

export const addressSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(9),
  address: z.string().min(8),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().min(4),
  isPrimary: z.boolean().optional(),
});

export const paymentSchema = z.object({
  type: z.string().min(3),
  bank: z.string().min(2),
  number: z.string().min(8),
  isPrimary: z.boolean().optional(),
});
