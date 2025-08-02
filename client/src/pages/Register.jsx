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
  const [error, setError] = useState('');

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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="page-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password:</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Skills you offer (comma-separated):</label>
            <input
              name="skillsOffered"
              type="text"
              value={formData.skillsOffered}
              onChange={handleChange}
              placeholder="e.g. JavaScript, Design, Marketing"
            />
          </div>
          
          <div className="form-group">
            <label>Skills you want (comma-separated):</label>
            <input
              name="skillsWanted"
              type="text"
              value={formData.skillsWanted}
              onChange={handleChange}
              placeholder="e.g. Python, Photography, Writing"
            />
          </div>
          
          {/* Distance matching preferences */}
          <div className="card">
            <h3>Matching Preferences</h3>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="useDistanceMatching"
                  checked={formData.useDistanceMatching}
                  onChange={handleChange}
                />
                Enable distance-based matching
              </label>
            </div>
            
            {formData.useDistanceMatching && (
              <div className="form-group">
                <label>
                  Max distance (km): 
                  <input
                    type="number"
                    name="maxMatchDistance"
                    min="1"
                    max="10000"
                    value={formData.maxMatchDistance}
                    onChange={handleChange}
                  />
                </label>
                <small>Location: {coords ? '✅ Detected' : '❌ Not available'}</small>
              </div>
            )}
          </div>
          
          <button type="submit" className="btn btn-primary">Register</button>
          
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Register;