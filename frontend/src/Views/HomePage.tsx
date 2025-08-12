import React from 'react';

// Define the HomePage component as a React Functional Component (FC).
// Using React.FC is good practice as it automatically provides type checking for props.
const HomePage: React.FC = () => {
  // The component returns a simple JSX structure.
  // You can add your homepage content, such as a hero section, and more components here.
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 min-h-screen min-w-screen">
      <header className="flex flex-row items-center justify-between w-180 m-5">
        <img src="./huellas.jpg" alt="Huellas Logo" className="mb-4 h-30 rounded-xl"  />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Huellas!
        </h1>

      </header>
      
      <p className="text-lg text-gray-700 dark:text-gray-300 text-center max-w-xl">
        This is where we will build our amazing application.
      </p>
    </div>
  );
};

export default HomePage;
