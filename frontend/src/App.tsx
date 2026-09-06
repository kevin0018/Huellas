/**
 * App routes.
 * SPA routing via react-router-dom.
 */

import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LanguageProvider from './i18n/LanguageProvider';
import ThemeProvider from './Components/theme/ThemeProvider';
import HomePage from './Views/HomePage';
import NotFoundView from './Views/NotFoundView';
import ProtectedRoute from './app/routing/ProtectedRoute';
import CapabilityRoute from './app/routing/CapabilityRoute';
import AppErrorBoundary from './app/errors/AppErrorBoundary';
import RouteLoading from './app/routing/RouteLoading';
import { lazyView } from './app/routing/lazyView';
import { Capability } from './modules/auth/domain/User';

const Login = lazyView(() => import('./Views/Login'));
const Register = lazyView(() => import('./Views/Register'));
const AboutUs = lazyView(() => import('./Views/AboutUs'));
const PetRegister = lazyView(() => import('./Views/PetRegister'));
const ProceduresView = lazyView(() => import('./Views/ProceduresView'));
const AppointmentsView = lazyView(() => import('./Views/AppointmentsView'));
const UserHome = lazyView(() => import('./Views/UserHome'));
const PetProfile = lazyView(() => import('./Views/PetProfile'));
const UserProfile = lazyView(() => import('./Views/UserProfile'));
const VolunteerBoard = lazyView(() => import('./Views/VolunteerBoard'));
const VolunteerHome = lazyView(() => import('./Views/VolunteerHome'));
const ChatView = lazyView(() => import('./Views/chatView'));
const HealthBookView = lazyView(() => import('./Views/HealthBookView'));
const TermsView = lazyView(() => import('./Views/TermsView'));
const ResetPasswordView = lazyView(() => import('./Views/ResetPasswordView'));

const App: React.FC = () => {
  const location = useLocation();

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppErrorBoundary key={location.pathname}>
          <Suspense fallback={<RouteLoading />}>
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPasswordView />} />
              <Route path="/terms" element={<TermsView />} />
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
          </Suspense>
        </AppErrorBoundary>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
