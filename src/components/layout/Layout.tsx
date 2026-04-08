import React from 'react';
import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-layout">
    <Navbar />
    <main className="main-content">{children}</main>
    <footer className="footer">
      <p>© 2024 ShopVault. All rights reserved.</p>
    </footer>
  </div>
);

export default Layout;