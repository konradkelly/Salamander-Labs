import { useEffect, useState } from 'react';
import { getVideos } from '../mockApi.js';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    getVideos()
    .then((data) => {
      setVideos(data); setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setError(err.message);
      setLoading(false);
    });
  }, []);

 if (loading) {
    return <p>Loading videos...</p>;
  }

  if (error) {
    return <p role="alert">Error: {error}</p>;
  }

  return (
    <div>
      <h1>Available Videos</h1>
      <ul>
        {videos.map((filename) => (
          <li key={filename}>
      <Link to={`/preview/${filename}`}>{filename}</Link>
        </li>
          
        ))}
      </ul>
    </div>
  );
}