import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Store from '~/store';
import Connector from '~/connector';
import FakeInteractor from './stubs/fake_interactor';

describe('connector', () => {
  let connector, fakeWrapFunction, fakeConnectFunction, fakeFunctionComponent, exampleState;

  beforeEach(() => {
    exampleState = {users: ['users-data'], projects: { scope: 'public', data: ['projects-data'] }, dispatch: jest.fn() };
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
    expect(generatedMapStateToPropsFunction(exampleState)).toEqual({users: ['users-data']});

    expect(fakeWrapFunction.mock.calls[0][0]()).toEqual('<h1>fake</h1>');
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
});
