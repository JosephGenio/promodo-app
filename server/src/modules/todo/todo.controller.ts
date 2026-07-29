import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/requireAuth';
import { createTodoSchema, updateTodoSchema } from './todo.validation';
import { listTodos, createTodo, updateTodo, deleteTodo } from './todo.service';

export async function list(req: AuthenticatedRequest, res: Response): Promise<void> {
  const todos = await listTodos(req.userId!);
  res.json(todos);
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const input = createTodoSchema.parse(req.body);
  const todo = await createTodo(req.userId!, input);
  res.status(201).json(todo);
}

export async function update(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  const input = updateTodoSchema.parse(req.body);
  const todo = await updateTodo(req.userId!, req.params.id, input);
  res.json(todo);
}

export async function remove(req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void> {
  await deleteTodo(req.userId!, req.params.id);
  res.status(204).send();
}
