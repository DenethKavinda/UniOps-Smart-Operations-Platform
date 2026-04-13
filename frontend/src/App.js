import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [currentView, setCurrentView] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [prefillCredentials, setPrefillCredentials] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("uniops_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setCurrentView("home");
    }
  }, []);

  const handleLoginSuccess = (user) => {
    localStorage.setItem("uniops_user", JSON.stringify(user));
    setCurrentUser(user);
    setCurrentView("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("uniops_user");
    setCurrentUser(null);
    setCurrentView("login");
  };

  const handleRegisterSuccess = ({ email, password }) => {
    setPrefillCredentials({ email, password });
    setCurrentView("login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        isAuthenticated={Boolean(currentUser)}
        currentUser={currentUser}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />

      {currentView === "home" && currentUser && <Home user={currentUser} />}
      {currentView === "login" && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setCurrentView("register")}
          initialEmail={prefillCredentials.email}
          initialPassword={prefillCredentials.password}
        />
      )}
      {currentView === "register" && (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setCurrentView("login")}
        />
      )}
    </div>
  );
}

export default App;
