import { Cat, Dog, type LucideIcon } from "lucide-react";

/**
 * Cara de la especie. En el perfil y en la tarjeta de adopcion sustituye al
 * punto que separaba raza de especie, asi que identifica en vez de sumar: el
 * mismo perro se lee igual en las dos superficies y el punto no se pierde.
 *
 * Es un `Record` exportado y no una funcion `speciesFace()` a proposito: la
 * regla `react-hooks/static-components` no acepta resolver un componente con una
 * llamada durante el render, pero si leer una referencia estable de un objeto de
 * modulo, que es justo lo que ya hace `meta.icon` en `PetStateBanner`. Cualquier
 * especie sin entrada devuelve `undefined` y el llamador conserva el punto.
 */
export const SPECIES_FACE: Record<string, LucideIcon> = {
  perro: Dog,
  gato: Cat,
};
