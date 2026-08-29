// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PetSize, PetType, Sex, type Pet } from "../modules/pet/domain/Pet";
import { expectNoCriticalAccessibilityViolations } from "../test/accessibility";
import PetProfile from "./PetProfile";

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
vi.mock("../Components/GoBackButton", () => ({ default: () => <button type="button">Atrás</button> }));

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
};

afterEach(cleanup);

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
    await expectNoCriticalAccessibilityViolations(container);
  });
});
