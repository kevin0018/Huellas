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
import ProceduresView from './Views/ProceduresView';
import AppointmentsView from './Views/AppointmentsView';
import UserHome from './Views/UserHome';
import PetProfile from './Views/PetProfile';
import UserProfile from './Views/UserProfile';
import VolunteerBoard from './Views/VolunteerBoard';
import VolunteerHome from './Views/VolunteerHome';
import ChatView from './Views/chatView';
import HealthBookView from './Views/HealthBookView';
import NotFoundView from './Views/NotFoundView';
import ProtectedRoute from './app/routing/ProtectedRoute';
import CapabilityRoute from './app/routing/CapabilityRoute';
import { Capability } from './modules/auth/domain/User';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/volunteer-board" element={<VolunteerBoard />} />
            <Route path="/chat" element={<ChatView />} />
            <Route element={<CapabilityRoute capability={Capability.MANAGE_PETS} />}>
              <Route path="/pet-register" element={<PetRegister />} />
              <Route path="/pets/:id/edit" element={<PetRegister />} />
              <Route path="/procedures-view/:petId" element={<ProceduresView />} />
              <Route path="/appointments" element={<AppointmentsView />} />
              <Route path="/user-home" element={<UserHome />} />
              <Route path="/pets/:id" element={<PetProfile />} />
              <Route path="/pets/:petId/health" element={<HealthBookView />} />
            </Route>
            <Route element={<CapabilityRoute capability={Capability.PUBLISH_VOLUNTEER_POSTS} />}>
              <Route path="/volunteer-home" element={<VolunteerHome />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
