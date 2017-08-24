/* @flow */

type ActionTypes = {|
  NETWORK_ACCESS_CHANGE: '@@network-connectivity/NETWORK_ACCESS_CHANGE',
  CONNECTION_CHANGE: '@@network-connectivity/CONNECTION_CHANGE',
  FETCH_OFFLINE_MODE: '@@network-connectivity/FETCH_OFFLINE_MODE',
  REMOVE_FROM_ACTION_QUEUE: '@@network-connectivity/REMOVE_FROM_ACTION_QUEUE',
  DISMISS_ACTIONS_FROM_QUEUE: '@@network-connectivity/DISMISS_ACTIONS_FROM_QUEUE',
|};

const actionTypes: ActionTypes = {
  NETWORK_ACCESS_CHANGE: '@@network-connectivity/NETWORK_ACCESS_CHANGE',
  CONNECTION_CHANGE: '@@network-connectivity/CONNECTION_CHANGE',
  FETCH_OFFLINE_MODE: '@@network-connectivity/FETCH_OFFLINE_MODE',
  REMOVE_FROM_ACTION_QUEUE: '@@network-connectivity/REMOVE_FROM_ACTION_QUEUE',
  DISMISS_ACTIONS_FROM_QUEUE:
    '@@network-connectivity/DISMISS_ACTIONS_FROM_QUEUE',
};

export default actionTypes;
