import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEditEntry from './pages/CreateEditEntry';
import CreateProfile from './pages/CreateProfile';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public landing page - default route */}
        <Route path="/" element={<Home />} />

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
        <Route path="/dashboard" element={
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
        <Route path="/profiles/new" element={
          <Layout requireAuth>
            <CreateProfile />
          </Layout>
        } />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
