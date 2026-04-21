import { Link, Route, Routes } from "react-router-dom";

function Dashboard() {
  return <div className="p-6 text-xl font-semibold">Dashboard</div>;
}

function Login() {
  return <div className="p-6 text-xl font-semibold">Login</div>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="flex gap-4 border-b p-4">
        <Link to="/login">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}