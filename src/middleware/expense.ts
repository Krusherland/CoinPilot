import type { Request, Response, NextFunction } from 'express';
import { param, validationResult, body} from 'express-validator';
import Expense from '../models/Expense';

declare global {
    namespace Express {
        interface Request {
            expense?: Expense
        }
    }
}

export const validateExpenseInput = async (req: Request, res: Response, next: NextFunction) => {

    await body('name')
        .isString().notEmpty().withMessage("Name is required").run(req)
    await body('amount')
        .isNumeric().withMessage("Amount must be a number").run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const validateExpenseId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expenseId } = req.params;
        const expense = await Expense.findByPk(expenseId as string);
        if (!expense) {
            const error = new Error('Expense not found');
            return res.status(404).json({ message: error.message });
        }
        req.expense = expense;
        next();
    }catch (error) {
        return res.status(500).json({ message: 'Error validating expense ID', error });
    }
}  