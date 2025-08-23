import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/hooks/hook';

export default function Footer() {
  const { translate } = useTranslation();

  return (
    <footer className="bg-[#A89B9D] dark:bg-[#928d8e] text-[#51344D] p-4 shadow-md w-full sticky top-0 z-50 rounded-xs">
      <div className="container mx-auto py-4 flex flex-col justify-center items-center md:flex-row md:justify-between">
        <div className="flex justify-center space-x-4 py-1.5">
          <img src="/media/sm/facebook.png" alt="facebook" className="w-7 h-7" />
          <img src="/media/sm/instagram.png" alt="instagram" className="w-7 h-7" />
          <img src="/media/sm/linkedin.png" alt="linkedin" className="w-7 h-7" />
        </div>
        <div className="flex flex-row items-center space-x-4 py-1.5">
          <Link to="/about" className="text-sm hover-eggplant">{translate('aboutUs')}</Link>
          <Link to="/contact" className="text-sm hover-eggplant">{translate('contact')}</Link>
        </div>
      </div>
    </footer>
  );
};