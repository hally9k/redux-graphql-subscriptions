import { FluxStandardAction as Action } from 'flux-standard-action';
import { ExecutionResult as GraphQLResponse, GraphQLError } from 'graphql';
import { Store, Dispatch } from 'redux';
declare type WsClientStatusMap = {
    CLOSED: 3;
    CLOSING: 2;
    CONNECTING: 0;
    OPEN: 1;
};
export declare type SubscriptionPayload = {
    key: string;
    onError?: (payload: readonly GraphQLError[]) => Action<any> & Array<Action<any>>;
    onMessage: (payload: GraphQLResponse) => Action<any> & Array<Action<any>>;
    onSubscribing?: () => Action<any> & Array<Action<any>>;
    onUnsubscribe?: () => Action<any> & Array<Action<any>>;
    query: string;
    variables?: {};
};
export declare type ConnectionPayload = {
    disconnectionTimeout?: number;
    handlers?: {
        onConnected?: () => Action<any> & Array<Action<any>>;
        onConnecting?: () => Action<any> & Array<Action<any>>;
        onDisconnected?: () => Action<any> & Array<Action<any>>;
        onDisconnectionTimeout?: () => Action<any> & Array<Action<any>>;
        onError?: (errors?: any) => Action<any> & Array<Action<any>>;
        onReconnected?: () => Action<any> & Array<Action<any>>;
        onReconnecting?: () => Action<any> & Array<Action<any>>;
    };
    options: {
        connectionCallback?: any;
        connectionOptions?: {};
        reconnect?: boolean;
    };
    protocols?: string | Array<string>;
    url: string;
};
export declare const connect: (payload: ConnectionPayload) => Action<ConnectionPayload, undefined>;
export declare const disconnect: () => Action<any, undefined>;
export declare const subscribe: (subscription: SubscriptionPayload) => Action<SubscriptionPayload, undefined>;
export declare const unsubscribe: (key: string) => Action<string, undefined>;
export declare const error: (payload: readonly GraphQLError[]) => Action<readonly GraphQLError[], undefined>;
export declare const WS_CLIENT_STATUS: WsClientStatusMap;
export declare function createMiddleware<S>(): ({ dispatch }: Store<S, import("redux").AnyAction>) => (next: Dispatch<Action<any, undefined>>) => (action: Action<any, undefined>) => Action<any, undefined>;
export {};
