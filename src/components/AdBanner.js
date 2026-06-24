import React, { useEffect, useState } from 'react';

const AD_CAMPAIGNS = [
  {
    id: 1,
    title: 'Mahindra Oja Tractors',
    description: 'Transform your farming with advanced automation. Get special subsidy discounts today!',
    image: 'https://images.unsplash.com/photo-1594913785162-e6785b423cb1?w=500&auto=format&fit=crop&q=60',
    link: 'https://www.mahindratractor.com',
    actionText: 'Learn More',
    badge: 'Sponsored'
  },
  {
    id: 2,
    title: 'IFFCO Nano Urea Liquid',
    description: 'Increase crop yield by up to 15% with modern liquid fertilizer. Spray now!',
    image: 'https://images.unsplash.com/photo-1563514223727-6ebe0aed6098?w=500&auto=format&fit=crop&q=60',
    link: 'https://www.iffco.in',
    actionText: 'Order Online',
    badge: 'Sponsor'
  },
  {
    id: 3,
    title: 'Kisan Drone Subsidy',
    description: 'Get up to 50% government subsidy on advanced pesticide spraying drones.',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500&auto=format&fit=crop&q=60',
    link: 'https://agricoop.nic.in',
    actionText: 'Apply Now',
    badge: 'Govt Ad'
  },
  {
    id: 4,
    title: 'Jain Drip Irrigation Systems',
    description: 'Save up to 60% water and get premium micro-irrigation solutions for all soils.',
    image: 'https://images.unsplash.com/photo-1463121088476-3fa600224b11?w=500&auto=format&fit=crop&q=60',
    link: 'https://www.jains.com',
    actionText: 'Free Quote',
    badge: 'Sponsored'
  }
];

const AdBanner = ({ position = 'banner', adClient = '', adSlot = '' }) => {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    // Select a random agricultural ad campaign
    const randomIndex = Math.floor(Math.random() * AD_CAMPAIGNS.length);
    setAd(AD_CAMPAIGNS[randomIndex]);
    
    // If real Google AdSense client & slot are provided, we can dynamically load the script
    if (adClient && adSlot) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense Error: ", e);
      }
    }
  }, [adClient, adSlot]);

  if (!ad) return null;

  // Render Real Google AdSense Banner if active
  if (adClient && adSlot) {
    return (
      <div className="ad-container adsense-banner" style={{ margin: '20px auto', textAlign: 'center', maxWidth: '100%' }}>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>ADVERTISEMENT</div>
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client={adClient}
             data-ad-slot={adSlot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    );
  }

  // Render premium custom agricultural ad banner (Monetization Slot)
  return (
    <div className={`premium-ad-card ${position}`} style={styles.adCard}>
      <div style={styles.adHeader}>
        <span style={styles.adLabel}>{ad.badge}</span>
        <span style={styles.infoLabel}>Google AdSense Placeholder / Sponsor Slot</span>
      </div>
      <div style={styles.adBody}>
        {ad.image && (
          <img src={ad.image} alt={ad.title} style={styles.adImg} />
        )}
        <div style={styles.adDetails}>
          <h4 style={styles.adTitle}>{ad.title}</h4>
          <p style={styles.adDesc}>{ad.description}</p>
        </div>
        <a href={ad.link} target="_blank" rel="noopener noreferrer" style={styles.adBtn}>
          {ad.actionText}
        </a>
      </div>
    </div>
  );
};

const styles = {
  adCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '16px',
    padding: '12px 16px',
    margin: '20px auto',
    maxWidth: '960px',
    width: '95%',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    boxSizing: 'border-box',
    fontFamily: 'sans-serif'
  },
  adHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '4px'
  },
  adLabel: {
    fontSize: '9px',
    color: '#10b981',
    fontWeight: 'bold',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    border: '1px solid #10b981',
    padding: '1px 5px',
    borderRadius: '4px',
    background: 'rgba(16, 185, 129, 0.1)'
  },
  infoLabel: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.4)'
  },
  adBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  adImg: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  adDetails: {
    flex: '1',
    minWidth: '200px'
  },
  adTitle: {
    margin: '0 0 4px 0',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 'bold'
  },
  adDesc: {
    margin: '0',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '12px',
    lineHeight: '1.4'
  },
  adBtn: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '8px 16px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
  }
};

export default AdBanner;
