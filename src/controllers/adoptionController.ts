import { Request, Response } from 'express';
import { db } from '../firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { AdoptionRequest } from '../models/adoptionRequest';

// Submit Adoption Request
export const submitAdoptionRequest = async (req: Request, res: Response) => {
  try {
    const { name, lastname, address, rut, description, idPokemonchoice} = req.body;

    if (!name || !lastname || !address || !rut || !description  || !idPokemonchoice) {
      return res.status(400).json({ message: 'All fields are required, follow the next format: ToDo'});
    }

    const adoptionId = uuidv4();
    
    const result = await findAvailablePokemon(idPokemonchoice);

    if (result.error) {
        return res.status(result.status).json({ message: result.error });
    }

    const isAccepted = await acceptenceMethod(rut);

    const adoptionRequest = {
      adoptionId,
      name,
      lastname,
      address,
      rut,
      description,
      idPokemonchoice,
      status: isAccepted ? 'In Preparation' : 'Denied',
      createdAt: new Date(),
    };

    await db.collection('adoptionRequests').doc(adoptionId).set(adoptionRequest);

    if (isAccepted) {
      simulatePreparation(adoptionRequest);
    }

    res.status(201).json({
      message: `Your adoption request has been ${adoptionRequest.status.toLowerCase()}, remember to save your adoptionId`,
      adoptionId: adoptionId,
      status: adoptionRequest.status,
    });
  } catch (error) {
    console.error('Error submitting adoption request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const acceptenceMethod = async (rut:string) => {
    const goodTrainerQuery = await db.collection('goodTrainer').where('rut', '==', rut).get();
    if(!goodTrainerQuery.empty){
        return Math.random() < 0.95;
    } else{
        return Math.random() < 0.5;
    }
};

//Find Availability of the pokemon
const findAvailablePokemon = async (idPokemonchoice: string) => {
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
  
      return { pokemon: selectedPokemon };
    } catch (error) {
      console.error('Error finding Pokémon:', error);
      return { error: 'Internal Server Error', status: 500 };
    }
};

//Preparation simulation (1m delay)
const simulatePreparation = (adoptionRequest: AdoptionRequest) => {
    setTimeout(async () => {
      try {
        await db.collection('adoptionRequests').doc(adoptionRequest.adoptionId).update({
          status: 'On Route',
        });
        await db.collection('pokemons').doc(adoptionRequest.idPokemonchoice).update({
            isAdopted: true,
          });
        simulateTransportation(adoptionRequest);
      } catch (error) {
        console.error('Error during preparation:', error);
      }
    }, 60 * 1000);
};

//Transportation simulation (1m-3m delay)
const simulateTransportation = (adoptionRequest: AdoptionRequest) => {

    const delay = (Math.floor(Math.random() * 3) + 1) * 60 * 1000;

    setTimeout(async () => {
      try {

        const isSuccess = Math.random() < 0.95;
  
        if (isSuccess) {

          await db.collection('adoptionRequests').doc(adoptionRequest.adoptionId).update({
            status: 'Success',
          });
          await saveTrainer(adoptionRequest);
        } else {

          await db.collection('adoptionRequests').doc(adoptionRequest.adoptionId).update({
            status: 'Failure',
          });
          await db.collection('pokemons').doc(adoptionRequest.idPokemonchoice).update({
            isAdopted: false,
          });

          await handleTransportationFailure(adoptionRequest.adoptionId);
        }
      } catch (error) {
        console.error('Error during transportation:', error);
      }
    }, delay);
};

//Save success adoption trainer
const saveTrainer = async (adoptionRequest: AdoptionRequest) => {

    const goodTrainerQuery = await db.collection('goodTrainer').where('rut', '==', adoptionRequest.rut).get();

    if (goodTrainerQuery.empty) {
        const goodTrainerId = uuidv4();
        const goodTrainer = {
            goodTrainerId,
            name: adoptionRequest.name,
            lastname: adoptionRequest.lastname,
            address: adoptionRequest.address,
            rut: adoptionRequest.rut,
            description: adoptionRequest.description,
            numberOfPokemonAdopted: 1
        };
        await db.collection('goodTrainer').doc(goodTrainerId).set(goodTrainer);

    } else {
        const goodTrainerId = goodTrainerQuery.docs[0].id;
        await db.collection('goodTrainer').doc(goodTrainerId).update({
            numberOfPokemonAdopted: FieldValue.increment(1),
          });
    }
}

//Transportation Failure handler
const handleTransportationFailure = async (adoptionId: string) => {
    try {
      const failureLog = {
        adoptionId,
        timestamp: new Date(),
        message: 'Transportation failed due to wrong address.',
      };
  
      await db.collection('transportationFailures').add(failureLog);

    } catch (error) {
      console.error('Error handling transportation failure:', error);
    }
  };

// Get Adoption Status
export const getAdoptionStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
  
      const doc = await db.collection('adoptionRequests').doc(id).get();
  
      if (!doc.exists) {
        return res.status(404).json({ message: 'Adoption request not found' });
      }
  
      const data = doc.data();
  
      res.status(200).json({ status: data?.status });
    } catch (error) {
      console.error('Error fetching adoption status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
