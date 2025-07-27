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
    skillsWanted: ''
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
