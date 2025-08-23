import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import { AuthService } from '../modules/auth/infra/AuthService';
import type { User } from '../modules/auth/domain/User';

const UserProfile: React.FC = () => {
  const { translate } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    isVolunteer: false,
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Get user data from AuthService
    const userData = AuthService.getUser();
    if (userData) {
      setUser(userData);
      setFormData({
        name: userData.name,
        lastName: userData.lastName,
        email: userData.email,
        isVolunteer: userData.type === 'volunteer',
        password: '',
        confirmPassword: ''
      });
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement update user profile logic
    console.log('Form data to update:', formData);
  };

  // Show loading while checking authentication
  if (!user) {
    return (
      <>
        <NavBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p>{translate('loading')}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="bg-dogs-userhome-mobile md:bg-dogs-userhome-tablet lg:bg-dogs-userhome-desktop bg-cover bg-center flex flex-col items-center justify-center dark:bg-dogs-userhome-mobile ">
        <div className="flex flex-col items-center justify-center text-center p-4">
          <h1 className="h1 font-caprasimo mb-4 py-8">Mi información</h1>

          <img
            src="/media/pfp_sample.svg"
            alt=""
            className="w-24 md:w-32 lg:w-48 rounded-full mb-8"
          />

          {/* Section for editing profile */}

          <div className="bg-gray-100  flex items-center justify-center">
            <div className="bg-[#FFFAF0] p-8 rounded-lg shadow-lg w-full max-w-4xl">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center text-left text-[#51344D]">
                {/* Name field */}
                <div className="md:col-span-1">
                  <label htmlFor="name" className="block text-sm font-medium ">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    required
                    placeholder="Nombre"
                  />
                </div>

                {/* Last name field */}
                <div className="md:col-span-1">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium "
                  >
                    Apellidos
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    required
                    placeholder="Apellidos"
                  />
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium ">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    required
                    placeholder="Correo electrónico"
                  />
                </div>

                {/* Volunteer checkbox */}
                <div className="flex items-center gap-2">
                  <label htmlFor="isVolunteer" className="text-sm font-medium flex flex-row items-center">
                    <input
                      type="checkbox"
                      name="isVolunteer"
                      id="isVolunteer"
                      checked={formData.isVolunteer}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 p-6  mr-2"
                    />
                    ¿Quieres ser voluntario?
                  </label>
                </div>

                {/* Password field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium "
                  >
                    Nueva contraseña (opcional)
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    placeholder="Deja en blanco para mantener la actual"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium "
                  >
                    Confirma tu nueva contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    placeholder="Confirma tu nueva contraseña"
                  />
                </div>

                {/* Submit button */}
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#BCAAA4] hover:bg-[#A89B9D] text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 ease-in-out"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="p-10 flex justify-center">
          <button
            type="button"
            className="
              flex items-center justify-center gap-3  pr-4
              bg-[#BCAAA4] text-white font-semibold rounded-lg shadow-md
              hover:bg-[#A89B9D] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
              transition-colors duration-300 ease-in-out"
          >
            {/* SVG icon from 'public' */}
            <img
              src="media/agenda_icon.svg"
              alt="Icono de agenda"
              className="h-10 w-10"
            />

            <Link to="/calendar" className="">{translate("viewAppointments")}</Link>
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
