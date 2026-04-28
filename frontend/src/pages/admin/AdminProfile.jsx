import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Camera, Save, ShieldCheck, Phone, Users, MapPin } from 'lucide-react';
import axios from 'axios';

export default function AdminProfile() {
  const [profileData, setProfileData] = useState({
    email: '',
    department: '',
    role: '',
    name: '',
    phone: '',
    gender: '',
    address: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      axios.get(`http://localhost:8005/users/me?email=${email}`)
        .then(res => {
          setProfileData({
            email: res.data.email,
            department: res.data.department || 'Global',
            role: res.data.role || 'Admin',
            name: res.data.name,
            phone: res.data.phone || '',
            gender: res.data.gender || 'Other',
            address: res.data.address || ''
          });
          if (res.data.photo) {
            setPhotoPreview(res.data.photo);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setPhotoPreview(base64);
        axios.put('http://localhost:8005/users/profile', {
          email: profileData.email,
          photo: base64
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put('http://localhost:8005/users/profile', {
        email: profileData.email,
        name: profileData.name,
        phone: profileData.phone,
        gender: profileData.gender,
        address: profileData.address
      });
      alert('Admin Profile synced with Database!');
    } catch (err) {
      alert('Sync failed.');
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 font-bold animate-pulse">Synchronizing Admin Identity...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10 border-b border-brand-border/50/50 pb-6">
         <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <User className="text-brand-accent" size={32} /> Administrator Profile
         </h1>
         <p className="text-gray-400 mt-2 font-medium">Manage your administrative credentials, personal information, and profile photo.</p>
      </div>
      
      <div className="glass-card backdrop-blur-xl p-8 rounded-[2rem] border border-brand-border/50/50 shadow-2xl flex flex-col md:flex-row gap-12 items-start">
         
         {/* Photo Upload Section */}
         <div className="flex flex-col items-center gap-4 w-full md:w-auto">
            <div className="relative group cursor-pointer">
               <div className="w-40 h-40 rounded-full border-4 border-brand-border/50 shadow-xl overflow-hidden bg-brand-surface flex items-center justify-center transition-all group-hover:border-brand-primary">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-gray-500 group-hover:text-brand-primary transition-colors" />
                  )}
               </div>
               <label className="absolute bottom-2 right-2 bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white p-3 rounded-full cursor-pointer hover:bg-purple-500 transition-all shadow-lg shadow-brand-primary/30 group-hover:scale-110 border-2 border-slate-900">
                  <Camera size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
               </label>
            </div>
            <div className="text-center mt-2">
               <h3 className="text-sm font-bold text-white">Profile Photo</h3>
               <p className="text-xs text-gray-500 mt-1">Stored in MongoDB Cluster.</p>
            </div>
         </div>

         {/* Profile Information Section */}
         <div className="flex-1 w-full space-y-6">
            <div className="bg-brand-bg/50 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-4">
              <ShieldCheck className="text-emerald-500 mt-1" size={24} />
              <div>
                <h4 className="text-white font-bold text-sm">Elevated Privileges Active</h4>
                <p className="text-xs text-gray-400 mt-1 font-medium">You are authenticated as an Administrator. You have system-wide access to logs, documents, and user configurations.</p>
              </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                  <User size={16} className="text-brand-primary"/> Full Name
               </label>
               <input 
                 type="text" 
                 className="w-full bg-brand-bg border border-brand-border/50 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600" 
                 placeholder="Your Name"
                 value={profileData.name}
                 onChange={(e) => setProfileData({...profileData, name: e.target.value})}
               />
            </div>
            
            <div>
               <label className="block text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-brand-primary"/> Email Address
               </label>
               <input 
                 type="email" 
                 readOnly
                 className="w-full bg-brand-bg/50 border border-slate-800 rounded-xl py-3.5 px-4 text-gray-500 font-medium cursor-not-allowed" 
                 value={profileData.email}
               />
               <p className="text-[10px] text-gray-500 mt-2 ml-1">Administrative emails cannot be changed directly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                     <Briefcase size={16} className="text-brand-primary"/> Role
                  </label>
                  <input 
                    type="text" 
                    readOnly
                    className="w-full bg-brand-bg/50 border border-slate-800 rounded-xl py-3.5 px-4 text-gray-500 font-medium cursor-not-allowed" 
                    value={profileData.role}
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                     <Phone size={16} className="text-brand-primary"/> Phone Number
                  </label>
                  <input 
                    type="tel" 
                    className="w-full bg-brand-bg border border-brand-border/50 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-500" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                     <Users size={16} className="text-brand-primary"/> Gender
                  </label>
                  <select 
                    className="w-full bg-brand-bg border border-brand-border/50 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer" 
                    value={profileData.gender}
                    onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                  >
                     <option value="Male" className="bg-brand-bg">Male</option>
                     <option value="Female" className="bg-brand-bg">Female</option>
                     <option value="Other" className="bg-brand-bg">Other</option>
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-brand-primary"/> Residential Address
               </label>
               <textarea 
                 className="w-full bg-brand-bg border border-brand-border/50 rounded-xl py-3.5 px-4 text-white font-medium focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-500 min-h-[100px] resize-none" 
                 value={profileData.address}
                 onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                 placeholder="Your full address..."
               />
            </div>

            <div className="pt-6 flex justify-end">
               <button onClick={handleSave} className="bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent hover:bg-purple-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2 hover:-translate-y-0.5">
                 <Save size={18} /> Sync to Database
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}




