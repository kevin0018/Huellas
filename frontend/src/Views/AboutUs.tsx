import React from 'react';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';

const AboutUs: React.FC = () => {
  const { translate } = useTranslation();

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDF2DE] dark:bg-[#51344D]">
        <h1 className="h1 font-caprasimo mb-4">{translate('aboutUs')}</h1>
        <p className="lead text-[--huellas-eggplant]/80 dark:text-[--huellas-ice]">{translate('howToHelp')}</p>
      </div>
    </>
  );
};

export default AboutUs;
