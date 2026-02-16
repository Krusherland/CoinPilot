import { createRequest, createResponse } from 'node-mocks-http';
import { validateBudgetId, hasAccess } from '../../../middleware/budget';
import Budget from '../../../models/Budget';
import { budgets } from '../../mocks/budgets';

jest.mock('../../../models/Budget', () => ({
    findByPk: jest.fn()
}));

describe('budget - validateBudget', () => {
    it('should return 404 if budgetId is not a valid number', async () => {
        const req = createRequest({
            params: {
                budgetId: 'invalid'
            }
        });
        const res = createResponse();
        const next = jest.fn();
        await validateBudgetId(req, res, next);
        expect(res.statusCode).toBe(404);
        expect(next).not.toHaveBeenCalled();
    });
});

describe('budget - validateBudgetId', () => {
    it('should return 404 if budget is not found', async () => {
        (Budget.findByPk as jest.Mock).mockResolvedValue(null);
        const req = createRequest({
                params: {
                    budgetId: '1'
                }
            });
        const res = createResponse();
        const next = jest.fn();
        await validateBudgetId(req, res, next);
        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({ message: 'Budget not found' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should attach budget to req and call next if budget is found', async () => {
        (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]);
        const req = createRequest({
            params: {
                budgetId: '1'
            }
        });
        const res = createResponse();
        const next = jest.fn();
        await validateBudgetId(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.budget).toEqual(budgets[0]);
    });

    it('should return 404 if there is an error validating budget ID', async () => {
        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error);
        const req = createRequest({
            params: {
                budgetId: '1'
            }
        });
        const res = createResponse();
        const next = jest.fn();
        await validateBudgetId(req, res, next);
        expect(res.statusCode).toBe(404);
        const data = res._getJSONData();
        expect(data).toHaveProperty('message', 'Error validating budget ID');
        expect(data).toHaveProperty('error');
        expect(next).not.toHaveBeenCalled();
    });
});

describe('budget - hasAccess', () => {
    it('should return 401 if user does not have access to the budget', async () => {
        const req = createRequest({
            budget: budgets[0],
            user: { id: '2'}
        });
        const res = createResponse();
        const next = jest.fn();
        await hasAccess(req, res, next);
        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ message: 'Unauthorized' });
        expect(next).not.toHaveBeenCalled();
    });
});