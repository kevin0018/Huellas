import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import GoBackButton from '../Components/GoBackButton';

import { ApiPetRepository } from "../modules/pet/infra/ApiPetRepository";
import type { Pet } from "../modules/pet/domain/Pet";
import { getPetSizeLabel, getPetTypeLabel, getSexLabel } from "../modules/pet/domain/Pet";
import { AuthService } from "../modules/auth/infra/AuthService";

type ProfileDetailProps = {
  label: string;
  value: React.ReactNode;
};

const ProfileDetail: React.FC<ProfileDetailProps> = ({ label, value }) => (
  <div className="text-center md:text-left">
    <h3 className="block font-caprasimo text-[#51344D] uppercase tracking-wider">{label}</h3>
    <p className="mt-1 text-center">{value}</p>
  </div>
);

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-ES"); // dd/mm/aaaa
}

const PetProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const repo = useMemo(() => new ApiPetRepository(), []);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth + load
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const petId = Number(id);
    if (!petId || Number.isNaN(petId)) {
      setError("Identificador de mascota inválido");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await repo.getPetById(petId);
        if (!cancelled) setPet(data);
      } catch (e: any) {
        // If backend returns 401, bounce to login
        if (String(e?.message || "").toLowerCase().includes("unauthorized")) {
          navigate("/login");
          return;
        }
        setError(e instanceof Error ? e.message : "No se pudo cargar la mascota");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, repo, navigate]);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#FDF6E8] bg-cover bg-center flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center text-center w-full max-w-6xl xl:max-w-7xl 3xl:max-w-[1600px] mx-auto">

          {/* Go back */}
          <div className="w-full text-left mb-2">
            <GoBackButton variant="outline" hideIfNoHistory />
          </div>

          <h1 className="text-4xl md:text-5xl font-caprasimo mb-6 text-[#51344D]">Perfil de la Mascota</h1>

          {/* Loading / Error */}
          {loading && (
            <div className="flex items-center gap-3 my-8 text-[#51344D]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current" />
              Cargando…
            </div>
          )}
          {error && (
            <div className="my-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Avatar */}
          {!loading && !error && (
            <>
              <div className="mb-8">
                <div className="avatar-circle size-36 md:size-40 mx-auto">
                  <img src="/media/pfp_sample.svg" alt="Foto de perfil de la mascota" className="size-full object-cover"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="themed-card themed-card-invL p-8 w-full 3xl:max-w-[90%]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-6 text-center">
                  <ProfileDetail label="Nombre" value={pet?.name ?? "—"} />
                  <ProfileDetail label="Sexo" value={pet ? getSexLabel(pet.sex) : "—"} />
                  <ProfileDetail label="Fecha de Nacimiento" value={formatDate(pet?.birthDate)} />
                  <ProfileDetail label="Raza" value={pet?.race || "—"} />
                  <ProfileDetail label="Tipo" value={pet ? getPetTypeLabel(pet.type) : "—"} />
                  <ProfileDetail label="Tamaño" value={pet ? getPetSizeLabel(pet.size) : "—"} />
                  <ProfileDetail label="Código Microchip" value={pet?.microchipCode || "—"} />
                  <ProfileDetail label="Pasaporte" value={pet?.hasPassport ? (pet?.passportNumber || "Sí") : "No"} />
                  <ProfileDetail label="Origen" value={pet?.countryOfOrigin || "—"} />
                </div>

                <div className="text-center border-t pt-6 mt-6">
                  <h3 className="block text-[#51344D] uppercase tracking-wider">Comentarios Adicionales</h3>
                  <p className="mt-2 text-base text-gray-700 max-w-2xl mx-auto">{pet?.notes || "—"}</p>
                </div>
              </div>

              <div className="p-10 flex justify-center">
                <Link to= {`/pets/${pet?.id}/edit`} className="flex items-center justify-center gap-3 py-3 px-6 bg-[#51344D] text-white font-semibold rounded-lg shadow-md hover:bg-[#A89B9D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#51344D] transition-all duration-300 ease-in-out transform hover:scale-105" >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                  </svg>
                  Editar perfil de mascota
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PetProfile;
