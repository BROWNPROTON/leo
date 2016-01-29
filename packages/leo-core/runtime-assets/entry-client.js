import createBrowserHistory from 'history/lib/createBrowserHistory';
import IsomorphicRelay from 'isomorphic-relay';
import Relay from 'react-relay';
import IsomorphicRouter, {
  Router
} from 'isomorphic-relay-router';
import React from 'react';
import ReactDOM, { render } from 'react-dom';
import md5 from 'md5';
import request from 'superagent';

import routes from './load-routes';
import conf from './load-leorc';

const debug = require('debug')('leo:entry-client');

console.log('routes', routes);

var myNetworkLayer = {
  sendMutation(mutationRequest) {
    // ...
  },
  sendQueries(queryRequests) {
    console.log(queryRequests);
    return Promise.all(queryRequests.map(
      queryRequest => {
        const query = queryRequest.getQueryString();
        const graphQLQueryHash = md5(query)
        request(`/api/${graphQLQueryHash}.json`)
        .end((err, res) => {
          if(err) {
             queryRequest.reject(new Error(err));
          } else if (res.body && res.body.errors) {
            queryRequest.reject(new Error(res.body.errors));
          } else {
            console.log(res.body);
            console.log(res.body.data);
            queryRequest.resolve({ response: res.body.data });
          }
        })
    }
    ));
  },
  supports(...options) {
    // ...
  },
};

Relay.injectNetworkLayer(myNetworkLayer);

// Client render (optional):
if (typeof document !== 'undefined') {
  debug('using client render');
  const outlet = document.getElementById('react-mount');

  render(<Router history={createBrowserHistory()} routes={routes} />, outlet);
}
console.log('clientXFGJK')