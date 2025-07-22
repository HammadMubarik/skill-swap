import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    skillsOffered: '',
    skillsWanted: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      skillsOffered: formData.skillsOffered
        .split(',')
        .map(skill => skill.trim())
        .filter(s => s),
      skillsWanted: formData.skillsWanted
        .split(',')
        .map(skill => skill.trim())
        .filter(s => s)
    };

    try {
      const res = await registerUser(payload);
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        alert('Registered successfully');
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Something went wrong.'));
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
