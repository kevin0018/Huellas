import { Link } from 'react-router-dom';
import NavBar from '../Components/NavBar';

export default function NotFoundView() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen grid place-items-center bg-[#FDF2DE] dark:bg-[#51344D] px-4 text-center">
        <div>
          <p className="font-caprasimo text-7xl text-[#9886AD]">404</p>
          <h1 className="mt-3 font-caprasimo text-3xl text-[#51344D] dark:text-[#FDF2DE]">Esta página no existe</h1>
          <Link className="mt-6 inline-block rounded-lg bg-[#51344D] px-5 py-3 font-semibold text-white" to="/">
            Volver al inicio
          </Link>
        </div>
      </main>
    </>
  );
}
