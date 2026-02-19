import { createRequest, createResponse } from 'node-mocks-http';
import {  } from '../../../middleware/expense';
import Expense from '../../../models/Expense';
import { ExpenseController } from '../../../controllers/ExpenseController';
import { expenses } from '../../mocks/expenses';

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

describe('ExpenseController.getExpenseById', () => {
    it('should return the expense if found', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/budgets/:budgetId/expenses/:expenseId',
            params: { budgetId: '1', expenseId: '1' },
            expense: expenses[0]
        });
        const res = createResponse();

        await ExpenseController.getExpenseById(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(expenses[0]);
    });
});

describe('ExpenseController.update', () => {
    it('should update the expense if found', async () => {
        const expenseMock = {
            ...expenses[0],
            update: jest.fn()
        };
        const req = createRequest({
            method: 'PUT',
            url: '/budgets/:budgetId/expenses/:expenseId',
            params: { budgetId: '1', expenseId: '1' },
            body: { name: 'Updated Expense', amount: 200 },
            expense: expenseMock
        });
        const res = createResponse();

        await ExpenseController.updateExpense(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().expense).toEqual(expenses[0]);
        expect(res._getJSONData().message).toBe('Expense updated successfully');
        expect(expenseMock.update).toHaveBeenCalled();
        expect(expenseMock.update).toHaveBeenCalledWith({ name: 'Updated Expense', amount: 200 });
        expect(expenseMock.update).toHaveBeenCalledTimes(1);
    });
});

describe('ExpenseController.deleteExpense', () => {
    it('should delete the expense if found', async () => {
        const expenseMock = {
            ...expenses[0],
            destroy: jest.fn()
        };
        const req = createRequest({
            method: 'DELETE',
            url: '/budgets/:budgetId/expenses/:expenseId',
            params: { budgetId: '1', expenseId: '1' },
            expense: expenseMock
        });
        const res = createResponse();

        await ExpenseController.deleteExpense(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().message).toBe('Expense deleted successfully');
        expect(expenseMock.destroy).toHaveBeenCalled();
    });
});