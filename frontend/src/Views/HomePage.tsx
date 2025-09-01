import React from 'react';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';
import CTAButton from '../Components/CTAButton';

const HomeContent: React.FC = () => {
  const { translate } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center sm:p-2 background-primary text-center">
      <header className="flex flex-row items-center justify-between text-center w-full max-w-5xl m-5 p-8">
        <h1 className="h1 font-caprasimo w-full">
          {translate('welcome')}
        </h1>
      </header>

      <div className="relative w-full max-w-5xl mx-auto flex flex-row items-center justify-center px-4 mb-10">
        {/* Desktop images */}
        {/* #1 */}
        <img src="/media/dogs_desktop.png" alt="Dogs desktop (light)" className="hidden lg:block dark:hidden w-full max-w-[700px]" />
        <img src="/media/dogs_desktop_purple_bg_white_lines.png" alt="Dogs desktop (dark)" className="hidden lg:dark:block w-full max-w-[700px]" />

        {/* #2 (second copy beside the first) */}
        <img src="/media/dogs_desktop.png" alt="Dogs desktop (light)" className="hidden lg:block dark:hidden w-full max-w-[700px]" />
        <img src="/media/dogs_desktop_purple_bg_white_lines.png" alt="Dogs desktop (dark)" className="hidden lg:dark:block w-full max-w-[700px]" />

        {/* Mobile image */}
        <img src="/media/dogs_title.png" alt="dogs_mobile" className="block lg:hidden w-full max-w-[600px]" />

        {/* CTA overlay */}
        <div className="absolute left-4 bottom-4 md:left-8 md:bottom-8 text-white">
          <CTAButton label={translate('getStarted')} href="/register" />
        </div>
      </div>


      <p className="lead text-justify w-full max-w-5xl mx-auto font-nunito">{translate('appDescription')}</p>

      <p className="lead text-justify w-full max-w-5xl font-nunito 3xl:max-w-[70%] 3xl:!text-[2rem]">{translate('appDescription')}</p>

      <section className="w-full max-w-5xl mt-20 mb-30">
        <h2 className="h2 font-caprasimo mb-4"> {translate('howToHelp')} </h2>
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
          <img src="/media/helpCat.svg" alt="Helping Cat" className='w-80 mx-auto m-5' />
          <div className="flex flex-col items-left md:items-start text-left max-w-xl font-nunito gap-8">
            <p className="lead text-left w-full max-w-4xl"> {translate('howToHelpText')} </p>
            <button className=" cursor-pointer bg-[#51344D] !text-white p-4 rounded hover:bg-[#BCAAA4] text-white hover:text-white transition-all duration-200 "> {translate('supportAnAnimal')} </button>
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