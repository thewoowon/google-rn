"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
var react_1 = require("react");
var react_native_1 = require("react-native");
var google_rn_1 = require("@thewoowon/google-rn");
function App() {
    var _a = (0, google_rn_1.useGoogleAuth)(), user = _a.user, loading = _a.loading, signIn = _a.signIn, signOut = _a.signOut;
    return (<react_native_1.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {loading ? (<react_native_1.Text>Loading...</react_native_1.Text>) : user ? (<>
          <react_native_1.Text>Welcome, {user.name}</react_native_1.Text>
          <react_native_1.Button title="Logout" onPress={signOut}/>
        </>) : (<react_native_1.Button title="Login with Google" onPress={signIn}/>)}
    </react_native_1.View>);
}
