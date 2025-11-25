import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/admin/Dashboard';
import ManageNews from '../components/admin/ManageNews';
import CreateNews from '../components/admin/CreateNews';
import ManageCategories from '../components/admin/ManageCategories';

const AdminPage = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/news" element={<ManageNews />} />
      <Route path="/news/create" element={<CreateNews />} />
      <Route path="/categories" element={<ManageCategories />} />
    </Routes>
  );
};

export default AdminPage;
