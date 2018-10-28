import jwt_decode from "jwt-decode";
import React, { Component } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import "./App.css";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Footer from "./components/layout/Footer";
import Landing from "./components/layout/Landing";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./components/dashboard/Dashboard";
import CreateProfile from "./components/create-profile/CreateProfile";
import EditProfile from "./components/edit-profile/EditProfile";
import store from "./store";
import setAuthToken from "./utils/setAuthToken";
import { clearCurrentProfile } from "./actions/profileActions";

import PrivateRoute from "./components/common/PrivateRoute";

// Check for token
if (localStorage["jwt-token"]) {
    // Set auth token header
    setAuthToken(localStorage["jwt-token"]);
    // Decode token and get user data
    const decoded = jwt_decode(localStorage["jwt-token"]);
    // Set user and isAuthenticated
    store.dispatch(setCurrentUser(decoded));

    // Check for expired token
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
        // Logout and redirect
        store.dispatch(logoutUser());
        // Clear current profile
        store.dispatch(clearCurrentProfile());
        window.location.href = "/login";
    }
}

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Router>
                    <div className="App">
                        <Navbar />
                        <Route exact path="/" component={Landing} />
                        <div className="container">
                            <Route
                                exact
                                path="/register"
                                component={Register}
                            />
                            <Route exact path="/login" component={Login} />
                            <Switch>
                                <PrivateRoute
                                    exact
                                    path="/dashboard"
                                    component={Dashboard}
                                />
                            </Switch>
                            <Switch>
                                <PrivateRoute
                                    exact
                                    path="/create-profile"
                                    component={CreateProfile}
                                />
                            </Switch>
                            <Switch>
                                <PrivateRoute
                                    exact
                                    path="/edit-profile"
                                    component={EditProfile}
                                />
                            </Switch>
                        </div>
                        <Footer />
                    </div>
                </Router>
            </Provider>
        );
    }
}

export default App;
