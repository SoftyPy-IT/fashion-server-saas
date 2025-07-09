import * as z from 'zod';

export const createUnitSchema = z.object({
  unit_code: z.string({
    required_error: 'Unit must have a unit code',
    invalid_type_error: 'Unit code must be a string'
  }),
  name: z.string({
    required_error: 'Unit must have a name',
    invalid_type_error: 'Unit name must be a string'
  }),
  base_unit: z
    .string({
      invalid_type_error: 'Base unit must be a string'
    })
    .nullable()
    .optional(),

  operator: z
    .enum(['*', '/', '+', '-'], {
      errorMap: () => ({ message: 'Operator must be one of: *, /, +, -' })
    })
    .nullable()
    .optional(),
  operation_value: z
    .number({
      invalid_type_error: 'Operation value must be a number'
    })
    .nullable()
    .optional()
});

export const updateUnitSchema = z.object({
  unit_code: z
    .string({
      invalid_type_error: 'Unit code must be a string'
    })
    .optional(),
  name: z
    .string({
      invalid_type_error: 'Unit name must be a string'
    })
    .optional()
});
