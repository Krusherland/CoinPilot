import { Router } from 'express';
import { BudgetController } from '../controllers/BudgetController';
import { hasAccess, validateBudget, validateBudgetId, validateBudgetInput, } from '../middleware/budget';
import { handleImputErrors } from '../middleware/validation';
import { ExpenseController } from '../controllers/ExpenseController';
import { validateExpenseId, validateExpenseInput } from '../middleware/expense';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate)

router.param('budgetId', validateBudget);
router.param('budgetId', validateBudgetId);
router.param('budgetId', validateBudgetInput);
router.param('budgetId', hasAccess);
router.param('expenseId', validateExpenseInput);
router.param('expenseId', validateExpenseId);

router.get('/', BudgetController.getAll);
router.get('/:budgetId', BudgetController.getBudgetById);
router.post('/', validateBudgetInput, BudgetController.create);
router.put('/:budgetId', validateBudgetInput, BudgetController.updateBudget);
router.delete('/:budgetId', BudgetController.deleteBudget); 

router.post('/:budgetId/expenses', validateExpenseInput, handleImputErrors, ExpenseController.create);
router.get('/:budgetId/expenses/:expenseId', validateExpenseInput, handleImputErrors, ExpenseController.getExpenseById);
router.put('/:budgetId/expenses/:expenseId', validateExpenseInput, handleImputErrors, ExpenseController.updateExpense);
router.delete('/:budgetId/expenses/:expenseId', validateExpenseId, ExpenseController.deleteExpense);


export default router;