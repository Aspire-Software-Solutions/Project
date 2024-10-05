import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Layout from "./styles/Layout";
import Nav from "./components/layout/Nav";
import Home from "./pages/Home";
import MasterQuickie from "./components/Quickie/MasterQuickie"; // Renamed for consistency
import Profile from "./components/Profile/Profile";
import Bookmarks from "./pages/Bookmarks";
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";
import Suggestion from "./pages/Suggestion";
import EditProfile from "./components/Profile/EditProfile";
import ModerationDashboard from "./pages/ContentModeration";

const AppRouter = () => {
  return (
    <Router>
      <Switch>
        {/* Separate route for Content Moderation */}
        <Route path="/ContentModeration" component={ModerationDashboard} />

        {/* General Application Routes */}
        <Route>
          <Nav />
          <Layout>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/explore" component={Explore} />
              <Route exact path="/notifications" component={Notifications} />
              <Route exact path="/bookmarks" component={Bookmarks} />
              <Route exact path="/settings/profile" component={EditProfile} />
              <Route exact path="/:handle/status/:quickieId" component={MasterQuickie} />
              <Route exact path="/:handle" component={Profile} />
              <Redirect from="*" to="/" />
            </Switch>
            <Suggestion />
          </Layout>
        </Route>
      </Switch>
    </Router>
  );
};

export default AppRouter;
