import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Connector from '~/connector';

describe('connector', () => {
  let connector, fakeWrapFunction, fakeConnectFunction, fakeFunctionComponent, exampleState;

  beforeEach(() => {
    exampleState = {users: { current: 'user1' }, projects: { scope: 'public' }, dispatch: jest.fn() };
    fakeWrapFunction = jest.fn();
    fakeConnectFunction = jest.fn().mockReturnValue(fakeWrapFunction);
    fakeFunctionComponent = jest.fn().mockReturnValue('<h1>fake</h1>');
    connector = new Connector({connectFunc: fakeConnectFunction});
  });

  test('connects all interactors', () => {
    connector.connectInteractors(fakeFunctionComponent);

    const generatedMapStateToPropsFunction = fakeConnectFunction.mock.calls[0][0];
    expect(generatedMapStateToPropsFunction(exampleState)).toEqual(exampleState);
  });

  test('connects selected interactors', () => {
    connector.connectInteractors(fakeFunctionComponent, ['users']);

    const generatedMapStateToPropsFunction = fakeConnectFunction.mock.calls[0][0];
    expect(generatedMapStateToPropsFunction(exampleState)).toEqual({users: exampleState['users']});
  });

  test('passes property function to function component', () => {
    const Component = (property, dispatch) => (<h1>{property('projects.scope')}</h1>);
    connector.connectInteractors(Component, ['projects']);

    const ConnectedComponent = fakeWrapFunction.mock.calls[0][0];
    expect(ReactDOMServer.renderToStaticMarkup(ConnectedComponent(exampleState))).toEqual('<h1>public</h1>');
  });

  test('passes dispatch function to function component', () => {
    const Component = (property, dispatch) => (<h1>{dispatch('projects:fetch', 'all')}</h1>);
    connector.connectInteractors(Component, ['projects']);

    const ConnectedComponent = fakeWrapFunction.mock.calls[0][0];
    ReactDOMServer.renderToStaticMarkup(ConnectedComponent(exampleState));

    expect(exampleState['dispatch'].mock.calls[0][0]).toEqual(['projects:fetch', 'all']);
  });

  test('defines property (and alias p) in class component', () => {
    const Component = class extends React.Component {
      render() {
        return(<h1>{this.property('users.current')}-{this.p('projects.scope')}</h1>);
      }
    }

    connector.connectInteractors(Component, ['projects', 'users']);

    const ConnectedComponent = fakeWrapFunction.mock.calls[0][0];
    expect(ReactDOMServer.renderToStaticMarkup(<ConnectedComponent {...exampleState} />)).toEqual('<h1>user1-public</h1>');
  });

  test('defines dispatch (and alias d) in class component', () => {
    const Component = class extends React.Component {
      render() {
        this.dispatch('users:fetch', 'all');
        this.d('projects:delete', 1);
        return(<h1>hello</h1>);
      }
    }

    connector.connectInteractors(Component, ['projects', 'users']);

    const ConnectedComponent = fakeWrapFunction.mock.calls[0][0];
    ReactDOMServer.renderToStaticMarkup(<ConnectedComponent {...exampleState} />)

    expect(exampleState['dispatch'].mock.calls[0][0]).toEqual(['users:fetch', 'all']);
    expect(exampleState['dispatch'].mock.calls[1][0]).toEqual(['projects:delete', 1]);
  });

  test('sets displayName for functional wrapper', () => {
    const NamedComponent = (property, dispatch) => (<h1>hello</h1>);
    connector.connectInteractors(NamedComponent, ['projects']);

    const ConnectedComponent = fakeWrapFunction.mock.calls[0][0];
    expect(ConnectedComponent.displayName).toEqual('NamedComponent');
  });
});
