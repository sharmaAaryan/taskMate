import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import BrowseTasks from "./pages/BrowseTasks";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Footer from "./components/Footer";
import PostTask from "./pages/PostTask";
import ClientDashboard from "./pages/ClientDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowseTasks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post-task" element={<PostTask />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
      </Routes>
      <Footer />
      
    </>
  );
}

export default App;