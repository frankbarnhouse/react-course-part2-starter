import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Todo } from "./useTodos";
import axios from "axios";
import APIClient from "../react-query/services/apiClient";
import { CACHE_KEY_TODOS } from "../react-query/constants";

const apiClient = new APIClient<Todo>('/todos')

interface AddTodoContext {
    previousTodos: Todo[];
  }

const useAddTodo =(onAdd: () => void) => {
    const queryClient = useQueryClient();
    return useMutation<Todo, Error, Todo, AddTodoContext>({
      mutationFn: apiClient.post,
      onMutate: (newTodo: Todo) => {
        const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]) || [];
  
        queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, (todos = []) => [
          newTodo,
          ...todos,
        ]);
  
        onAdd();
  
        return { previousTodos };
      },
      onSuccess: (savedTodo, newTodo) => {
        queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, (todos) =>
          todos?.map((todo) => (todo.id === 0 ? savedTodo : todo))
        );
      },
      onError: (error, newTodo, context) => {
        if (!context) return;
  
        queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, context.previousTodos);
      },
    });
  

}

export default useAddTodo;