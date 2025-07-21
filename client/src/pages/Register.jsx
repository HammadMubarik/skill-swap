import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
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
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        skillsOffered: formData.skillsOffered
          .split(',')
          .map((skill) => skill.trim())
          .filter((s) => s),
        skillsWanted: formData.skillsWanted
          .split(',')
          .map((skill) => skill.trim())
          .filter((s) => s)
      };

      const res = await axios.post('http://localhost:5000/api/auth/register', payload);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        alert('✅ Registered successfully!');
        window.location.href = '/dashboard';
      }
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Something went wrong.'));
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
        required />
        <br /><br />
        <input name="email" 
        placeholder="Email" 
        type="email" 
        onChange={handleChange} 
        required />
        <br /><br />
        <input name="password"
         placeholder="Password" 
         type="password" 
         onChange={handleChange} 
         required /><br /><br />
        <input
          name="skillsOffered"
          placeholder="Skills you offer (comma-separated)"
          onChange={handleChange}
        /><br /><br />
        <input
          name="skillsWanted"
          placeholder="Skills you want (comma-separated)"
          onChange={handleChange}
        /><br /><br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
