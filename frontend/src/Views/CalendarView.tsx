import React from 'react';
import { useTranslation } from '../i18n/hooks/hook';
import NavBar from '../Components/NavBar';

const CalendarView: React.FC = () => {
  const { translate } = useTranslation();
  return (
    <>
        <NavBar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDF2DE] dark:bg-[#51344D]">
          <h1 className="h1 font-caprasimo mb-4">{translate('welcome')}</h1>
        </div>
    </>
  );
};

export default CalendarView;
