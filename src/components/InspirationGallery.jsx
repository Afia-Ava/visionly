import React, { useState, useEffect } from 'react';
import './InspirationGallery.css';

const InspirationGallery = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const cards = [
    {
      id: 1,
      title: "Productive Workspace",
      description: "Design a workspace that fosters creativity and efficiency.",
      image: "/images/workspace.jpg",
    },
    {
      id: 2,
      title: "Healthy Habits",
      description: "Inspire your wellness journey with visuals that motivate daily healthy choices.",
      image: "/images/healthy.jpg",
    },
    {
      id: 3,
      title: "Travel Dreams",
      description: "Visualize your next adventure and keep your travel goals top of mind.",
      image: "/images/travel.jpg",
    },
    {
      id: 4,
      title: "Creative Pursuits",
      description: "Fuel your artistic side with boards dedicated to your creative passions.",
      image: "/images/creative.jpg",
    },
    {
      id: 5,
      title: "Career Aspirations",
      description: "Turn your career dreams into reality by visualizing your ideal job, workplace, or future accomplishments.",
      image: "/images/career.jpg",
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const nextIndex = (current + 1) % cards.length;
        return nextIndex;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCardChange = (index) => {
    setActiveIndex(index);
  };
  
  const handlePrevCard = () => {
    setActiveIndex((current) => {
      const prevIndex = current === 0 ? cards.length - 1 : current - 1;
      return prevIndex;
    });
  };

  const handleNextCard = () => {
    setActiveIndex((current) => {
      const nextIndex = (current + 1) % cards.length;
      return nextIndex;
    });
  };
  
  const maxIndex = cards.length - 4; // Show 4 cards at a time

  const handleNext = () => {
    setActiveIndex(idx => Math.min(idx + 1, maxIndex));
  };

  return (
    <div className="inspiration-container">
      <h1>Inspiration Gallery</h1>
      
      <div className="carousel-container">
        <button className="carousel-arrow prev-arrow" onClick={handlePrevCard}>
          <span>&#10094;</span>
        </button>
        
        <div 
          className="cards-slider" 
          style={{ transform: `translateX(-${activeIndex * 25}%)` }}
        >
          {cards.map((card) => (
            <div className="gallery-card" key={card.id}>
              <div className="card-image">
                <img src={card.image} alt={card.title} />
              </div>
              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <button className="view-button">View Board</button>
              </div>
            </div>
          ))}
        </div>
        
        <button className="carousel-arrow next-arrow" onClick={handleNextCard}>
          <span>&#10095;</span>
        </button>
        {/* Right arrow button */}
        <button
          className="gallery-right-arrow"
          onClick={handleNext}
          disabled={activeIndex === maxIndex}
        >
          &#10095;
        </button>
      </div>
      
      <div className="carousel-dots">
        {cards.map((_, index) => (
          <span 
            key={index} 
            className={`dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => handleCardChange(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default InspirationGallery;