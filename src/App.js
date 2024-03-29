import React, { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar';
import Searchbar from './components/Searchbar';
import  Pokedex  from './components/Pokedex';
import { getPokemons, getPokemonData, searchPokemon } from './api';
import { FavoriteProvider } from './contexts/favoriteContext';


const App =() => {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pokemons, setPokemons] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notFound, setNotFound] = useState(false);

  

const itensPerPage = 25
 const fetchPokemons = async () => {
  try {
    setLoading(true)
    setNotFound(false)
    const data = await getPokemons(itensPerPage, itensPerPage * page )
    const promises = data.results.map(async (pokemon) => {
      return await getPokemonData(pokemon.url)
    });

    const results = await Promise.all(promises)
    setPokemons(results);
    setLoading(false);
    setTotalPages(Math.ceil(data.count / itensPerPage))
  } catch (error) {
    console.log("fetchPokemons error", error);
  }
 }

 useEffect(() => {
  fetchPokemons();
}, [page]);

  const updateFavoritePokemons = (name) => {
    const updatedFavorites =  [...favorites]
    const favoriteIndex = favorites.indexOf(name)
    if(favoriteIndex >= 0) {
      updatedFavorites.slice(favoriteIndex, 1);
    }else {
      updatedFavorites.push(name)
    }
    setFavorites(updatedFavorites)
  }

  const onSearchHandler = async (pokemon) => {
    if(!pokemon) {
      return fetchPokemons();
    }

    setLoading(true)
    setNotFound(false)
    const result = await searchPokemon(pokemon)
    if(!result) {
      setNotFound(true)
    } else {
      setPokemons([result])
      setPage(0)
      setTotalPages(1)
    }
    setLoading(false)

  }
  return (
    <FavoriteProvider
      value={{
      favoritePokemons: favorites,
       updateFavoritePokemons: updateFavoritePokemons}}>
    <div>
        <Navbar/>
        <Searchbar onSearch={onSearchHandler} />
        {notFound ? (
          <div className="not-found-text"> Não encontrado!!</div>
        ) :
        (<Pokedex
        pokemons={pokemons}
        loading={loading}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        />
      )}
      <div className='App'>
      </div>
    </div>
  </FavoriteProvider>
  )
}

export default App;
