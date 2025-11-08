import { useEffect, useState } from 'react';
import API from '../utils/api';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import DashboardMap from '../components/DashboardMap';
import NearbyStats from '../components/NearbyStats';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { AlertCircle, Users, Activity, FileWarning } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [crimes, setCrimes] = useState([]);
  const [userName, setUserName] = useState('User');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Load user info + stats
  useEffect(() => {
    const name = localStorage.getItem('name') || 'User';
    setUserName(name);
    fetchStats();
  }, []);

  // 🧭 Get and update user location, then fetch nearby crimes
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          try {
            // 🔹 Update location in backend
            await API.put('/users/update-location', { latitude, longitude });

            // 🔹 Fetch nearby crimes (within 3km)
            const res = await API.get(`/crimes/nearby?lat=${latitude}&lng=${longitude}`);
            const nearby = res.data || [];

            // 🔹 Add user's own marker
            const withUser = [
              ...nearby,
              {
                latitude,
                longitude,
                severity: 'self',
                category: 'Your Location',
                city: 'Current Position',
              },
            ];
            setCrimes(withUser);
          } catch (err) {
            console.error('Error updating location or fetching crimes:', err);
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.warn('Geolocation permission denied:', err);
          fetchAllCrimesFallback();
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.warn('Geolocation not supported by this browser');
      fetchAllCrimesFallback();
    }
  }, []);

  // 🔸 Fallback if location fails
  const fetchAllCrimesFallback = async () => {
    try {
      const res = await API.get('/crimes/heatmap');
      setCrimes(res.data || []);
    } catch (err) {
      console.error('Error fetching crimes:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const res = await API.get('/statistics');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats', err);
    }
  };

  // ✅ Handle Logout
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  // Chart colors
  const COLORS = ['#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#9333EA'];

  // Loading state
  if (!stats || loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 text-lg animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* ✅ Topbar shows username and logout */}
        <Topbar userName={userName} onLogout={handleLogout} />

        <main className="p-6 overflow-y-auto">
          {/* 📊 Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Crimes"
              value={stats.overview.totalCrimes}
              icon={<AlertCircle />}
              color="bg-red-500"
            />
            <StatCard
              title="Active Alerts"
              value={stats.overview.activeAlerts}
              icon={<Activity />}
              color="bg-yellow-500"
            />
            <StatCard
              title="Unresolved Complaints"
              value={stats.overview.unresolvedComplaints}
              icon={<FileWarning />}
              color="bg-orange-500"
            />
            <StatCard
              title="Total Users"
              value={stats.overview.totalUsers}
              icon={<Users />}
              color="bg-green-500"
            />
          </div>

          {/* 📈 Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 🥧 Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Crimes by Category
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={stats.crimesByCategory}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={55}
                    paddingAngle={4}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {stats.crimesByCategory.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} reports`, name]}
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <DashboardMap />
            <NearbyStats location={userLocation} />
            {/* 📊 Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Crimes by Severity
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={stats.crimesBySeverity}>
                  <XAxis dataKey="severity" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 🗺️ Map Section */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Live Crime Map (Near You)
            </h3>
            <MapContainer
              center={
                userLocation
                  ? [userLocation.lat, userLocation.lng]
                  : [19.7515, 75.7139]
              }
              zoom={userLocation ? 13 : 7}
              className="h-[400px] rounded-lg z-0"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* 🔵 User Marker */}
              {userLocation && (
                <CircleMarker
                  center={[userLocation.lat, userLocation.lng]}
                  radius={10}
                  color="blue"
                >
                  <Popup>You are here</Popup>
                </CircleMarker>
              )}
              

              {/* 🔴 Crimes Nearby */}
              {crimes.map((crime, idx) => (
                <CircleMarker
                  key={idx}
                  center={[crime.latitude, crime.longitude]}
                  radius={crime.severity === 'self' ? 10 : 6}
                  color={
                    crime.severity === 'self'
                      ? 'blue'
                      : crime.severity === 'critical'
                      ? 'red'
                      : crime.severity === 'moderate'
                      ? 'orange'
                      : 'green'
                  }
                >
                  <Popup>
                    <b>{crime.category}</b>
                    <br />
                    {crime.city}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
