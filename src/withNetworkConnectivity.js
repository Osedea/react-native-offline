/* @flow */

import React, { Component, PropTypes } from 'react';
import { NetInfo, Platform } from 'react-native';
import hoistStatics from 'hoist-non-react-statics';
import { connectionChange } from './actionCreators';
import reactConnectionStore from './reactConnectionStore';
import checkInternetAccess from './checkInternetAccess';

type Arguments = {
  withRedux?: boolean,
  timeout?: number,
  pingServerUrl?: string,
};

type State = {
  isConnected: boolean,
};

const withNetworkConnectivity = (
  {
    withRedux = false,
    timeout = 3000,
    pingServerUrl = 'https://google.com',
    checkConnectionInterval = 0,
  }: Arguments = {},
) => (WrappedComponent: ReactClass<*>) => {
  if (typeof withRedux !== 'boolean') {
    throw new Error('you should pass a boolean as withRedux parameter');
  }
  if (typeof timeout !== 'number') {
    throw new Error('you should pass a number as timeout parameter');
  }
  if (typeof pingServerUrl !== 'string') {
    throw new Error('you should pass a string as pingServerUrl parameter');
  }

  class EnhancedComponent extends Component<void, void, State> {
    static displayName = `withNetworkConnectivity(${WrappedComponent.displayName})`;

    static contextTypes = {
      store: PropTypes.shape({
        dispatch: PropTypes.func,
      }),
    };

    state = {
      isConnected: reactConnectionStore.getConnection(),
    };

    componentDidMount() {
      NetInfo.isConnected.addEventListener('change', this.checkInternet);
      // On Android the listener does not fire on startup
      if (Platform.OS === 'android') {
        NetInfo.isConnected.fetch().then((isConnected: boolean) => {
          this.checkInternet();
        });
      }

      this.setupConnectivityCheckInterval();
    }

    componentWillUnmount() {
      NetInfo.isConnected.removeEventListener('change', this.checkInternet);
      this.clearInterval();
    }

    setupConnectivityCheckInterval = () => {
      if (checkConnectionInterval && !this.interval) {
        this.interval = setInterval(
          this.checkInternet,
          checkConnectionInterval,
        );
      }
    };

    clearInterval = () => {
      if (this.interval) {
        clearInterval(this.interval);
      }
    };

    checkInternet = () => {
      checkInternetAccess(
        timeout,
        pingServerUrl,
      ).then((hasInternetAccess: boolean) => {
        this.handleConnectivityChange(hasInternetAccess);
      });
    };

    handleConnectivityChange = (isConnected: boolean) => {
      const { store } = this.context;
      reactConnectionStore.setConnection(isConnected);

      // Top most component, syncing with store
      if (
        typeof store === 'object' &&
        typeof store.dispatch === 'function' &&
        withRedux === true
      ) {
        const actionQueue = store.getState().network.actionQueue;

        if (isConnected !== store.getState().network.isConnected) {
          store.dispatch(connectionChange(isConnected));
        }
        // dispatching queued actions in order of arrival (if we have any)
        if (isConnected && actionQueue.length > 0) {
          actionQueue.forEach((action: *) => {
            store.dispatch(action);
          });
        }
      } else {
        // Standard HOC, passing connectivity as props
        this.setState({ isConnected });
      }
    };

    render() {
      return (
        <WrappedComponent
          {...this.props}
          isConnected={!withRedux ? this.state.isConnected : undefined}
          checkInternet={!withRedux ? this.checkInternet : undefined}
        />
      );
    }
  }
  return hoistStatics(EnhancedComponent, WrappedComponent);
};

export default withNetworkConnectivity;
