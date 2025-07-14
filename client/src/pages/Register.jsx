import { useState } from 'react'
import axios from 'axios'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    skills: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData)
      alert('✅ Registered successfully!')
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Something went wrong.'))
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required /><br /><br />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} required /><br /><br />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} required /><br /><br />
        <input name="skills" placeholder="Skills (comma-separated)" onChange={handleChange} /><br /><br />
        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default Register
