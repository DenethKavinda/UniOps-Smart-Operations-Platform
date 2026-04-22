import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";
import api from "./api/axiosConfig";
import AddNotifications from "./pages/AddNotifications";
import Home from "./pages/Home";
import IncidentTickets from "./pages/IncidentTickets";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import PasswordRest from "./pages/PasswordRest";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";

function App() {
  const [currentView, setCurrentView] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [prefillCredentials, setPrefillCredentials] = useState({
    email: "",
    password: "",
  });
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [hasNewNotificationAlert, setHasNewNotificationAlert] = useState(false);
  const unreadCountRef = useRef(0);

  const notificationsStreamUrl = useMemo(() => {
    const base = (api.defaults.baseURL || "http://localhost:8081/api").replace(
      /\/+$/,
      "",
    );
    return `${base}/notifications/stream`;
  }, []);

  const getLastSeenKey = (user) => {
    const identity = user?.id || user?.email || "guest";
    return `uniops_notifications_last_seen_${identity}`;
  };

  const calculateUnreadCount = (notifications, user) => {
    const lastSeenRaw = localStorage.getItem(getLastSeenKey(user));
    if (!lastSeenRaw) {
      return notifications.length;
    }

    const lastSeen = new Date(lastSeenRaw);
    if (Number.isNaN(lastSeen.getTime())) {
      return notifications.length;
    }

    return notifications.filter((item) => {
      const createdAt = new Date(item.createdAt);
      return !Number.isNaN(createdAt.getTime()) && createdAt > lastSeen;
    }).length;
  };

  const refreshUnreadCount = async (user) => {
    if (!user || user?.role === "ADMIN") {
      setUnreadNotificationCount(0);
      return 0;
    }

    try {
      const response = await api.get("/notifications");
      if (!response.data?.success) {
        return unreadNotificationCount;
      }

      const nextUnread = calculateUnreadCount(response.data.data || [], user);
      setUnreadNotificationCount(nextUnread);
      return nextUnread;
    } catch {
      return unreadNotificationCount;
    }
  };

  const markNotificationsAsRead = async (user) => {
    if (!user || user?.role === "ADMIN") {
      return;
    }

    try {
      const response = await api.get("/notifications");
      const notifications = response.data?.success
        ? response.data.data || []
        : [];
      const latest =
        notifications.length > 0
          ? notifications[0]?.createdAt
          : new Date().toISOString();
      localStorage.setItem(
        getLastSeenKey(user),
        latest || new Date().toISOString(),
      );
    } catch {
      localStorage.setItem(getLastSeenKey(user), new Date().toISOString());
    }

    setUnreadNotificationCount(0);
    setHasNewNotificationAlert(false);
  };

  useEffect(() => {
    unreadCountRef.current = unreadNotificationCount;
  }, [unreadNotificationCount]);

  useEffect(() => {
    const savedUser = localStorage.getItem("uniops_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setCurrentView(parsedUser?.role === "ADMIN" ? "admin" : "home");
    }
  }, []);

  const handleLoginSuccess = (user) => {
    localStorage.setItem("uniops_user", JSON.stringify(user));
    setCurrentUser(user);
    setCurrentView(user?.role === "ADMIN" ? "admin" : "home");
  };

  const handleLogout = () => {
    localStorage.removeItem("uniops_user");
    setCurrentUser(null);
    setUnreadNotificationCount(0);
    setHasNewNotificationAlert(false);
    setCurrentView("login");
  };

  const handleRegisterSuccess = ({ email, password }) => {
    setPrefillCredentials({ email, password });
    setCurrentView("login");
  };

  const handleProfileUpdated = (profile) => {
    const nextUser = {
      ...currentUser,
      name: profile.name,
      email: profile.email,
      profileImageUrl: profile.profileImageUrl,
      address: profile.address,
      mobileNumber: profile.mobileNumber,
      department: profile.department,
      bio: profile.bio,
    };
    localStorage.setItem("uniops_user", JSON.stringify(nextUser));
    setCurrentUser(nextUser);
  };

  useEffect(() => {
    if (!currentUser || currentUser?.role === "ADMIN") {
      setUnreadNotificationCount(0);
      setHasNewNotificationAlert(false);
      return;
    }

    let mounted = true;

    const initializeUnread = async () => {
      const count = await refreshUnreadCount(currentUser);
      if (mounted) {
        setHasNewNotificationAlert(count > 0);
      }
    };

    initializeUnread();

    const stream = new EventSource(notificationsStreamUrl);
    stream.addEventListener("notification-created", async () => {
      const nextCount = await refreshUnreadCount(currentUser);
      if (mounted && nextCount > unreadCountRef.current) {
        setHasNewNotificationAlert(true);
      }
    });
    stream.addEventListener("notification-deleted", async () => {
      await refreshUnreadCount(currentUser);
    });
    stream.onerror = () => {
      stream.close();
    };

    return () => {
      mounted = false;
      stream.close();
    };
  }, [currentUser, notificationsStreamUrl]);

  const openNotifications = async () => {
    setCurrentView("notifications");
    await markNotificationsAsRead(currentUser);
  };

  const handleMarkNotificationsRead = async () => {
    await markNotificationsAsRead(currentUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        isAuthenticated={Boolean(currentUser)}
        currentUser={currentUser}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />

      {currentView === "admin" && currentUser?.role === "ADMIN" && (
        <AdminDashboard
          user={currentUser}
          onOpenAddNotifications={() =>
            setCurrentView("admin-add-notifications")
          }
          onOpenAnalytics={() => setCurrentView("analytics")}
          onOpenIncidents={() => setCurrentView("incidents")}
        />
      )}
      {currentView === "analytics" && currentUser?.role === "ADMIN" && (
        <Analytics user={currentUser} onBack={() => setCurrentView("admin")} />
      )}
      {currentView === "home" && currentUser && (
        <Home
          user={currentUser}
          unreadNotificationCount={unreadNotificationCount}
          hasNewNotificationAlert={hasNewNotificationAlert}
          onOpenNotifications={openNotifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          onNavigate={setCurrentView}
        />
      )}
      {currentView === "incidents" && currentUser && (
        <IncidentTickets
          user={currentUser}
          onBack={() =>
            setCurrentView(currentUser?.role === "ADMIN" ? "admin" : "home")
          }
        />
      )}
      {currentView === "admin-add-notifications" &&
        currentUser?.role === "ADMIN" && (
          <AddNotifications
            user={currentUser}
            onBack={() => setCurrentView("admin")}
          />
        )}
      {currentView === "notifications" && currentUser && (
        <Notifications
          onViewed={() => markNotificationsAsRead(currentUser)}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          onBack={() =>
            setCurrentView(currentUser?.role === "ADMIN" ? "admin" : "home")
          }
        />
      )}
      {currentView === "login" && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setCurrentView("register")}
          onSwitchToPasswordReset={() => setCurrentView("password-reset")}
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
      {currentView === "password-reset" && (
        <PasswordRest onBackToLogin={() => setCurrentView("login")} />
      )}
      {currentView === "profile" && currentUser && (
        <UserProfile
          user={currentUser}
          onBack={() =>
            setCurrentView(currentUser?.role === "ADMIN" ? "admin" : "home")
          }
          onUserUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
}

export default App;
