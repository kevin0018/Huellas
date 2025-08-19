/**
 * Home page view. Uses NavBar (with Theme + Lang) and localized text.
 * Providers are kept local for testing; lift to App layout when ready.
 */

import React from 'react';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';
import CTAButton from '../Components/CTAButton';


const HomeContent: React.FC = () => {
  const { translate } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-[#FDF2DE] dark:bg-[#51344D] text-center">
      <header className="flex flex-row items-center justify-between w-full max-w-5xl m-5">
        <h1 className="h1 font-caprasimo w-full">
          {translate('welcome')}
        </h1>
      </header>

      <div className="relative w-full max-w-5xl mx-auto flex flex-row items-center justify-center px-4">
          {/* Desktop images: visible from md and up */}
          <img src="/media/dogs_desktop.png" alt="Dogs_desktop" className="hidden lg:block w-full max-w-[500px]"/>
          <img src="/media/dogs_desktop.png" alt="Dogs_desktop" className="hidden lg:block w-full max-w-[500px]"/>
          {/* Mobile image: visible below md */}
          <img src="/media/dogs_title.png" alt="dogs_mobile" className="block lg:hidden w-full max-w-[600px]" />

          {/* CTA overlay */}
          <div className="absolute left-4 bottom-4 md:left-8 md:bottom-8">
            <CTAButton label={translate('getStarted')} href="#register" />
          </div>
        </div>


      <section className="w-full max-w-5xl mt-8">
        <h2 className="h2 font-caprasimo text-[--huellas-eggplant] dark:text-[--huellas-ice] mb-4">
          {translate('howToHelp')}
        </h2>
        <img src="/media/helpCat.svg" alt="Helping Cat" className='flex items-center justify-center w-80 mx-auto m-5' />
        <p className="lead text-[--huellas-eggplant]/80 dark:text-[--huellas-ice] text-justify">
          {translate('appDescription')}
        </p>
        <button>
          {translate('howToHelp')}
        </button>
      </section>
    </div>
  );
};

const HomePage: React.FC = () => {
  return (
    <>
      <NavBar />
      <HomeContent />
      <Footer />
    </>
  );
};

export default HomePage;