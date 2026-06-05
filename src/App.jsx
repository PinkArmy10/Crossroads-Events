import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import AdminRoute from "./components/AdminRoute";
import Serve from "./pages/Serve";
import CleaningSignup from "./pages/CleaningSignup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="contact" element={<Contact />} />
        <Route path="events" element={<Events />} />
        <Route path="login" element={<Login />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="serve" element={<Serve />} />
        <Route path="serve/cleaning" element={<CleaningSignup />} />
      </Route>
    </Routes>
  );
}

export default App;