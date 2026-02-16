import { createRequest, createResponse } from 'node-mocks-http';
import {  } from '../../../middleware/expense';
import Expense from '../../../models/Expense';
import { ExpenseController } from '../../../controllers/ExpenseController';

jest.mock('../../../models/Expense', () => ({
    findByPk: jest.fn(),
    create: jest.fn()
}));

describe('ExpenseController.create', () => {
    it('should create a new expense and return it', async () => {
        const expenseMock = {
            save: jest.fn()
        };

        (Expense.create as jest.Mock).mockResolvedValue(expenseMock);

        const req = createRequest({
            method: 'POST',
            url: '/budgets/:budgetId/expenses',
            body: { name: 'Test Expense', amount: 100 },
            budget: { id: '1' }
        });
        const res = createResponse();

        await ExpenseController.create(req, res);

        expect(res.statusCode).toBe(201);
        expect(res._getJSONData().message).toBe('Expense created successfully');
        expect(res._getJSONData().expense.budgetId).toBe('1');
        expect(Expense.create).toHaveBeenCalledWith({ name: 'Test Expense', amount: 100 });
        expect(expenseMock.save).toHaveBeenCalled();
    });

    it('should return 500 if there is an error creating the expense', async () => {
        const expenseMock = {
            save: jest.fn()
        };

        (Expense.create as jest.Mock).mockRejectedValue(new Error());

        const req = createRequest({
            method: 'POST',
            url: '/budgets/:budgetId/expenses',
            body: { name: 'Test Expense', amount: 100 },
            budget: { id: '1' }
        });
        const res = createResponse();

        await ExpenseController.create(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData().message).toBe('Error creating expense');
        expect(res._getJSONData().error).toBeDefined();
    });
});