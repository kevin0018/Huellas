import React from "react";
import GoBackButton from '../Components/GoBackButton';
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import { Link, useNavigate, useParams } from "react-router-dom";

import type { Pet, PetSize, PetType, Sex } from "../modules/pet/domain/Pet";
import { applicationServices } from "../composition/applicationServices";

const PetRegister: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const repo = applicationServices.pets;

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const birthDateInputRef = React.useRef<HTMLInputElement>(null);

  // Matches Omit<Pet, 'id' | 'ownerId'>
  const [form, setForm] = React.useState<Omit<Pet, "id" | "ownerId">>({
    name: "",
    race: "",
    type: "dog" as PetType,
    birthDate: "", // "YYYY-MM-DD"
    size: "medium" as PetSize,
    microchipCode: "",
    sex: "male" as Sex,
    hasPassport: false,
    countryOfOrigin: "",      // always enabled
    passportNumber: "",       // disabled when hasPassport = false
    notes: "",
    allergies: "",
    activeMedications: "",
    medicalConditions: "",
  });

  function onChange<K extends keyof Omit<Pet, "id" | "ownerId">>(
    key: K,
    value: Omit<Pet, "id" | "ownerId">[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  }

  // If editing, load the pet and prefill form
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isEdit) return;
      try {
        setError(null);
        const pet = await repo.getPetById(Number(id));
        if (cancelled) return;

        setForm({
          name: pet.name || "",
          race: pet.race || "",
          type: pet.type,
          // convert ISO -> YYYY-MM-DD for date input
          birthDate: pet.birthDate ? String(pet.birthDate).slice(0, 10) : "",
          size: pet.size,
          microchipCode: pet.microchipCode || "",
          sex: pet.sex,
          hasPassport: !!pet.hasPassport,
          // Make countryOfOrigin always editable
          countryOfOrigin: pet.countryOfOrigin || "",
          // Keep passport number disabled when hasPassport = false
          passportNumber: pet.passportNumber || "",
          notes: pet.notes || "",
          allergies: pet.allergies || "",
          activeMedications: pet.activeMedications || "",
          medicalConditions: pet.medicalConditions || "",
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [id, isEdit, repo]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    if (!form.name.trim() || !form.birthDate) {
      setError('Revisa los campos obligatorios antes de continuar.');
      queueMicrotask(() => {
        if (!form.name.trim()) nameInputRef.current?.focus();
        else birthDateInputRef.current?.focus();
      });
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        await repo.update(Number(id), {
          name: form.name,
          race: form.race?.trim() || null,
          type: form.type,
          birthDate: form.birthDate, // repo.update convierte a ISO
          size: form.size,
          microchipCode: form.microchipCode?.trim() || null,
          sex: form.sex,
          hasPassport: form.hasPassport,
          countryOfOrigin: form.countryOfOrigin?.trim() || null,
          passportNumber: form.hasPassport ? (form.passportNumber?.trim() || null) : null,
          notes: form.notes?.trim() || null,
          allergies: form.allergies?.trim() || null,
          activeMedications: form.activeMedications?.trim() || null,
          medicalConditions: form.medicalConditions?.trim() || null,
        });
      } else {
        await repo.create({
          name: form.name,
          race: form.race?.trim() || null,
          type: form.type,
          birthDate: form.birthDate,
          size: form.size,
          microchipCode: form.microchipCode?.trim() || null,
          sex: form.sex,
          hasPassport: form.hasPassport,
          countryOfOrigin: form.countryOfOrigin?.trim() || undefined,         // <- no null
          passportNumber: form.hasPassport ? (form.passportNumber?.trim() || undefined) : undefined, // <- no null
          notes: form.notes?.trim() || undefined,                              // <- no null
          allergies: form.allergies?.trim() || undefined,
          activeMedications: form.activeMedications?.trim() || undefined,
          medicalConditions: form.medicalConditions?.trim() || undefined,
        });
      }

      navigate('/user-home', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  const missingName = submitted && !form.name.trim();
  const missingBirthDate = submitted && !form.birthDate;

  return (
    <>
      <NavBar />
      <main className="form-page bg-dogs-userhome-mobile bg-cover bg-center md:bg-dogs-userhome-tablet lg:bg-dogs-userhome-desktop dark:bg-dogs-userhome-mobile">
        <div className="form-page__content form-page__content--wide">
          <GoBackButton variant="outline" hideIfNoHistory />

          <header className="form-page__header">
            <h1 className="form-page__title font-caprasimo">
              {isEdit ? 'Editar mascota' : 'Añadir mascota'}
            </h1>
            <p className="form-page__description">
              Guarda sus datos básicos y la información que puede ayudar durante una consulta.
            </p>
          </header>

          <form aria-busy={saving || undefined} className="form-surface form-stack" noValidate onSubmit={onSubmit}>
              {error && <p className="form-alert" role="alert">{error}</p>}

              <div className="modal-form__grid">
                {/* Nombre */}
                <div className="form-field">
                  <label htmlFor="name" className="form-label">Nombre *</label>
                  <input id="name" value={form.name} onChange={(e) => onChange("name", e.target.value)}
                    aria-describedby={missingName ? 'pet-name-error' : undefined}
                    aria-invalid={missingName || undefined}
                    className="form-control" ref={nameInputRef} required />
                  {missingName && <span className="form-error" id="pet-name-error">Escribe el nombre de tu mascota.</span>}
                </div>

                {/* Sexo */}
                <fieldset className="form-choice-set">
                  <legend className="form-legend">Sexo *</legend>
                  <div className="form-choice-grid">
                    <label className="form-choice">
                      <input type="radio" name="sex" value="male" checked={form.sex === "male"}
                        onChange={() => onChange("sex", "male" as Sex)} />
                      <span>Macho</span>
                    </label>
                    <label className="form-choice">
                      <input type="radio" name="sex" value="female" checked={form.sex === "female"}
                        onChange={() => onChange("sex", "female" as Sex)} />
                      <span>Hembra</span>
                    </label>
                  </div>
                </fieldset>

                {/* Fecha de nacimiento */}
                <div className="form-field">
                  <label htmlFor="birthDate" className="form-label">Fecha de nacimiento *</label>
                  <input id="birthDate" required type="date" value={form.birthDate}
                    onChange={(e) => onChange("birthDate", e.target.value)}
                    aria-describedby={missingBirthDate ? 'pet-birth-date-error' : undefined}
                    aria-invalid={missingBirthDate || undefined}
                    className="form-control" ref={birthDateInputRef} />
                  {missingBirthDate && <span className="form-error" id="pet-birth-date-error">Indica su fecha de nacimiento.</span>}
                </div>

                {/* Raza */}
                <div className="form-field">
                  <label htmlFor="race" className="form-label">Raza</label>
                  <input id="race" value={form.race ?? ''} onChange={(e) => onChange("race", e.target.value)}
                    placeholder="Desconocida"
                    className="form-control" />
                </div>

                {/* Tipo */}
                <div className="form-field">
                  <label htmlFor="type" className="form-label">Tipo *</label>
                  <select id="type" value={form.type} onChange={(e) => onChange("type", e.target.value as PetType)}
                    aria-describedby="pet-type-help" className="form-control" required>
                    <option value="dog">Perro</option>
                    <option value="cat">Gato</option>
                    <option value="ferret">Hurón</option>
                  </select>
                  <p className="form-help" id="pet-type-help">Actualmente se admiten perros, gatos y hurones.</p>
                </div>

                {/* Tamaño */}
                <div className="form-field">
                  <label htmlFor="size" className="form-label">Tamaño</label>
                  <select id="size" required value={form.size} onChange={(e) => onChange("size", e.target.value as PetSize)}
                    className="form-control">
                    <option value="large">Grande</option>
                    <option value="medium">Mediano</option>
                    <option value="small">Pequeño</option>
                  </select>
                </div>

                {/* Microchip */}
                <div className="form-field">
                  <label htmlFor="microchipCode" className="form-label">Código Microchip</label>
                  <input id="microchipCode" value={form.microchipCode ?? ''} onChange={(e) => onChange("microchipCode", e.target.value)}
                    placeholder="Sin microchip o desconocido"
                    className="form-control" />
                </div>

                {/* Pasaporte */}
                <fieldset className="form-choice-set">
                  <legend className="form-legend">¿Tiene pasaporte?</legend>
                  <div className="form-choice-grid">
                    <label className="form-choice">
                      <input type="radio" name="hasPassport" value="yes" checked={form.hasPassport === true}
                        onChange={() => onChange("hasPassport", true)} />
                      <span>Sí</span>
                    </label>
                    <label className="form-choice">
                      <input type="radio" name="hasPassport" value="no" checked={form.hasPassport === false}
                        onChange={() => onChange("hasPassport", false)} />
                      <span>No</span>
                    </label>
                  </div>
                </fieldset>

                {/* Nº pasaporte (disabled if !hasPassport) */}
                <div className="form-field">
                  <label htmlFor="passportNumber" className="form-label">Número de pasaporte</label>
                  <input id="passportNumber" value={form.passportNumber ?? ''}
                    onChange={(e) => onChange("passportNumber", e.target.value)}
                    aria-describedby={!form.hasPassport ? 'passport-number-help' : undefined}
                    className="form-control"
                    disabled={!form.hasPassport} />
                  {!form.hasPassport && <span className="form-help" id="passport-number-help">Selecciona “Sí” en pasaporte para añadir el número.</span>}
                </div>

                {/* Origen (ALWAYS enabled now) */}
                <div className="form-field">
                  <label htmlFor="countryOfOrigin" className="form-label">Origen</label>
                  <input id="countryOfOrigin" value={form.countryOfOrigin ?? ''}
                    onChange={(e) => onChange("countryOfOrigin", e.target.value)}
                    className="form-control" />
                </div>
              </div>

              <section aria-labelledby="pet-health-heading" className="form-section">
                <h2 className="form-section__title" id="pet-health-heading">Información de salud</h2>
                {(['allergies', 'activeMedications', 'medicalConditions'] as const).map((field) => (
                  <div className="form-field" key={field}>
                    <label htmlFor={field} className="form-label">
                      {field === 'allergies' ? 'Alergias' : field === 'activeMedications' ? 'Medicación activa' : 'Condiciones relevantes'}
                    </label>
                    <textarea id={field} value={form[field] ?? ''} onChange={(event) => onChange(field, event.target.value)}
                      className="form-control" />
                  </div>
                ))}
                <div className="form-field">
                  <label htmlFor="notes" className="form-label">Comentarios adicionales</label>
                  <textarea id="notes" value={form.notes ?? ''}
                    onChange={(e) => onChange("notes", e.target.value)}
                    className="form-control" />
                </div>
              </section>

              <div className="modal-form__actions">
                <button aria-busy={saving || undefined} className="ui-button" type="submit" disabled={saving}>
                  {saving && <span aria-hidden="true" className="ui-spinner" />}
                  {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear mascota"}
                </button>
              </div>
          </form>

          {isEdit && (
            <Link to={`/procedures-view/${id}`} className="ui-button">
              <img src="/media/agenda_icon.svg" alt="" aria-hidden="true" className="h-10 w-10" />
              Ir a procedimientos
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PetRegister;
