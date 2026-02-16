import { Request, Response, NextFunction } from 'express';
import { param, validationResult, body} from 'express-validator';
import Budget from '../models/Budget';

declare global{
    namespace Express {
        interface Request {
            budget?: Budget;
        }
    }
}

export const validateBudget = async (req: Request, res: Response, next: NextFunction) => {
    await param('budgetId').isInt().withMessage("ID must be a valid number").run(req);
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
}

export const validateBudgetId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId } = req.params;
        const budget = await Budget.findByPk(budgetId as string);
        if (!budget) {
            const error = new Error('Budget not found');
            return res.status(404).json({ message: error.message });
        }
        req.budget = budget;
        next();
    }catch (error) {
        return res.status(404).json({ message: 'Error validating budget ID', error });
    }
}  

export const validateBudgetInput = async (req: Request, res: Response, next: NextFunction) => {

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

export function hasAccess(req: Request, res: Response, next: NextFunction) {
    if (req.budget.userId !== req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}