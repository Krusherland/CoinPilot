import { createRequest, createResponse } from 'node-mocks-http';
import { validateExpenseId } from '../../../middleware/expense';
import Expense from '../../../models/Expense';
import { ExpenseController } from '../../../controllers/ExpenseController';
import { expenses } from '../../mocks/expenses';

jest.mock('../../../models/Expense', () => ({
    findByPk: jest.fn(),
    create: jest.fn()
}));


describe('Expenses Middleware - validateExpenseId', () => {
    beforeEach(() => {
            (Expense.findByPk as jest.Mock).mockImplementation((id) => {
                const expense = expenses.find(e => e.id === id);
                return Promise.resolve(expense || null);
            });
        });
    
    it('should return 404 if expense is not found', async () => {
        
        const req = createRequest({
            method: 'GET',
            url: '/budgets/:budgetId/expenses/:expenseId',
            params: { expenseId: '999' }
        });
        const res = createResponse();

        await validateExpenseId(req, res, jest.fn());

        expect(res.statusCode).toBe(404);
        expect(res._getJSONData().message).toBe('Expense not found');
    });
});
