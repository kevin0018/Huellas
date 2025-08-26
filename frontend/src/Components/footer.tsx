import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/hooks/hook';

export default function Footer() {
  const { translate } = useTranslation();

  return (
    <footer className="bg-[#A89B9D] dark:bg-[#928d8e] text-[#51344D] p-4 shadow-md w-full sticky top-0 z-50 rounded-xs">
      <div className="container mx-auto py-4 flex flex-col justify-center items-center md:flex-row md:justify-between 3xl:max-w-80%">
        <div className="flex justify-center space-x-4 py-1.5">
          <img src="/media/sm/facebook.png" alt="facebook" className="w-7 h-7 3xl:w-8 3xl:h-8" />
          <img src="/media/sm/instagram.png" alt="instagram" className="w-7 h-7 3xl:w-8 3xl:h-8" />
          <img src="/media/sm/linkedin.png" alt="linkedin" className="w-7 h-7 3xl:w-8 3xl:h-8" />
        </div>
        <div className="flex flex-row items-center space-x-4 py-1.5">
          <Link to="/about" className="text-sm 3xl:!text-[2rem]">{translate('aboutUs')}</Link>
          <Link to="/contact" className="text-sm 3xl:!text-[2rem]">{translate('contact')}</Link>
        </div>
      </div>
    </footer>
  );
};