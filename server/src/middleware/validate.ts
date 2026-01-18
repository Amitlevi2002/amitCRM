import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => (req: any, res: any, next: any) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                errors: error.issues.map(err => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        next(error);
    }
};