import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/home/homePage";
import SignUpPage from "./pages/auth/signup/signUpPage";
import LoginPage from "./pages/auth/login/loginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";

function App() {
  const location = useLocation();

  // Hide Sidebar & RightPanel for login/signup pages
  const hideLayout =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className={`flex max-w-6xl mx-auto ${hideLayout ? "justify-center" : ""}`}>
      {!hideLayout && <Sidebar />}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Routes>
      </div>

      {!hideLayout && <RightPanel />}
    </div>
  );
}

export default App;
