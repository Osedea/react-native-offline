/* @flow */

import React, { Component, PropTypes } from 'react';
import { NetInfo, Platform } from 'react-native';
import hoistStatics from 'hoist-non-react-statics';
import { connectionChange, networkAccessChange } from './actionCreators';
import reactConnectionStore from './reactConnectionStore';
import checkInternetAccess from './checkInternetAccess';

type Arguments = {
  withRedux?: boolean,
  timeout?: number,
  pingServerUrl?: string,
};

type State = {
  isConnected: boolean,
  hasNetworkAccess: boolean,
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
      hasNetworkAccess: reactConnectionStore.getNetworkAccess(),
    };

    componentDidMount() {
      NetInfo.isConnected.addEventListener(
        'change',
        this.handleNetworkAccessChange,
      );
      // On Android the listener does not fire on startup
      if (Platform.OS === 'android') {
        NetInfo.isConnected.fetch().then(this.handleNetworkAccessChange);
      }

      this.setupConnectivityCheckInterval();
    }

    componentWillUnmount() {
      NetInfo.isConnected.removeEventListener(
        'change',
        this.handleNetworkAccessChange,
      );
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

    handleNetworkAccessChange = (hasNetworkAccess: boolean) => {
      reactConnectionStore.setNetworkAccess(hasNetworkAccess);

      // Top most component, syncing with store
      if (
        typeof store === 'object' &&
        typeof store.dispatch === 'function' &&
        withRedux === true
      ) {
        if (hasNetworkAccess !== store.getState().network.hasNetworkAccess) {
          store.dispatch(networkAccessChange(hasNetworkAccess));
        }
      } else {
        // Standard HOC, passing connectivity as props
        this.setState({ hasNetworkAccess });
      }
      // Only check connectivity if we do have network access
      if (hasNetworkAccess) {
        this.checkInternet(reactConnectionStore.getConnection());
      }
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
          hasNetworkAccess={!withRedux ? this.state.hasNetworkAccess : undefined}
        />
      );
    }
  }
  return hoistStatics(EnhancedComponent, WrappedComponent);
};

export default withNetworkConnectivity;
