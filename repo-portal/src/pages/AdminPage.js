import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/admin/AdminLayout';
import Dashboard from '../components/admin/Dashboard';
import ManageNews from '../components/admin/ManageNews';
import CreateNews from '../components/admin/CreateNews';
import ManageCategories from '../components/admin/ManageCategories';
import PaymentRequests from '../components/admin/PaymentRequests';
import ManageSources from './admin/ManageSources';

const AdminPage = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/news" element={<ManageNews />} />
        <Route path="/news/create" element={<CreateNews />} />
        <Route path="/news/edit/:id" element={<CreateNews />} />
        <Route path="/categories" element={<ManageCategories />} />
        <Route path="/payments" element={<PaymentRequests />} />
        <Route path="/sources" element={<ManageSources />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;
