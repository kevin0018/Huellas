import { describe, it, expect, vi } from "vitest";
import { Request, Response } from 'express';
import { Pet } from "../../../domain/entities/Pet.js";
import { DeletePetController } from "../DeletePetController.js";


describe("DeletePetController", () => {

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

    it('should return 204 No Content if it has been deleted successfully', async () => {

        // Mocks

        // Mock Repository
        const mockPetRepository = {
            findById: () => Promise.resolve(mockPet),
            save: () => Promise.resolve(mockPet),
            delete: () => Promise.resolve(undefined)
        };

        // Mock Request
        const mockRequest: Partial<Request> = { params: { id: "1" } };

        // Mock Response
        const mockResponse: Partial<Response> = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis()
        };

        // Pet Controller Instance with mock pet repository
        const deletePetController = new DeletePetController(mockPetRepository);

        // Pet Controller execution with mocks
        await deletePetController.handle(mockRequest as Request, mockResponse as Response);

        // Check results
        expect(mockResponse.status).toHaveBeenCalledWith(204);
        expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it("should return 500 Internal Server Error if repository fails", async () => {

        // Mocks

        // Mock Repository
        const mockPetRepository = {
            findById: () => Promise.reject("Error"),
            save: () => Promise.resolve(mockPet),
            delete: () => Promise.reject("Error")
        }

        // Mock Request
        const mockRequest: Partial<Request> = { params: { id: "1" } };

        // Mock Response
        const mockResponse: Partial<Response> = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        };

        // Pet Controller Instance with mock pet repository
        const deletePetController = new DeletePetController(mockPetRepository);

        // Pet Controller execution with mocks
        await deletePetController.handle(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.send).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
})

