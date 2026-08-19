import { Navigate, Outlet } from 'react-router-dom';
import { Capability, hasCapability } from '../../modules/auth/domain/User';
import { AuthService } from '../../modules/auth/infra/AuthService';

export default function CapabilityRoute({ capability }: { capability: Capability }) {
  const user = AuthService.getUser();
  return hasCapability(user, capability) ? <Outlet /> : <Navigate to="/user-profile" replace />;
}
