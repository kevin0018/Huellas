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
    <div className="flex flex-col items-center justify-center p-2 sm:p-8 bg-[#FDF2DE] dark:bg-[#51344D] text-center">
      <header className="flex flex-row items-center justify-between w-full max-w-5xl m-5">
        <h1 className="h1 font-caprasimo w-full">
          {translate('welcome')}
        </h1>
      </header>

      <div className="relative w-full max-w-5xl mx-auto flex flex-row items-center justify-center px-4 mb-10">
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

      <p className="lead text-justify w-full max-w-4xl mx-auto font-nunito">{translate('appDescription')}</p>


      <section className="w-full max-w-5xl mt-20 mb-30">
        <h2 className="h2 font-caprasimo mb-4">
          {translate('howToHelp')}
        </h2>
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <img src="/media/helpCat.svg" alt="Helping Cat" className='flex items-center justify-center w-80 mx-auto m-5' />
          <div className="flex flex-col items-center md:items-start text-left w-140 font-nunito">
            <p className="lead text-justify">
              {translate('appDescription')}
            </p>
            <button className="bg-[#51344D] text-white m-4 py-2 px-4 rounded">
              {translate('howToHelp')}
            </button>
          </div>
        </div>
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