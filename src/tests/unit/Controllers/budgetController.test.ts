import { createRequest, createResponse } from 'node-mocks-http';
import { BudgetController } from '../../../controllers/BudgetController';
import { budgets } from '../../mocks/budgets';
import Budget from '../../../models/Budget';
import Expense from '../../../models/Expense';

jest.mock('../../../models/Budget', () => ({
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
}))

describe('BudgetController.getAll', () => {
    beforeEach(() => {
        (Budget.findAll as jest.Mock).mockReset();
        (Budget.findAll as jest.Mock).mockImplementation((options) => {
            const updatedBudgets = budgets.filter(budget => budget.userId === options.where.userId); 
            return Promise.resolve(updatedBudgets);
        });
    });

    it('should return all budgets for a user', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/budgets',
            user: {
                id: '1'
            }
        });
        const res = createResponse();
        await BudgetController.getAll(req, res);
        const data = res._getJSONData();
        expect(data).toHaveLength(2);
        expect(res.statusCode).toBe(200);
    });

    it('should handle errors when fetching budgets', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/budgets',
            user: {
                id: '1'
            }
        });
        const res = createResponse();
        (Budget.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));
        await BudgetController.getAll(req, res);
        expect(res.statusCode).toBe(500);
        const data = res._getJSONData();
        expect(data).toHaveProperty('message', 'Error fetching budgets');
        expect(data).toHaveProperty('error');
    });
});

describe('BudgetController.create', () => {
    it('should create a new budget', async () => {
        const mockBudget = {
            save: jest.fn().mockResolvedValue(true)
        };
        (Budget.create as jest.Mock).mockResolvedValue(mockBudget);
        const req = createRequest({
            method: 'POST',
            url: '/budgets',
            user: {
                id: '1'
            },
            body: {
                name: 'New Budget',
                amount: 500
            }
        });
        const res = createResponse();

        await BudgetController.create(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(201);
        expect(data).toHaveProperty('message', 'Budget created successfully');
        expect(Budget.create).toHaveBeenCalledWith(req.body);
    });

     it('should handle errors when creating a budget', async () => {
        const mockBudget = {
            save: jest.fn().mockResolvedValue(true)
        };
        const req = createRequest({
            method: 'POST',
            url: '/budgets',
            user: {
                id: '1'
            }
        });
        (Budget.create as jest.Mock).mockRejectedValue(new Error('Database error'));
        const res = createResponse();
        
        await BudgetController.create(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(500);
        expect(mockBudget.save).not.toHaveBeenCalled();
        expect(Budget.create).toHaveBeenCalledWith(req.body);
        expect(data).toHaveProperty('message', 'Error creating budget');
        expect(data).toHaveProperty('error');
    });
});

describe('BudgetController.getBudgetById', () => {
    beforeEach(() => {
        (Budget.findByPk as jest.Mock).mockImplementation(() => {
            const budget = budgets.filter(b => b.id === '1')[0];
            return Promise.resolve(budget);
        });
    });

    it('should return a budget by ID', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/budgets/budgetId',
            budget: { id: '1' }
        });
        const res = createResponse()
        await BudgetController.getBudgetById(req, res);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data.expenses).toHaveLength(2);
        expect(Budget.findByPk).toHaveBeenCalled();
        expect(Budget.findByPk).toHaveBeenCalledTimes(1);
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, {
            include: [Expense]
        })
    });

    it('should handle errors when fetching budget by ID', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/budgets',
            budget: {
                id: '1'
            }
        });
        const res = createResponse();
        (Budget.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));
        await BudgetController.getAll(req, res);
        expect(res.statusCode).toBe(500);
        const data = res._getJSONData();
        expect(data).toHaveProperty('message', 'Error fetching budgets');
        expect(data).toHaveProperty('error');
    });
});

describe('BudgetController.updateBudget', () => {
    it('should update a budget', async () => {
        const mockBudget = {
            update: jest.fn().mockResolvedValue(true)
        };
        const req = createRequest({
            method: 'PUT',
            url: '/budgets/:budgetId',
            budget: mockBudget,
            body: {
                name: 'Updated Budget',
                amount: 1500
            }
         });
        const res = createResponse();

        await BudgetController.updateBudget(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data).toHaveProperty('message', 'Budget updated successfully');
        expect(mockBudget.update).toHaveBeenCalledWith(req.body);
    });
});

describe('BudgetController.deleteBudget', () => {
    it('should delete a budget', async () => {
        const mockBudget = {
            destroy: jest.fn().mockResolvedValue(true)
        };
        const req = createRequest({
            method: 'DELETE',
            url: '/budgets/:budgetId',
            budget: mockBudget
         });
        const res = createResponse();

        await BudgetController.deleteBudget(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data).toHaveProperty('message', 'Budget deleted successfully');
        expect(mockBudget.destroy).toHaveBeenCalled();
    });
});