// src/components/guides/AddGuideForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../dashboard/AdminSidebar';

import { guideService } from '../../services/guideService';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiBook,
  FiDollarSign,
  FiUpload,
  FiX,
  FiCheck,
  FiSave,
  FiArrowLeft,
  FiCamera,
  FiInfo,
  FiCalendar,
  FiCheckCircle,
  FiFileText,
  FiHome,
  FiAward,
  FiMessageSquare
} from 'react-icons/fi';
import './AddGuideForm.css';

const AddGuideForm = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    age: '',
    nationalite: '',
    cin: '',
    ville: '',
    region: '',
    langues: [],
    experience: '',
    description: '',
    tarifHoraire: '',
    tarifDemiJournee: '',
    tarifJournee: '',
    telephone: '',
    email: '',
    adresse: '',
    actif: true,
    specialite: '',
    certifications: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [langueInput, setLangueInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});

  const villesMaroc = [
    'Tétouan', 'Tanger', 'Casablanca', 'Rabat', 'Marrakech',
    'Fès', 'Meknès', 'Agadir', 'Oujda', 'Essaouira',
    'Chefchaouen', 'Asilah', 'Larache', 'Al Hoceima', 'El Jadida',
    'Taza', 'Nador', 'Settat', 'Kénitra', 'Béni Mellal'
  ];

  const languesDisponibles = [
    'Français', 'Anglais', 'Espagnol', 'Allemand', 
    'Italien', 'Arabe', 'Amazigh', 'Portugais', 'Russe',
    'Chinois', 'Japonais', 'Coréen'
  ];

  const specialites = [
    'Guide Historique',
    'Guide Culturel',
    'Guide Nature',
    'Guide Gastronomique',
    'Guide Artistique',
    'Guide Architecturale',
    'Guide Religieux',
    'Guide Aventure'
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.prenom.trim()) errors.prenom = 'Le prénom est requis';
      if (!formData.nom.trim()) errors.nom = 'Le nom est requis';
      if (!formData.age || formData.age < 18) errors.age = 'L\'âge doit être au moins 18 ans';
      if (!formData.nationalite.trim()) errors.nationalite = 'La nationalité est requise';
      if (!formData.cin.trim()) errors.cin = 'Le CIN est requis';
    }
    
    if (step === 2) {
      if (!formData.telephone.trim()) errors.telephone = 'Le téléphone est requis';
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email invalide';
      if (!formData.ville) errors.ville = 'La ville est requise';
      if (!formData.adresse.trim()) errors.adresse = 'L\'adresse est requise';
    }
    
    if (step === 3) {
      if (formData.langues.length === 0) errors.langues = 'Sélectionnez au moins une langue';
      if (!formData.experience) errors.experience = 'L\'expérience est requise';
      if (!formData.description.trim() || formData.description.length < 50) errors.description = 'Description trop courte (min 50 caractères)';
    }
    
    if (step === 4) {
      if (!formData.tarifHoraire || formData.tarifHoraire <= 0) errors.tarifHoraire = 'Tarif horaire invalide';
      if (!formData.tarifDemiJournee || formData.tarifDemiJournee <= 0) errors.tarifDemiJournee = 'Tarif demi-journée invalide';
      if (!formData.tarifJournee || formData.tarifJournee <= 0) errors.tarifJournee = 'Tarif journée invalide';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 5));
      setError(null);
    }
  };

  const prevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('⚠️ L\'image est trop grande. Veuillez choisir une image de moins de 5MB.');
        e.target.value = null;
        return;
      }
      
      // Vérifier le type de fichier
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('⚠️ Format d\'image non supporté. Utilisez JPG, PNG ou GIF.');
        e.target.value = null;
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLangue = (langue) => {
    if (langue && !formData.langues.includes(langue)) {
      setFormData(prev => ({
        ...prev,
        langues: [...prev.langues, langue]
      }));
      setLangueInput('');
      setFormErrors(prev => ({ ...prev, langues: '' }));
    }
  };

  const removeLangue = (langue) => {
    setFormData(prev => ({
      ...prev,
      langues: prev.langues.filter(l => l !== langue)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate all steps
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        setActiveStep(step);
        setError('Veuillez corriger les erreurs dans le formulaire.');
        setLoading(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      
      // Ajouter tous les champs texte
      Object.keys(formData).forEach(key => {
        if (key === 'langues') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'photo') {
          // Géré séparément
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Ajouter l'image si sélectionnée
      if (selectedFile) {
        formDataToSend.append('photo', selectedFile);
      }

      const response = await guideService.createGuide(formDataToSend);
      
      if (response.success) {
        setSuccess('✅ Guide créé avec succès ! Redirection...');
        setTimeout(() => {
          navigate('/admin/guides');
        }, 2000);
      } else {
        throw new Error(response.message || 'Erreur lors de la création');
      }
      
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création du guide');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Les modifications ne seront pas enregistrées.')) {
      navigate('/admin/guides');
    }
  };

  return (
    <div className="modern-admin-layout">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`admin-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      
        
        <main className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1>Ajouter un Nouveau Guide</h1>
              <p className="welcome-text">Remplissez tous les champs requis pour créer un nouveau guide sur la plateforme</p>
            </div>
            <div className="header-actions">
              <button 
                className="btn-secondary"
                onClick={handleCancel}
              >
                <FiArrowLeft size={16} />
                <span>Retour</span>
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="form-progress">
            <div className="progress-steps">
              {[1, 2, 3, 4, 5].map(step => (
                <div key={step} className={`step ${step === activeStep ? 'active' : ''} ${step < activeStep ? 'completed' : ''}`}>
                  <div className="step-circle">
                    {step < activeStep ? <FiCheck size={16} /> : step}
                  </div>
                  <div className="step-label">
                    {step === 1 && 'Informations'}
                    {step === 2 && 'Contact'}
                    {step === 3 && 'Compétences'}
                    {step === 4 && 'Tarifs'}
                    {step === 5 && 'Confirmation'}
                  </div>
                </div>
              ))}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(activeStep - 1) * 25}%` }}
              ></div>
            </div>
          </div>

          {/* Form Container */}
          <div className="form-container">
            {error && (
              <div className="alert error">
                <FiInfo size={20} />
                <div>
                  <strong>Erreur</strong>
                  <p>{error}</p>
                </div>
                <button onClick={() => setError(null)} className="alert-close">
                  <FiX size={16} />
                </button>
              </div>
            )}
            
            {success && (
              <div className="alert success">
                <FiCheckCircle size={20} />
                <div>
                  <strong>Succès</strong>
                  <p>{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="modern-guide-form" encType="multipart/form-data">
              {/* Step 1: Informations Personnelles */}
              {activeStep === 1 && (
                <div className="form-step">
                  <div className="step-header">
                    <div className="step-icon">
                      <FiUser size={24} />
                    </div>
                    <div>
                      <h2>Informations Personnelles</h2>
                      <p>Les informations de base du guide</p>
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        <FiUser size={16} />
                        <span>Prénom <span className="required">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        placeholder="Ex: Ahmed"
                        className={`form-input ${formErrors.prenom ? 'error' : ''}`}
                      />
                      {formErrors.prenom && <div className="error-message">{formErrors.prenom}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <FiUser size={16} />
                        <span>Nom <span className="required">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Ex: Benani"
                        className={`form-input ${formErrors.nom ? 'error' : ''}`}
                      />
                      {formErrors.nom && <div className="error-message">{formErrors.nom}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <FiCalendar size={16} />
                        <span>Âge <span className="required">*</span></span>
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="18"
                        max="100"
                        placeholder="Ex: 35"
                        className={`form-input ${formErrors.age ? 'error' : ''}`}
                      />
                      {formErrors.age && <div className="error-message">{formErrors.age}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <FiGlobe size={16} />
                        <span>Nationalité <span className="required">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="nationalite"
                        value={formData.nationalite}
                        onChange={handleChange}
                        placeholder="Ex: Marocaine"
                        className={`form-input ${formErrors.nationalite ? 'error' : ''}`}
                      />
                      {formErrors.nationalite && <div className="error-message">{formErrors.nationalite}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <FiFileText size={16} />
                        <span>CIN <span className="required">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="cin"
                        value={formData.cin}
                        onChange={handleChange}
                        placeholder="Ex: AB123456"
                        className={`form-input ${formErrors.cin ? 'error' : ''}`}
                      />
                      {formErrors.cin && <div className="error-message">{formErrors.cin}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <FiAward size={16} />
                        <span>Spécialité</span>
                      </label>
                      <select
                        name="specialite"
                        value={formData.specialite}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="">Sélectionnez une spécialité</option>
                        {specialites.map((spec, index) => (
                          <option key={index} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group full-width">
                      <label className="form-label">
                        <FiCamera size={16} />
                        <span>Photo du Guide</span>
                      </label>
                      <div className="photo-upload-container">
                        <div className="photo-preview-container">
                          {imagePreview ? (
                            <div className="photo-preview">
                              <img src={imagePreview} alt="Preview" />
                              <button 
                                type="button" 
                                className="remove-photo"
                                onClick={() => {
                                  setSelectedFile(null);
                                  setImagePreview(null);
                                }}
                              >
                                <FiX size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="photo-placeholder">
                              <FiCamera size={32} />
                              <p>Aucune image sélectionnée</p>
                            </div>
                          )}
                        </div>
                        <label className="upload-btn">
                          <FiUpload size={16} />
                          <span>Choisir une image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file-input"
                            hidden
                          />
                        </label>
                        <p className="upload-info">
                          Formats acceptés: JPG, PNG, GIF • Max 5MB • Ratio recommandé: 1:1
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact & Localisation */}
              {activeStep === 2 && (
                <div className="form-step">
                  <div className="step-header">
                    <div className="step-icon">
                      <FiHome size={24} />
                    </div>
                    <div>
                      <h2>Contact & Localisation</h2>
                      <p>Informations de contact et d'adresse</p>
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        <FiPhone size={16} />
                        <span>Téléphone <span className="required">*</span></span>
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        placeholder="Ex: +212 612 345 678"
                        className={`form-input ${formErrors.telephone ? 'error' : ''}`}
                      />
                      {formErrors.telephone && <div className="error-message">{formErrors.telephone}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <FiMail size={16} />
                        <span>Email <span className="required">*</span></span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ex: guide@example.com"
                        className={`form-input ${formErrors.email ? 'error' : ''}`}
                      />
                      {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <FiMapPin size={16} />
                        <span>Ville <span className="required">*</span></span>
                      </label>
                      <select
                        name="ville"
                        value={formData.ville}
                        onChange={handleChange}
                        className={`form-input ${formErrors.ville ? 'error' : ''}`}
                      >
                        <option value="">Sélectionnez une ville</option>
                        {villesMaroc.map((ville, index) => (
                          <option key={index} value={ville}>{ville}</option>
                        ))}
                      </select>
                      {formErrors.ville && <div className="error-message">{formErrors.ville}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <FiMapPin size={16} />
                        <span>Région <span className="required">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        placeholder="Ex: Tanger-Tétouan-Al Hoceima"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label className="form-label">
                        <FiHome size={16} />
                        <span>Adresse complète <span className="required">*</span></span>
                      </label>
                      <textarea
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Ex: Avenue Mohammed V, 93000 Tétouan"
                        className={`form-textarea ${formErrors.adresse ? 'error' : ''}`}
                      />
                      {formErrors.adresse && <div className="error-message">{formErrors.adresse}</div>}
                    </div>
                    
                    <div className="form-group full-width">
                      <label className="form-label">
                        <FiAward size={16} />
                        <span>Certifications & Diplômes</span>
                      </label>
                      <textarea
                        name="certifications"
                        value={formData.certifications}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Ex: Licence en Tourisme, Certification Guide Officiel..."
                        className="form-textarea"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Compétences & Expérience */}
              {activeStep === 3 && (
                <div className="form-step">
                  <div className="step-header">
                    <div className="step-icon">
                      <FiBook size={24} />
                    </div>
                    <div>
                      <h2>Compétences & Expérience</h2>
                      <p>Langues, expérience et description</p>
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">
                        <FiGlobe size={16} />
                        <span>Langues Parlées <span className="required">*</span></span>
                      </label>
                      <div className="languages-container">
                        <div className="languages-tags">
                          {formData.langues.map((langue, index) => (
                            <span key={index} className="language-tag">
                              {langue}
                              <button 
                                type="button" 
                                onClick={() => removeLangue(langue)}
                                className="tag-remove"
                              >
                                <FiX size={12} />
                              </button>
                            </span>
                          ))}
                          {formData.langues.length === 0 && (
                            <span className="no-languages">Aucune langue sélectionnée</span>
                          )}
                        </div>
                        <div className="language-selector">
                          <select
                            value={langueInput}
                            onChange={(e) => setLangueInput(e.target.value)}
                            className="language-select"
                          >
                            <option value="">Sélectionnez une langue</option>
                            {languesDisponibles.map((langue, index) => (
                              <option key={index} value={langue}>{langue}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => addLangue(langueInput)}
                            className="add-language-btn"
                            disabled={!langueInput}
                          >
                            Ajouter
                          </button>
                        </div>
                        {formErrors.langues && <div className="error-message">{formErrors.langues}</div>}
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <FiCalendar size={16} />
                        <span>Expérience (années) <span className="required">*</span></span>
                      </label>
                      <div className="experience-input">
                        <input
                          type="range"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          min="0"
                          max="30"
                          className="experience-slider"
                        />
                        <div className="experience-display">
                          <span className="experience-value">{formData.experience || 0} ans</span>
                          <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            min="0"
                            max="30"
                            className="experience-input-number"
                            placeholder="Ex: 5"
                          />
                        </div>
                      </div>
                      {formErrors.experience && <div className="error-message">{formErrors.experience}</div>}
                    </div>
                    
                    <div className="form-group full-width">
                      <label className="form-label">
                        <FiMessageSquare size={16} />
                        <span>Description <span className="required">*</span></span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="6"
                        placeholder="Décrivez l'expérience, les spécialités, les qualifications du guide...
Ex: Guide expérimenté avec une passion pour l'histoire de la Médina de Tétouan. Spécialisé dans les visites culturelles et gastronomiques..."
                        className={`form-textarea ${formErrors.description ? 'error' : ''}`}
                      />
                      <div className="textarea-footer">
                        <span className={`char-count ${formData.description.length > 500 ? 'error' : ''}`}>
                          {formData.description.length}/500 caractères
                        </span>
                        {formErrors.description && <div className="error-message">{formErrors.description}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Tarifs */}
              {activeStep === 4 && (
                <div className="form-step">
                  <div className="step-header">
                    <div className="step-icon">
                      <FiDollarSign size={24} />
                    </div>
                    <div>
                      <h2>Tarifs & Disponibilités</h2>
                      <p>Définissez les tarifs pour vos services</p>
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div className="pricing-card">
                      <div className="pricing-header">
                        <div className="pricing-icon">
                          <FiDollarSign size={20} />
                        </div>
                        <div>
                          <h3>Tarif Horaire</h3>
                          <p>Prix pour 1 heure de guidage</p>
                        </div>
                      </div>
                      <div className="pricing-input">
                        <input
                          type="number"
                          name="tarifHoraire"
                          value={formData.tarifHoraire}
                          onChange={handleChange}
                          placeholder="150.00"
                          min="0"
                          className={`form-input ${formErrors.tarifHoraire ? 'error' : ''}`}
                        />
                        <span className="currency">MAD</span>
                      </div>
                      {formErrors.tarifHoraire && <div className="error-message">{formErrors.tarifHoraire}</div>}
                    </div>
                    
                    <div className="pricing-card">
                      <div className="pricing-header">
                        <div className="pricing-icon">
                          <FiDollarSign size={20} />
                        </div>
                        <div>
                          <h3>Tarif Demi-Journée</h3>
                          <p>Prix pour 4 heures de guidage</p>
                        </div>
                      </div>
                      <div className="pricing-input">
                        <input
                          type="number"
                          name="tarifDemiJournee"
                          value={formData.tarifDemiJournee}
                          onChange={handleChange}
                          placeholder="500.00"
                          min="0"
                          className={`form-input ${formErrors.tarifDemiJournee ? 'error' : ''}`}
                        />
                        <span className="currency">MAD</span>
                      </div>
                      {formErrors.tarifDemiJournee && <div className="error-message">{formErrors.tarifDemiJournee}</div>}
                    </div>
                    
                    <div className="pricing-card">
                      <div className="pricing-header">
                        <div className="pricing-icon">
                          <FiDollarSign size={20} />
                        </div>
                        <div>
                          <h3>Tarif Journée</h3>
                          <p>Prix pour 8 heures de guidage</p>
                        </div>
                      </div>
                      <div className="pricing-input">
                        <input
                          type="number"
                          name="tarifJournee"
                          value={formData.tarifJournee}
                          onChange={handleChange}
                          placeholder="800.00"
                          min="0"
                          className={`form-input ${formErrors.tarifJournee ? 'error' : ''}`}
                        />
                        <span className="currency">MAD</span>
                      </div>
                      {formErrors.tarifJournee && <div className="error-message">{formErrors.tarifJournee}</div>}
                    </div>
                    
                    <div className="form-group full-width">
                      <div className="status-toggle">
                        <label className="toggle-label">
                          <input
                            type="checkbox"
                            name="actif"
                            checked={formData.actif}
                            onChange={handleChange}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                          <span className="toggle-text">
                            {formData.actif ? 'Guide actif' : 'Guide inactif'}
                          </span>
                        </label>
                        <p className="toggle-description">
                          {formData.actif 
                            ? 'Le guide sera visible et disponible pour les réservations immédiatement'
                            : 'Le guide sera créé mais ne sera pas visible sur la plateforme'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Confirmation */}
              {activeStep === 5 && (
                <div className="form-step">
                  <div className="step-header">
                    <div className="step-icon">
                      <FiCheckCircle size={24} />
                    </div>
                    <div>
                      <h2>Confirmation</h2>
                      <p>Vérifiez les informations avant de créer le guide</p>
                    </div>
                  </div>
                  
                  <div className="confirmation-summary">
                    <div className="summary-section">
                      <h3>Informations Personnelles</h3>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <strong>Nom complet:</strong>
                          <span>{formData.prenom} {formData.nom}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Âge:</strong>
                          <span>{formData.age} ans</span>
                        </div>
                        <div className="summary-item">
                          <strong>CIN:</strong>
                          <span>{formData.cin}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Nationalité:</strong>
                          <span>{formData.nationalite}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="summary-section">
                      <h3>Contact & Localisation</h3>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <strong>Email:</strong>
                          <span>{formData.email}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Téléphone:</strong>
                          <span>{formData.telephone}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Ville:</strong>
                          <span>{formData.ville}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Adresse:</strong>
                          <span>{formData.adresse}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="summary-section">
                      <h3>Compétences</h3>
                      <div className="summary-grid">
                        <div className="summary-item full-width">
                          <strong>Langues:</strong>
                          <span>{formData.langues.join(', ') || 'Aucune'}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Expérience:</strong>
                          <span>{formData.experience} ans</span>
                        </div>
                        <div className="summary-item">
                          <strong>Statut:</strong>
                          <span className={`status ${formData.actif ? 'active' : 'inactive'}`}>
                            {formData.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="summary-section">
                      <h3>Tarifs</h3>
                      <div className="pricing-summary">
                        <div className="price-item">
                          <span>Horaire:</span>
                          <strong>{formData.tarifHoraire} MAD</strong>
                        </div>
                        <div className="price-item">
                          <span>Demi-journée:</span>
                          <strong>{formData.tarifDemiJournee} MAD</strong>
                        </div>
                        <div className="price-item">
                          <span>Journée:</span>
                          <strong>{formData.tarifJournee} MAD</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="form-actions">
                {activeStep > 1 && (
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    <FiArrowLeft size={16} />
                    <span>Précédent</span>
                  </button>
                )}
                
                <div className="actions-right">
                  {activeStep < 5 ? (
                    <button 
                      type="button" 
                      onClick={nextStep}
                      className="btn-primary"
                      disabled={loading}
                    >
                      <span>Suivant</span>
                      <FiArrowLeft size={16} className="rotate-180" />
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="spinner"></div>
                          <span>Création en cours...</span>
                        </>
                      ) : (
                        <>
                          <FiSave size={16} />
                          <span>Créer le Guide</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddGuideForm;