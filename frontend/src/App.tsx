/**
 * App routes.
 * SPA routing via react-router-dom.
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LanguageProvider from './i18n/LanguageProvider';
import ThemeProvider from './Components/theme/ThemeProvider';
import HomePage from './Views/HomePage';
import Login from './Views/Login';
import Register from './Views/Register';
import AboutUs from "./Views/AboutUs";
import PetRegister from './Views/PetRegister';
import CalendarView from './Views/CalendarView';
import UserHome from './Views/UserHome';
import Contact from './Views/contact';
import PetProfile from './Views/PetProfile';
import UserProfile from './Views/UserProfile';
import Procedures from './Views/Procedures';



const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pet-register" element={<PetRegister />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/user-home" element={<UserHome />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pet-profile" element={<PetProfile />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/procedures" element={<Procedures />} />
        </Routes>
      </ThemeProvider>
    </LanguageProvider>

  );
};

export default App;