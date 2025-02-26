import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";

// Lazy load components
const Auth = lazy(() => import("./pages/Auth/Auth"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Home = lazy(() => import("./pages/Auth/Home"));
const Recommendations = lazy(() => import("./pages/Auth/Recommendations"));
const Taskbuddy = lazy(() => import("./pages/Auth/Taskbuddy"));
const BuddyProfile = lazy(() => import("./pages/Auth/BuddyProfile"));

const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const isAuthenticated = Boolean(sessionStorage.getItem("token"));

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  return element;
};

const App: React.FC = () => {
  useEffect(() => {
    // Check if the app needs to log out due to a server restart
    const serverRestart = () => {
      const serverStartFlag = localStorage.getItem("serverStart");
      if (!serverStartFlag) {
        sessionStorage.removeItem("token");
      }
    };

    // Store the session flag before the page unloads
    const storeFlag = () => {
      localStorage.setItem("serverStart", "true");
    };

    serverRestart();

    // Listen for the `beforeunload` event
    window.addEventListener("beforeunload", storeFlag);

    return () => {
      window.removeEventListener("beforeunload", storeFlag);
    };
  }, []);

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<Auth />} />
          <Route path="/reset-password/:token" element={<Auth />} />
          {/* Protected Routes */}
          <Route
            path="/profile"
            element={<ProtectedRoute element={<Profile />} />}
          />
          <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
          <Route
            path="/recommendation"
            element={<ProtectedRoute element={<Recommendations />} />}
          />
          <Route
            path="/taskbuddy"
            element={<ProtectedRoute element={<Taskbuddy />} />}
          />
          <Route
            path="/profile/:id"
            element={<ProtectedRoute element={<BuddyProfile />} />}
          />
          <Route
            path="/me/"
            element={<ProtectedRoute element={<BuddyProfile />} />}
          />
          {/* 404 Route */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
