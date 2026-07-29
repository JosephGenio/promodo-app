import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { userRouter } from '../modules/user/user.routes';
import { todoRouter } from '../modules/todo/todo.routes';
import { pomodoroRouter } from '../modules/pomodoro/pomodoro.routes';
import { quizRouter } from '../modules/quiz/quiz.routes';
import { reflectionRouter } from '../modules/reflection/reflection.routes';
import { notesRouter } from '../modules/notes/notes.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/todo', todoRouter);
apiRouter.use('/pomodoro', pomodoroRouter);
apiRouter.use('/quiz', quizRouter);
apiRouter.use('/reflection', reflectionRouter);
apiRouter.use('/notes', notesRouter);
