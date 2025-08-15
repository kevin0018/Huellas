import React from 'react';
import Navbar from '../Components/NavBar';

const HomePage: React.FC = () => {

  return (
    <>
    <Navbar />
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-[#FDF2DE]">
      <header className="flex flex-row items-center justify-between m-5 dark:text-white">
        
        <h1 className="text-4xl font-caprasimo text-[#51344D]">
         Bienvenidx a Huellas
        </h1>

      </header>
      
<div>
    <img 
        src="media/dogs_desktop.png" 
        alt="Dogs_desktop"
        className="hidden md:block w-full"
    />

    <img 
        src="media/dogs_title.jpg" 
        alt="dogs_mobile"
        className="block md:hidden w-full"
    />
</div>

      <p className="text-lg text-center text-gray-700 dark:text-gray-800 mt-4">
        Somos una organización sin fines de lucro dedicada a mejorar la vida de los animales y sus dueños.
        Nuestro objetivo es crear un mundo donde cada animal tenga un hogar amoroso y cada dueño reciba el apoyo que necesita.
      </p>
    </div>
    </>
  );
};

export default HomePage;
