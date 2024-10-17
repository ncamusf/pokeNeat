# PokeNeat

PokeNeat es una API desarrollada para facilitar la adopción de Pokémon de manera rápida y eficiente. La aplicación permite a los entrenadores enviar solicitudes de adopción, validar la disponibilidad de Pokémon, y recibir actualizaciones en tiempo real del estado de su adopción. La API está integrada con Firebase para la autenticación, almacenamiento y manejo de datos.

## Características Abordadas

- **Solicitud de Adopción**: Los entrenadores pueden enviar solicitudes para adoptar Pokémon.
- **Validación de Solicitudes**: La API verifica que los entrenadores no superen el límite de solicitudes diarias y que los Pokémon estén disponibles.
- **Estados de Adopción**: Los entrenadores reciben actualizaciones sobre el estado de sus solicitudes de adopción.
- **Simulación de Preparación y Transporte**: La API simula los tiempos de preparación y entrega de los Pokémon adoptados.
- **Visualización de Pokémon Disponibles**: Los entrenadores pueden ver los Pokémon disponibles para adopción mediante una página HTML.

## Uso

### Solicitud de Adopción

1. **Enviar Solicitud**: Los entrenadores deben proporcionar su nombre, dirección y el Pokémon que desean adoptar.
2. **Validación**: La API valida que el entrenador no haya excedido el límite diario de solicitudes (máximo 5) y que el Pokémon esté disponible.
3. **Estado de la Solicitud**: Si la solicitud es aceptada, el estado cambiará a "En preparación" y, posteriormente, a "En ruta".
4. **Simulación de Entrega**: La entrega del Pokémon se simula con un retraso aleatorio de 1 a 3 minutos.

### Ver Pokémon Disponibles

Puedes ver los Pokémon disponibles para adopción en formato HTML navegando a la siguiente URL:

- **URL:** `http://localhost:3000/pokemons`
- **Método:** `GET`
- **Respuesta:** Devuelve una página HTML con una lista de Pokémon disponibles y sus imágenes.

## TareaNeat

Este proyecto fue generado con Node.js y Firebase.

### Servidor de Desarrollo
1. Descargar key en el [firebase](https://console.firebase.google.com/project/pokeneat-6a14f/settings/serviceaccounts/adminsdk?hl=es-419) y modificarla con el preexistente archivo serviceAccountKey.json. 
2. Ejecuta `npm install` para instalar todas las dependencias necesarias.
3. Mi credencial de Firebase ya está incluida en el entorno.
4. Ejecuta `npm run dev` para levantar el servidor de desarrollo. Navega a [http://localhost:3000/](http://localhost:3000/).

### Rutas de la API

#### **GET /pokemons**

Obtén la lista de Pokémon disponibles en formato HTML.

- **URL:** `/pokemons`
- **Método:** `GET`
- **Respuesta Exitosa (200):** Devuelve una página HTML con la lista de Pokémon y sus fotos.

#### **POST /adoption**

Envía una solicitud de adopción para un Pokémon.

- **URL:** `/adoption`
- **Método:** `POST`
- **Cuerpo del Request:**

json
{
  "name": "Ash",
  "lastname": "Ketchum",
  "address": "Pallet Town",
  "rut": "12.345.678-9",
  "description": "Quiero ser el mejor entrenador",
  "idPokemonchoice": "m0GR68x7JypJirBstQAD"
}

#### Consultar Estado de Adopción

- Los entrenadores pueden consultar el estado de su solicitud utilizando el `adoptionId` que reciben al enviar la solicitud.

- **URL:** `/adoption/{adoptionId}/status`
- **Método:** `GET`
- **Respuesta Exitosa (200):** Devuelve el estado de la adopcion del pokemon.