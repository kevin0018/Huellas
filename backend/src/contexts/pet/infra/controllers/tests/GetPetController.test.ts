import { describe, it, expect, vi } from "vitest";
import { GetPetController } from "../GetPetController.js";
import { Pet } from "../../../domain/entities/Pet.js";
import { Request, Response } from 'express';

describe("GetPetController", () => {

    const mockPet = new Pet(
        1,
        "Stitch",
        "Tabby",
        "cat",
        1,
        new Date("03-05-2018"),
        "medium",
        "ASDF",
        "male",
        true,
        "Spain",
        "123A",
        "Very posh"
    )

    it('should return 200 OK if pet does exist', async () => {

        // Mocks

        // Mock Repository
        const mockPetRepository = {
            findById: () => Promise.resolve(mockPet),
            save: () => Promise.resolve(mockPet),
            delete: () => Promise.resolve(undefined),
            update: () => Promise.resolve(mockPet),
            findByOwnerId: () => Promise.resolve([mockPet])
        }

        // Mock Request
        const mockRequest: Partial<Request> = { params: { id: "1" } };

        // Mock Response
        const mockResponse: Partial<Response> = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        };

        // Pet Controller Instance with mock pet repository
        const getPetController = new GetPetController(mockPetRepository);

        // Pet Controller execution with mocks
        await getPetController.handle(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.send).toHaveBeenCalledWith(mockPet);

    })

    it("should return 500 Internal Server Error if repository fails", async () => {

        // Mocks

        // Mock Repository
        const mockPetRepository = {
            findById: () => Promise.reject("Error"),
            save: () => Promise.resolve(mockPet),
            delete: () => Promise.resolve(undefined),
            update: () => Promise.resolve(mockPet),
            findByOwnerId: () => Promise.resolve([mockPet])
        }

        // Mock Request
        const mockRequest: Partial<Request> = { params: { id: "1" } };

        // Mock Response
        const mockResponse: Partial<Response> = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        };

        // Pet Controller Instance with mock pet repository
        const getPetController = new GetPetController(mockPetRepository);

        // Pet Controller execution with mocks
        await getPetController.handle(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'Internal server error' });
    })
})