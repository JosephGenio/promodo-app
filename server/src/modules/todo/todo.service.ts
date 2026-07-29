import { prisma } from '../../lib/prisma';
import { notFound } from '../../lib/errors';
import type { Todo } from '../../generated/prisma/client';
import type { CreateTodoInput, UpdateTodoInput } from './todo.validation';

export type PublicTodo = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function toPublicTodo(todo: Todo): PublicTodo {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    done: todo.done,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  };
}

export async function listTodos(userId: string): Promise<PublicTodo[]> {
  const todos = await prisma.todo.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return todos.map(toPublicTodo);
}

export async function createTodo(userId: string, input: CreateTodoInput): Promise<PublicTodo> {
  const todo = await prisma.todo.create({
    data: { userId, title: input.title, description: input.description },
  });
  return toPublicTodo(todo);
}

async function findOwnedTodo(userId: string, id: string): Promise<Todo> {
  const todo = await prisma.todo.findFirst({ where: { id, userId } });
  if (!todo) {
    throw notFound('Todo not found');
  }
  return todo;
}

export async function updateTodo(userId: string, id: string, input: UpdateTodoInput): Promise<PublicTodo> {
  await findOwnedTodo(userId, id);
  const todo = await prisma.todo.update({ where: { id }, data: input });
  return toPublicTodo(todo);
}

export async function deleteTodo(userId: string, id: string): Promise<void> {
  await findOwnedTodo(userId, id);
  await prisma.todo.delete({ where: { id } });
}
