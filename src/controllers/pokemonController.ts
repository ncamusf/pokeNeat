import { Request, Response } from 'express';
import { db } from '../firebase';
import axios from 'axios';

export const getAvailablePokemons = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('pokemons').where('isAdopted', '==', false).get();

    // To do: change to json response and webApp in angular.
    if (snapshot.empty) {
      return res.send('<h1>No Pokémons available for adoption at the moment.</h1>');
    }

    let html = '<html><body><h1>Available Pokémons for Adoption</h1>';

    const pokemons = snapshot.docs.map(doc => doc.data());

    for (const pokemon of pokemons) {
      
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.idPokemon}`);
      const data = response.data;

      html += `
        <div>
          <h2>${data.name}</h2>
          <img src="${data.sprites.front_default}" alt="${data.name}" />
          <p>Type: ${data.types.map((t: any) => t.type.name).join(', ')}</p>
          <p>Abilities: ${data.abilities.map((a: any) => a.ability.name).join(', ')}</p>
          <p>Pokemon choice id: ${pokemon.id}</p>
        </div>
        <hr />
      `;
    }

    html += '</body></html>';
    res.send(html);
  } catch (error) {
    console.error('Error fetching available Pokémons:', error);
    res.status(500).send('Internal Server Error');
  }
};