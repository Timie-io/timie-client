import { NgModule } from '@angular/core';
import { ApolloLink, InMemoryCache, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { environment } from '../../environments/environment';

@NgModule({})
export class GraphQLModule {
  public subscriptionClient?: SubscriptionClient;

  constructor(apollo: Apollo, httpLink: HttpLink) {
    const connectionParams = () => {
      const token = localStorage.getItem('access-token');
      return token ? { Authorization: 'Bearer ' + token } : {};
    };
    const http = httpLink.create({ uri: environment.gqlHttpUrl });
    const ws = new WebSocketLink({
      uri: environment.gqlWsUrl,
      options: {
        reconnect: true,
        connectionParams: connectionParams,
      },
    });
    this.subscriptionClient = (<any>ws).subscriptionClient;
    const link = split(
      // split based on operation type
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      ws,
      http
    );
    const auth = setContext((operation, context) => {
      const token = localStorage.getItem('access-token');

      if (token === null) {
        return {};
      }
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    });
    apollo.create({
      link: ApolloLink.from([auth, link]),
      cache: new InMemoryCache({
        typePolicies: {
          Task: {
            keyFields: ['id'],
          },
        },
      }),
    });
  }
}
