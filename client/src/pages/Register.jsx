import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';

const Register = () => {
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    skillsOffered: '',
    skillsWanted: '',
    useDistanceMatching: false,
    maxMatchDistance: 50
  });

  // Get location 
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      },
      (err) => {
        console.warn("Geolocation error or denied:", err.message);
        setCoords(null); 
      }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      ...formData,
      skillsOffered: formData.skillsOffered || '',
      skillsWanted: formData.skillsWanted || '',
      latitude: coords?.latitude,
      longitude: coords?.longitude
    };

    const res = await registerUser(payload);
    if (res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      alert('Registered successfully');
      navigate('/dashboard');
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <br /><br />
        <input
          name="email"
          placeholder="Email"
          type="email"
          onChange={handleChange}
          required
        />
        <br /><br />
        <input
          name="password"
          placeholder="Password"
          type="password"
          onChange={handleChange}
          required
        />
        <br /><br />
        <input
          name="skillsOffered"
          placeholder="Skills you offer (comma-separated)"
          onChange={handleChange}
        />
        <br /><br />
        <input
          name="skillsWanted"
          placeholder="Skills you want (comma-separated)"
          onChange={handleChange}
        />
        <br /><br />
        
        <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
          <h3>Matching Preferences</h3>
          <label>
            <input
              type="checkbox"
              name="useDistanceMatching"
              checked={formData.useDistanceMatching}
              onChange={handleChange}
            />
            Enable distance-based matching
          </label>
          <br /><br />
          
          {formData.useDistanceMatching && (
            <div>
              <label>
                Max distance (km): 
                <input
                  type="number"
                  name="maxMatchDistance"
                  min="1"
                  max="10000"
                  value={formData.maxMatchDistance}
                  onChange={handleChange}
                  style={{ marginLeft: '10px', width: '80px' }}
                />
              </label>
              <br />
              <small>Location: {coords ? ' Detected' : ' Not available'}</small>
            </div>
          )}
        </div>
        
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
