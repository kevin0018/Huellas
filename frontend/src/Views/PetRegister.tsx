// src/Views/PetRegister.tsx
import React from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import { Link, useNavigate } from "react-router-dom";

import { AuthService } from "../modules/auth/infra/AuthService";
import { petRepo } from "../di";
import { RegisterPetCommand } from "../modules/pet/application/commands/RegisterPetCommand";
import { RegisterPetCommandHandler } from "../modules/pet/application/commands/RegisterPetCommandHandler";
import type { PetType, PetSex, PetSize } from "../modules/pet/domain/Pet";

const PetRegister: React.FC = () => {
  const navigate = useNavigate();

  // OwnerId desde el usuario logueado
  const ownerId = React.useMemo(() => {
    const u = AuthService.getUser();
    return (u as any)?.ownerId ?? (u as any)?.owner?.id ?? (u as any)?.id;
  }, []);

  // Estado del formulario (controlado)
  const [form, setForm] = React.useState({
    name: "",
    sex: "male" as PetSex,
    birthDate: "" as string,         // YYYY-MM-DD
    race: "",
    type: "dog" as PetType,
    size: "medium" as PetSize,
    microchipCode: "",
    hasPassport: false,
    passportNumber: "",
    countryOfOrigin: "",
    notes: "",
  });

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function onChange<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const cmd = new RegisterPetCommand({
        name: form.name.trim(),
        race: form.race?.trim() || null,
        type: form.type,
        ownerId,
        birthDate: form.birthDate ? new Date(form.birthDate) : null,
        size: form.size ?? null,
        microchipCode: form.microchipCode?.trim() || null,
        sex: form.sex,
        hasPassport: !!form.hasPassport,
        countryOfOrigin: form.countryOfOrigin?.trim() || null,
        passportNumber: form.hasPassport ? (form.passportNumber?.trim() || null) : null,
        notes: form.notes?.trim() || null,
      });

      const handler = new RegisterPetCommandHandler(petRepo);
      const created = await handler.execute(cmd);

      // Ir al detalle si tienes ruta /pets/:id, o vuelve al home
      navigate(created?.id ? `/pets/${created.id}` : "/", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <NavBar />
      <div className="bg-dogs-userhome-mobile md:bg-dogs-userhome-tablet lg:bg-dogs-userhome-desktop bg-cover bg-center flex flex-col items-center justify-center dark:bg-dogs-userhome-mobile ">
        <div className="flex flex-col items-center justify-center text-center p-4">
          <h1 className="h1 font-caprasimo mb-4 py-8">Añadir mascota</h1>

          <img
            src="/media/logotipo.svg"
            alt=""
            className="w-24 md:w-32 lg:w-48 rounded-full bg-white mb-8"
          />

          <div className="bg-gray-100 flex items-center justify-center w-full">
            <div className="bg-[#FFFAF0] p-8 rounded-lg shadow-lg w-full max-w-4xl text-[#51344D]">
              {error && <p className="text-red-600 mb-4">{error}</p>}

              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
                onSubmit={onSubmit}
              >
                {/* Nombre */}
                <div className="md:col-span-1">
                  <label htmlFor="name" className="block text-sm font-medium">Nombre *</label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={e => onChange("name", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#51344D]"
                    placeholder="Nombre de la mascota"
                    required
                  />
                </div>

                {/* Sexo */}
                <div className="md:col-span-1">
                  <span className="block text-sm font-medium">Sexo *</span>
                  <div className="mt-2 flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sex"
                        value="male"
                        checked={form.sex === "male"}
                        onChange={() => onChange("sex", "male")}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm">Macho</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sex"
                        value="female"
                        checked={form.sex === "female"}
                        onChange={() => onChange("sex", "female")}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm">Hembra</span>
                    </label>
                  </div>
                </div>

                {/* Fecha de nacimiento */}
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium">Fecha de nacimiento</label>
                  <input
                    id="birthDate"
                    type="date"
                    value={form.birthDate}
                    onChange={e => onChange("birthDate", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#51344D]"
                  />
                </div>

                {/* Raza */}
                <div>
                  <label htmlFor="race" className="block text-sm font-medium">Raza</label>
                  <input
                    id="race"
                    value={form.race}
                    onChange={e => onChange("race", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#51344D]"
                    placeholder="Raza de la mascota"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium">Tipo *</label>
                  <select
                    id="type"
                    value={form.type}
                    onChange={e => onChange("type", e.target.value as PetType)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#51344D]"
                    required
                  >
                    <option value="dog">Perro</option>
                    <option value="cat">Gato</option>
                    <option value="ferret">Hurón</option>
                  </select>
                </div>

                {/* Tamaño */}
                <div>
                  <label htmlFor="size" className="block text-sm font-medium">Tamaño</label>
                  <select
                    id="size"
                    value={form.size}
                    onChange={e => onChange("size", e.target.value as PetSize)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#51344D]"
                  >
                    <option value="large">Grande</option>
                    <option value="medium">Mediano</option>
                    <option value="small">Pequeño</option>
                  </select>
                </div>

                {/* Microchip */}
                <div>
                  <label htmlFor="microchipCode" className="block text-sm font-medium">Código Microchip</label>
                  <input
                    id="microchipCode"
                    value={form.microchipCode}
                    onChange={e => onChange("microchipCode", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#51344D]"
                    placeholder="Código del microchip"
                  />
                </div>

                {/* ¿Tiene pasaporte? */}
                <div className="md:col-span-1">
                  <span className="block text-sm font-medium">¿Tiene pasaporte?</span>
                  <div className="mt-2 flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasPassport"
                        value="yes"
                        checked={form.hasPassport === true}
                        onChange={() => onChange("hasPassport", true)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm">Sí</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasPassport"
                        value="no"
                        checked={form.hasPassport === false}
                        onChange={() => onChange("hasPassport", false)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm">No</span>
                    </label>
                  </div>
                </div>

                {/* Nº pasaporte */}
                <div>
                  <label htmlFor="passportNumber" className="block text-sm font-medium">Número de pasaporte</label>
                  <input
                    id="passportNumber"
                    value={form.passportNumber}
                    onChange={e => onChange("passportNumber", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#51344D]"
                    placeholder="Número de pasaporte"
                    disabled={!form.hasPassport}
                  />
                </div>

                {/* Origen */}
                <div>
                  <label htmlFor="countryOfOrigin" className="block text-sm font-medium">Origen</label>
                  <input
                    id="countryOfOrigin"
                    value={form.countryOfOrigin}
                    onChange={e => onChange("countryOfOrigin", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#51344D]"
                    placeholder="País de origen"
                    disabled={!form.hasPassport}
                  />
                </div>

                {/* Notas */}
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium">Comentarios adicionales</label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={e => onChange("notes", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#51344D]"
                    placeholder="Escribe aquí cualquier comentario adicional sobre tu mascota"
                  />
                </div>

                {/* Botones */}
                <div className="md:col-span-2 flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="py-2 px-4 bg-[#51344D] hover:bg-[#A89B9D] text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                  >
                    {saving ? "Guardando…" : "Guardar cambios"}
                  </button>

                  <Link
                    to="/"
                    className="py-2 px-4 border rounded-md hover:bg-white/50 transition"
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          </div>

          <div className="p-10 flex justify-center">
            <Link
              to="/procedures"
              className="flex items-center justify-center gap-3 pr-4 bg-[#51344D] !text-white font-semibold rounded-lg shadow-md hover:bg-[#A89B9D] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-300 ease-in-out"
            >
              <img src="media/agenda_icon.svg" alt="Icono de agenda" className="h-10 w-10" />
              Ir a Procedimientos
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PetRegister;