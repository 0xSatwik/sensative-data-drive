import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEditEntry from './pages/CreateEditEntry';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={
          <Layout>
            <Login />
          </Layout>
        } />
        <Route path="/register" element={
          <Layout>
            <Register />
          </Layout>
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <Layout requireAuth>
            <Dashboard />
          </Layout>
        } />
        <Route path="/entries/new" element={
          <Layout requireAuth>
            <CreateEditEntry />
          </Layout>
        } />
        <Route path="/entries/edit/:id" element={
          <Layout requireAuth>
            <CreateEditEntry />
          </Layout>
        } />

        {/* Redirect any other route to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
