declare global {
  interface Action<T = unknown> {
    type: string;
    payload: T;
  }

  type SimpleAction = Action<unknown>;

  type AnyAction = Action<any>;

  type CreateAction = <T>(type: string, payload: T) => Action<T>;

  type CreateSimpleAction = (type: string) => SimpleAction;

  interface Message<T = any> {
    data: T;
  }

  type PostMessage<P> = (message: P, transfer?: Transferable[]) => void;

  type PostAction<A> = (message: A) => void;
}

export default global;
