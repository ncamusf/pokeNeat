export interface AdoptionRequest {
    adoptionId: string;
    name: string;
    lastname: string;
    address: string;
    rut: string;
    description: string;
    idPokemonchoice: string;
    status?: string;
    createdAt?: Date; 
}