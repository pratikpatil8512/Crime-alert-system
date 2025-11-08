export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token; // returns true if token exists
};

export const getUserRole = () => {
  return localStorage.getItem('role') || 'guest';
};

export const getUserName = () => {
  return localStorage.getItem('name') || 'Guest';
};


export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('name');
  window.location.href = '/login';
};
