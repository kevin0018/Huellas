/**
 * Language switcher (en/es/ca) using i18n context.
 * Styled for visibility on both light and dark backgrounds.
*/

import type { FC, ChangeEvent } from 'react';
import { useTranslation } from './hooks/hook';
import type { Language } from './dictionary';

const LanguageSwitcher: FC<{ className?: string }> = ({ className }) => {
  const { currentLanguage, changeLanguage, availableLanguages } = useTranslation();

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value as Language);
  };

  return (
    <div className="relative">
      <select
        aria-label="Change language"
        value={currentLanguage}
        onChange={onChange}
        className={className ?? 'select-huellas'}
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;