import { getUserRole, getUserName } from '../utils/auth';

export default function Topbar() {
  const role = getUserRole();
  const name = getUserName();

  return (
    <div className="h-16 bg-white shadow-md flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-indigo-700">
        Welcome, {name || 'User'} 👋
      </h1>
      <div className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium capitalize">
        {role}
      </div>
    </div>
  );
}
