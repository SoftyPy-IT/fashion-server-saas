import * as z from 'zod';

export const createOrderSchema = z.object({
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string'
  }),
  company: z.string().max(255).optional(),
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string'
    })
    .email({
      message: 'Invalid email address'
    })
    .optional(),
  phone: z
    .string({
      required_error: 'Phone is required',
      invalid_type_error: 'Phone must be a string'
    })
    .min(10)
    .max(15),
  hasCoupon: z.boolean().optional(),
  couponCode: z.string().max(255).optional().nullable(),
  isGuestCheckout: z.boolean().optional().default(false),
  shippingAddress: z.object(
    {
      line1: z.string().min(1).max(255),
      line2: z.string().max(255).optional(),
      division: z.string().min(1).max(255),
      district: z.string().min(1).max(20),
      upazila: z.string().max(100).optional(),
      country: z.string().min(1).max(100),
      phone: z.string().min(10).max(15).optional()
    },
    {
      required_error: 'Shipping address is required',
      invalid_type_error: "Shipping address must be with 'line1', 'city', 'postalCode', 'country'"
    }
  ),
  paymentMethod: z.enum(['PayPal', 'Bank-in', 'Cash On Delivery'], {
    required_error: 'Payment method is required',
    invalid_type_error: 'Payment method must be one of "PayPal", "Bank-in", "Cash On Delivery"'
  }),
  orderItems: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
      price: z.number().min(0),
      variants: z
        .array(
          z
            .object({
              name: z.string().optional(),
              value: z.string().optional()
            })
            .optional()
        )
        .optional()
    }),
    {
      required_error: 'Order items are required',
      invalid_type_error:
        'Order items must be an array of objects  with "productId", "quantity", "price"'
    }
  ),
  subTotal: z
    .number({
      required_error: 'Sub total is required',
      invalid_type_error: 'Sub total must be a number'
    })
    .min(0),
  shippingCharge: z.number().min(0),
  total: z
    .number({
      required_error: 'Total is required',
      invalid_type_error: 'Total must be a number'
    })
    .min(0)
});
