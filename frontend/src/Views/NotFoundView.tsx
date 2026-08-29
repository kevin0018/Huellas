import { Link } from 'react-router-dom';
import NavBar from '../Components/NavBar';

export default function NotFoundView() {
  return (
    <>
      <NavBar />
      <main className="ui-page min-h-screen grid place-items-center px-4 text-center">
        <div>
          <p className="font-caprasimo text-7xl text-[var(--huellas-lavender-1)]">404</p>
          <h1 className="mt-3 font-caprasimo text-3xl text-[var(--color-ink)]">Esta página no existe</h1>
          <Link className="ui-action ui-action--primary mt-6 px-5 py-3" to="/">
            Volver al inicio
          </Link>
        </div>
      </main>
    </>
  );
}
