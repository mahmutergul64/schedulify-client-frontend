import React, { useState } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';

export default function ProfileUpload({ userId, onUpload }) {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`https://schedulify-backend-dgce.onrender.com/api/profile/${userId}/avatar`, formData);
      onUpload(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <label className="cursor-pointer bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 transition-all">
      <Upload className="w-5 h-5" />
      <input type="file" className="hidden" onChange={handleFileChange} />
    </label>
  );
}