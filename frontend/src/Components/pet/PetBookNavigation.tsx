import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../i18n/hooks/hook';
import CareIcon from '../../shared/ui/CareIcon';

export function PetBookNavigation({ petId }: { petId: number }) {
  const { translate } = useTranslation();
  const pages = [
    { path: `/pets/${petId}`, label: 'petProfile', icon: 'paw' },
    { path: `/pets/${petId}/health`, label: 'openHealthBook', icon: 'book' },
    { path: `/procedures-view/${petId}`, label: 'viewProcedures', icon: 'calendar' },
  ] as const;
  return <nav className="pet-book-nav" aria-label={translate('healthBookTitle')}>
    {pages.map(page => <NavLink key={page.path} to={page.path} end>
      <CareIcon name={page.icon}/>{translate(page.label)}
    </NavLink>)}
  </nav>;
}
