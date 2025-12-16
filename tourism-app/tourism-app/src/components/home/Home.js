import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCamera, FaUtensils, FaHotel, FaCompass, FaArrowRight, FaStar } from 'react-icons/fa';
import Navbar from '../common/Navbar';
import './Home.css';

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [featuredSpots] = useState([
    {
      id: 1,
      title: "Médina Classée UNESCO",
      description: "Découvrez la perle blanche du Maroc",
      image: "https://images.unsplash.com/photo-1543423924-b9f161af87e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 4.8
    },
    {
      id: 2,
      title: "Souk Traditionnel",
      description: "Artisanat et saveurs authentiques",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 4.6
    },
    {
      id: 3,
      title: "Place Hassan II",
      description: "Cœur historique de Tétouan",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 4.7
    }
  ]);

  const [categories] = useState([
    { icon: <FaMapMarkerAlt />, title: "Monuments", count: "24 lieux", color: "#2ecc71" },
    { icon: <FaUtensils />, title: "Restaurants", count: "18 adresses", color: "#27ae60" },
    { icon: <FaCamera />, title: "Photos", count: "120 spots", color: "#219653" },
    { icon: <FaHotel />, title: "Hébergements", count: "12 riads", color: "#1e874b" }
  ]);

  const heroImages = [
    "https://www.reseau-euromed.org/wp-content/uploads/2016/10/t%C3%A9touan1.jpg",
    "https://www.tripsavvy.com/thmb/WN-XR-M8hO5fWBHsVoXbXHwQaqc=/2134x1405/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-529753056-5b151e708e1b6e00365e7aba.jpg",
    "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/b1a97d158042533.6384a6c5830a5.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="home-container">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-images">
          {heroImages.map((img, index) => (
            <div 
              key={index}
              className={`hero-image ${index === currentImageIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-subtitle">Bienvenue à</span>
              TÉTOUAN
              <span className="hero-tagline">La Perle Blanche du Maroc</span>
            </h1>
            <p className="hero-description">
              Explorez la médina classée UNESCO, découvrez l'artisanat traditionnel 
              et plongez dans l'histoire andalouse-marocaine
            </p>
            <div className="hero-buttons">
              <Link to="/explore" className="btn-primary">
                <FaCompass /> Commencer l'exploration
                <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/map" className="btn-secondary">
                <FaMapMarkerAlt /> Voir la carte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Explorez par catégorie</h2>
          <p>Découvrez tous les trésors de la médina</p>
        </div>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div 
              key={index}
              className="category-card"
              style={{ '--card-color': category.color } }
            >
              <div className="category-icon" style={{ color: category.color }}>
                {category.icon}
              </div>
              <h3>{category.title}</h3>
              <p>{category.count}</p>
              <div className="category-wave"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Spots */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Incontournables de Tétouan</h2>
          <p>Les lieux les plus populaires</p>
        </div>
        <div className="spots-grid">
          {featuredSpots.map((spot) => (
            <div key={spot.id} className="spot-card">
              <div className="spot-image" style={{ backgroundImage: `url(${spot.image})` }}>
                <div className="spot-rating">
                  <FaStar /> {spot.rating}
                </div>
              </div>
              <div className="spot-content">
                <h3>{spot.title}</h3>
                <p>{spot.description}</p>
                <Link to={`/spot/${spot.id}`} className="spot-link">
                  Découvrir <FaArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Prêt à explorer la médina ?</h2>
          <p>Téléchargez notre guide audio ou rejoignez une visite guidée</p>
          <div className="cta-buttons">
            <button className="btn-outline">
              <FaCamera /> Visite Virtuelle
            </button>
            <button className="btn-primary">
              Guide Audio <FaArrowRight />
            </button>
          </div>
        </div>
        <div className="cta-pattern"></div>
      </section>
    </div>
  );
};

export default Home;