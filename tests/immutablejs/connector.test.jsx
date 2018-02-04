import { fromJS } from 'immutable';
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

  test('works with property method', () => {
    const Component = (property, dispatch) => (<h1>{property('projects.scope')}</h1>);
    connector.connectInteractors(Component, ['projects']);

    const ConnectedComponent = fakeWrapFunction.mock.calls[0][0];
    expect(ReactDOMServer.renderToStaticMarkup(ConnectedComponent(fromJS(exampleState)))).toEqual('<h1>public</h1>');
  });

  test('works when interactors hash passed', () => {
    connector.connectInteractors(fakeFunctionComponent, ['users']);

    const generatedMapStateToPropsFunction = fakeConnectFunction.mock.calls[0][0];
    expect(generatedMapStateToPropsFunction(fromJS(exampleState))).toEqual({users: fromJS(exampleState['users'])});
  });

  test('works for all interactors', () => {
    connector.connectInteractors(fakeFunctionComponent);

    const generatedMapStateToPropsFunction = fakeConnectFunction.mock.calls[0][0];
    expect(generatedMapStateToPropsFunction(fromJS(exampleState))).toEqual(fromJS(exampleState).toObject());
  });
});
