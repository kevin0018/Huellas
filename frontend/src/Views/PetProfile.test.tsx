// @vitest-environment jsdom

import type { ReactElement } from 'react';
import { TestLanguageProvider, switchLanguage } from '../test/language';

import "@testing-library/jest-dom/vitest";
import { cleanup, render as rtlRender, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PetSize, PetType, Sex, type Pet } from "../modules/pet/domain/Pet";
import { expectNoCriticalAccessibilityViolations } from "../test/accessibility";
import PetProfile from "./PetProfile";

const render = (ui: ReactElement) => rtlRender(ui, { wrapper: TestLanguageProvider });

const getPetById = vi.hoisted(() => vi.fn());

vi.mock("../composition/applicationServices", () => ({
  applicationServices: {
    pets: { getPetById },
  },
}));
vi.mock("../modules/auth/infra/AuthService", () => ({
  AuthService: { isAuthenticated: () => true },
}));
vi.mock("../Components/NavBar", () => ({ default: () => null }));
vi.mock("../Components/footer", () => ({ default: () => null }));
vi.mock("../Components/GoBackButton", () => ({
  ArrowLeftIcon: () => <svg aria-hidden="true" />,
}));

const pet: Pet = {
  id: 9,
  name: "Miso",
  ownerId: 4,
  type: PetType.CAT,
  birthDate: "2022-04-03T00:00:00.000Z",
  size: PetSize.SMALL,
  sex: Sex.FEMALE,
  race: "Europeo común",
  microchipCode: "941000028765432",
  hasPassport: true,
  passportNumber: "ES-2026-91",
  countryOfOrigin: "España",
  allergies: "Polen",
  activeMedications: "Sin medicación prescrita",
  medicalConditions: "Asma leve",
  notes: "Prefiere transportín cubierto.",
  profileImageUrl: "/pets/cat3.jpg",
};

afterEach(() => { cleanup(); localStorage.clear(); });

beforeEach(() => {
  getPetById.mockReset();
  getPetById.mockResolvedValue(pet);
});

describe("PetProfile", () => {
  it("prioritizes critical health information and routes to the pet records", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/pets/9"]}>
        <Routes>
          <Route path="/pets/:id" element={<PetProfile />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Miso" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Información importante" })).toHaveTextContent("Polen");
    expect(screen.getByRole("region", { name: "Información importante" })).toHaveTextContent("Asma leve");
    expect(screen.getByRole("link", { name: "Abrir cartilla" })).toHaveAttribute("href", "/pets/9/health");
    expect(screen.getByRole("link", { name: "Ver procedimientos" })).toHaveAttribute("href", "/procedures-view/9");
    expect(screen.getByRole("link", { name: "Editar datos" })).toHaveAttribute("href", "/pets/9/edit");
    expect(screen.getByRole("link", { name: "Tus mascotas" })).toHaveAttribute("href", "/user-home");
    expect(container.querySelector('img[src="/pets/cat3.jpg"]')).toBeInTheDocument();
    await expectNoCriticalAccessibilityViolations(container);
  });
});

it('switches identity, dates and empty details without reloading pet data', async () => {
  getPetById.mockResolvedValue({ ...pet, allergies: null, passportNumber: null });
  render(<MemoryRouter initialEntries={['/pets/9']}><Routes>
    <Route path="/pets/:id" element={<PetProfile />} />
  </Routes></MemoryRouter>);
  await screen.findByRole('heading', { name: 'Miso' });
  expect(screen.getByText('3 de abril de 2022')).toBeInTheDocument();

  switchLanguage('English');
  expect(screen.getByRole('region', { name: 'Important information' })).toHaveTextContent('Not recorded');
  expect(screen.getByText('Small')).toBeInTheDocument();
  expect(screen.getByText('Female')).toBeInTheDocument();
  expect(screen.getByText('3 April 2022')).toBeInTheDocument();
  expect(screen.getByText('Yes, no number recorded')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Open health book' })).toHaveAttribute('href', '/pets/9/health');

  switchLanguage('Català');
  expect(screen.getByText('Petit')).toBeInTheDocument();
  expect(screen.getByText('Femella')).toBeInTheDocument();
  expect(screen.getByText(/3 d[’']abril del? 2022/)).toBeInTheDocument();
  expect(screen.getByText('Europeo común')).toBeInTheDocument();
  expect(screen.getByText('Prefiere transportín cubierto.')).toBeInTheDocument();
  expect(document.documentElement.lang).toBe('ca');
  expect(getPetById).toHaveBeenCalledOnce();
});

it('switches an already visible local loading error and retry action', async () => {
  getPetById.mockRejectedValue(null);
  render(<MemoryRouter initialEntries={['/pets/9']}><Routes>
    <Route path="/pets/:id" element={<PetProfile />} />
  </Routes></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la mascota');
  switchLanguage('English');
  expect(screen.getByRole('alert')).toHaveTextContent('The pet could not be loaded');
  expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled();
  expect(getPetById).toHaveBeenCalledOnce();
});
