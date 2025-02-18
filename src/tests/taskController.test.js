// 1. Importamos o controller e o modelo
const taskController = require('../controller/taskController');
const Task = require('../models/taskModel.js');

// 2. Criamos uma função mock para simular req e res
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('taskController tests', () => {
    // Antes de tudo, limpamos todos os mocks
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createTask', () => {
        it('should create a new task and return status 201', async () => {
            // Simula o body e o retorno do modelo
            const req = { body: { title: 'New Task' } };
            const res = mockResponse();

            // Simulamos que Task.create retorne um objeto de tarefa
            Task.create = jest.fn().mockResolvedValue({ _id: '123', title: 'New Task', completed: false });

            await taskController.createTask(req, res);

            expect(Task.create).toHaveBeenCalledWith({ title: 'New Task' });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ _id: '123', title: 'New Task', completed: false });
        });

        it('should handle error when creating task and return status 400', async () => {
            const req = { body: { title: '' } };
            const res = mockResponse();

            // Simulamos que Task.create lance um erro
            Task.create = jest.fn().mockRejectedValue(new Error('Failed to create'));

            await taskController.createTask(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create' });
        });
    });

    describe('getTasks', () => {
        it('should return all tasks', async () => {
            const req = {};
            const res = mockResponse();

            // Simulamos que Task.find retorne um array de tarefas
            Task.find = jest.fn().mockResolvedValue([
                { _id: '1', title: 'Task 1', completed: false },
                { _id: '2', title: 'Task 2', completed: true }
            ]);

            await taskController.getTasks(req, res);

            expect(Task.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith([
                { _id: '1', title: 'Task 1', completed: false },
                { _id: '2', title: 'Task 2', completed: true }
            ]);
        });

        it('should handle error when fetching tasks and return status 500', async () => {
            const req = {};
            const res = mockResponse();

            Task.find = jest.fn().mockRejectedValue(new Error('Failed to fetch'));

            await taskController.getTasks(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch' });
        });
    });

    describe('updateTask', () => {
        it('must update an existing task', async () => {
            const req = {
                params: { id: '123' },
                body: { title: 'Updated title', completed: true }
            };
            const res = mockResponse();

            Task.findByIdAndUpdate = jest
                .fn()
                .mockResolvedValue({ _id: '123', title: 'Updated title', completed: true });

            await taskController.updateTask(req, res);

            expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
                '123',
                { title: 'Updated title', completed: true },
                { new: true }
            );
            expect(res.json).toHaveBeenCalledWith({ _id: '123', title: 'Updated title', completed: true });
        });

        it('should handle error when updating task and return status 400', async () => {
            const req = { params: { id: '123' }, body: { title: 'Error', completed: false } };
            const res = mockResponse();

            Task.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Failed to update'));

            await taskController.updateTask(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update' });
        });
    });

    describe('deleteTask', () => {
        it('must delete a task by ID and return a success message', async () => {
            const req = { params: { id: '123' } };
            const res = mockResponse();

            Task.findByIdAndDelete = jest.fn().mockResolvedValue(true);

            await taskController.deleteTask(req, res);

            expect(Task.findByIdAndDelete).toHaveBeenCalledWith('123');
            expect(res.json).toHaveBeenCalledWith({ message: 'Task removed successfully!' });
        });

        it('should handle error when deleting task and return status 500', async () => {
            const req = { params: { id: '123' } };
            const res = mockResponse();

            Task.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Failed to delete'));

            await taskController.deleteTask(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete' });
        });
    });
});