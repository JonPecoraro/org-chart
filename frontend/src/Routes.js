import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import OrgChart from "./pages/OrgChart";
import OrgChartList from "./pages/OrgChartList";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/login">
        <UnauthenticatedRoute>
          <Login />
        </UnauthenticatedRoute>
      </Route>
      <Route exact path="/signup">
        <UnauthenticatedRoute>
          <Signup />
        </UnauthenticatedRoute>
      </Route>
      <Route exact path="/org-chart-list">
        <AuthenticatedRoute>
          <OrgChartList />
        </AuthenticatedRoute>
      </Route>
      <Route exact path="/org-chart">
        <AuthenticatedRoute>
          <OrgChart />
        </AuthenticatedRoute>
      </Route>
      <Route exact path="/org-chart/:chartId">
        <AuthenticatedRoute>
          <OrgChart />
        </AuthenticatedRoute>
      </Route>
      <Route exact path="/org-chart/shared/:linkKey">
        <OrgChart />
      </Route>
      {/* Finally, catch all unmatched routes */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
