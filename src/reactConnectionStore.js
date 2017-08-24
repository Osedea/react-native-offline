/* @flow */

/** This is an internal store for component utilities (HoC and facc) **/

let isConnected = true;
let hasNetworkAccess = true;

export default {
  getConnection(): boolean {
    return isConnected;
  },
  setConnection(connection: boolean) {
    isConnected = connection;
  },
  getNetworkAccess() {
    return hasNetworkAccess;
  },
  setNetworkAccess(networkAccess: boolean) {
    hasNetworkAccess = networkAccess;
  },
};
