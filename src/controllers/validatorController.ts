import { Request } from 'express';
import { db } from '../firebase';

// Validator Filter
export const requestValidator = async (req: Request) => {
  const { name, lastname, address, rut, description, idPokemonchoice } = req.body;

  // Check for missing fields
  if (!name || !lastname || !address || !rut || !description || !idPokemonchoice) {
    return { error: 'All fields are required, follow the next format: ToDo', status: 400 };
  }

  const trainerAvailability = await searchForSpamTrainer(rut);
  if (trainerAvailability.error) {
    return trainerAvailability; 
  }

  const pokemonAvailability = await findAvailablePokemon(idPokemonchoice);
  if (pokemonAvailability.error) {
    return pokemonAvailability;
  }

  return { status: 200 };
};

//Search if the trainer is a spammer
export const searchForSpamTrainer = async (rut: string) => {
    try {
      const trainerRequests = await db.collection('adoptionRequests')
        .where('rut', '==', rut)
        .where('createdAt', '>=', new Date(new Date().setHours(0, 0, 0, 0))) 
        .where('createdAt', '<', new Date(new Date().setHours(24, 0, 0, 0)))
        .get();
  
      if (!trainerRequests.empty && trainerRequests.docs.length > 5) {
        return { error: 'You have exceeded the limit of 5 requests for today.', status: 404 };
      }
  
      return { message: `You have ${trainerRequests.docs.length} requests today.`, status: 200 };
    } catch (error) {
      console.error('Error checking trainer request limit:', error);
      return { error: 'Internal Server Error', status: 500 };
    }
};

//Find Availability of the pokemon
export const findAvailablePokemon = async (idPokemonchoice: string) => {
    try {
      const pokemonQuery = await db.collection('pokemons').where('id', '==', idPokemonchoice).get();
  
      if (pokemonQuery.empty) {
        return { error: `Pokémon with ID ${idPokemonchoice} not found.`, status: 404 };
      }
  
      let selectedPokemon: any = null;
      pokemonQuery.forEach((doc) => {
        const pokemonData = doc.data();
        if (pokemonData.isAdopted === false) {
          selectedPokemon = { id: doc.id, ...pokemonData };
        }
      });
  
      if (!selectedPokemon) {
        return { error: `Pokémon with ID ${idPokemonchoice} is either already adopted or unavailable.`, status: 400 };
      }
  
      return { pokemon: selectedPokemon, status: 200 };
    } catch (error) {
      console.error('Error finding Pokémon:', error);
      return { error: 'Internal Server Error', status: 500 };
    }
};