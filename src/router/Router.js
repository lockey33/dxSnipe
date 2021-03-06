import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "../pages/Home";
import Header from "../components/HeaderComponent";

const AppRouter = () => {
    return (
        <Router>
            <Header />
            <Route props={window.history} default path="/" exact component={Home} />
        </Router>
    )
}

export default AppRouter;
