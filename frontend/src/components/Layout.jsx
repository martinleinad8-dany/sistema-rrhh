import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-main">
        <Navbar />
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;