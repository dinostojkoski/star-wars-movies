import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import InfiniteScroll from 'react-infinite-scroll-component';

// GraphQL query to fetch Star Wars films
const GET_FILMS = gql`
  query GetFilms {
    allFilms {
      films {
        episodeID
        title
        director
        releaseDate
        producers
      }
    }
  }
`;

const App = () => {
  const { loading, error, data } = useQuery(GET_FILMS);

  // State for filters, sorting, and pagination
  const [directorFilter, setDirectorFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortField, setSortField] = useState('title');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (loading) return <div className="text-center my-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">Error: {error.message}</div>;

  const filteredFilms = data.allFilms.films.filter((film) => {
    return (
        (directorFilter ? film.director.toLowerCase().includes(directorFilter.toLowerCase()) : true) &&
        (yearFilter ? new Date(film.releaseDate).getFullYear().toString() === yearFilter : true)
    );
});


  // Sort films based on the selected field
  const sortedFilms = [...filteredFilms].sort((a, b) => {
    if (sortField === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortField === 'releaseDate') {
      return new Date(a.releaseDate) - new Date(b.releaseDate);
    }
    return 0;
  });

  console.log("Director Filter:", directorFilter);
  console.log("Year Filter:", yearFilter);

  // Paginate the sorted films
  const paginatedFilms = sortedFilms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className='container my-4'>
      <Navbar></Navbar>

      {/* Filters */}
      <div className='mt-4 row'>
        <label class=" col form-label m-2">
          Filter by Director:
          <input
            type="text"
            value={directorFilter}
            onChange={(e) => setDirectorFilter(e.target.value)}
            class="form-control mt-2 border border-secondary-subtle"
          />
        </label>
        <label class="col form-label m-2">
          Filter by Release Year:
          <input
            type="number"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            class="form-control mt-2 border border-secondary-subtle"
          />
        </label>

        {/* Sorting */}
        <label class="col form-label m-2">
          Sort by:
          <select value={sortField} onChange={(e) => setSortField(e.target.value)} class="form-select mt-2 border border-secondary-subtle">
          <option value="title">Title</option>
          <option value="releaseDate">Release Date</option>
          </select>
        </label>
      </div>

      <h1 className="text-center my-4 display-5">Star Wars Movies</h1>

      <InfiniteScroll
        dataLength={paginatedFilms.length}
        next={() => setCurrentPage(currentPage + 1)}
        hasMore={currentPage * itemsPerPage < sortedFilms.length}
        loader={<h4>Loading...</h4>}>
        
        {paginatedFilms.map((film) => (
          <div className="col-md-4 mb-4" key={film.episodeID}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{film.title}</h5>
                <h6 className="card-subtitle mb-2 text-muted">Episode: {film.episodeID}</h6>
                <p className="card-text">
                  <strong>Director:</strong> {film.director}
                </p>
                <p className="card-text">
                  <strong>Release Date:</strong>{' '}
                  {new Date(film.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="card-text">
                  <strong>Producers:</strong> {film.producers.join(', ')}
                </p>
                </div>
              </div>
            </div>
          ))}
      </InfiniteScroll>

      {/* Pagination */}
      <div className='text-center'>
        <button onClick={() => setCurrentPage(currentPage - 1)} 
          disabled={currentPage === 1}
          className='btn btn-outline-primary mx-1'>
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage * itemsPerPage >= sortedFilms.length}
          className='btn btn-outline-secondary mx-1'
        >
          Next
        </button>
      </div>
      
    </div>
  );
};

export default App;