// Achievement Badges System

window.achievementBadges = (function() {
  // Badge definitions with descriptions
  const badgeDefinitions = {
    // Streak badges
    'streak3': {
      name: '3-Day Streak',
      icon: '🔥',
      description: 'Maintained focus for 3 days in a row',
      category: 'bronze'
    },
    'streak7': {
      name: '7-Day Streak',
      icon: '🔥',
      description: 'Maintained focus for 7 days in a row',
      category: 'silver'
    },
    'streak30': {
      name: '30-Day Streak',
      icon: '🔥',
      description: 'Maintained focus for 30 days in a row',
      category: 'gold'
    },
    
    // Goal badges
    'firstGoal': {
      name: 'First Goal',
      icon: '🎯',
      description: 'Completed your first goal',
      category: 'bronze'
    },
    'fiveGoals': {
      name: 'Goal Setter',
      icon: '🎯',
      description: 'Completed 5 goals',
      category: 'silver'
    },
    'tenGoals': {
      name: 'Goal Master',
      icon: '🎯',
      description: 'Completed 10 goals',
      category: 'gold'
    },
    
    // Journal badges
    'journalEntries': {
      name: 'Reflector',
      icon: '📝',
      description: 'Created 5 journal entries',
      category: 'bronze'
    },
    'journalMaster': {
      name: 'Journal Master',
      icon: '📝',
      description: 'Created 20 journal entries',
      category: 'silver'
    },
    
    // Focus badges
    'focusHours': {
      name: 'Focus Starter',
      icon: '⏱️',
      description: 'Accumulated 10 hours of focus time',
      category: 'bronze'
    },
    'focusMaster': {
      name: 'Focus Master',
      icon: '⏱️',
      description: 'Accumulated 50 hours of focus time',
      category: 'silver'
    },
    'focusGuru': {
      name: 'Focus Guru',
      icon: '⏱️',
      description: 'Accumulated 100 hours of focus time',
      category: 'gold'
    },
    
    // Special badges
    'futureMessage': {
      name: 'Time Traveler',
      icon: '✉️',
      description: 'Sent a message to your future self',
      category: 'silver'
    },
    'multiBoard': {
      name: 'Visionary',
      icon: '🌈',
      description: 'Created 3 different vision boards',
      category: 'silver'
    }
  };

  // Store for earned badges
  let earnedBadges = {};
  
  // Initialize from localStorage if available
  function init() {
    try {
      const saved = localStorage.getItem('visionlyEarnedBadges');
      if (saved) {
        earnedBadges = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading badges from localStorage:', e);
    }
  }
  
  // Save to localStorage
  function saveEarnedBadges() {
    try {
      localStorage.setItem('visionlyEarnedBadges', JSON.stringify(earnedBadges));
    } catch (e) {
      console.error('Error saving badges to localStorage:', e);
    }
  }
  
  // Check if a badge has been earned
  function hasBadge(badgeId) {
    return !!earnedBadges[badgeId];
  }
  
  // Unlock a badge
  function unlockBadge(badgeId) {
    if (badgeDefinitions[badgeId] && !hasBadge(badgeId)) {
      earnedBadges[badgeId] = {
        dateEarned: new Date().toISOString(),
        isNew: true
      };
      saveEarnedBadges();
      showNotification(badgeId);
      return true;
    }
    return false;
  }
  
  // Modified: Create badge element for DOM with external description
  function createBadgeElement(badgeId, isLocked = false) {
    const badgeDef = badgeDefinitions[badgeId];
    
    if (!badgeDef) return null;
    
    // Create a wrapper for the badge and description
    const badgeWrapper = document.createElement('div');
    badgeWrapper.className = 'badge-wrapper';
    
    // Create the badge
    const badgeOuter = document.createElement('div');
    badgeOuter.className = `badge-outer ${isLocked ? 'badge-locked' : ''} ${hasBadge(badgeId) && earnedBadges[badgeId].isNew ? 'badge-new' : ''} ${badgeDef.category ? 'badge-' + badgeDef.category : ''}`;
    
    const badgeRim = document.createElement('div');
    badgeRim.className = 'badge-rim';
    
    const badgeInner = document.createElement('div');
    badgeInner.className = 'badge-inner';
    
    const badgeShine = document.createElement('div');
    badgeShine.className = 'badge-shine';
    
    const badgeIcon = document.createElement('div');
    badgeIcon.className = 'badge-icon';
    badgeIcon.textContent = badgeDef.icon;
    
    badgeInner.appendChild(badgeIcon);
    
    badgeOuter.appendChild(badgeRim);
    badgeOuter.appendChild(badgeInner);
    badgeOuter.appendChild(badgeShine);
    
    // Create the description subheading
    const badgeDesc = document.createElement('div');
    badgeDesc.className = 'badge-description';
    badgeDesc.textContent = isLocked ? 'Locked' : badgeDef.name;
    
    // Add tooltip for locked badges or for more details
    if (isLocked) {
      const badgeTooltip = document.createElement('div');
      badgeTooltip.className = 'badge-tooltip';
      badgeTooltip.style.display = 'none';
      badgeTooltip.textContent = badgeDef.description;
      badgeOuter.appendChild(badgeTooltip);
      
      // Show tooltip on hover for locked badges
      badgeOuter.addEventListener('mouseenter', () => {
        badgeTooltip.style.display = 'block';
      });
      
      badgeOuter.addEventListener('mouseleave', () => {
        badgeTooltip.style.display = 'none';
      });
    }
    
    // Add click event
    badgeOuter.addEventListener('click', function() {
      if (!isLocked) {
        this.classList.add('badge-clicked');
        setTimeout(() => this.classList.remove('badge-clicked'), 300);
        
        // If it's a new badge, mark it as seen
        if (hasBadge(badgeId) && earnedBadges[badgeId].isNew) {
          earnedBadges[badgeId].isNew = false;
          this.classList.remove('badge-new');
          saveEarnedBadges();
        }
      }
    });
    
    // Append both to wrapper
    badgeWrapper.appendChild(badgeOuter);
    badgeWrapper.appendChild(badgeDesc);
    
    return badgeWrapper;
  }
  
  // Render all badges to a container
  function renderBadges(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Create badge elements in category groups
    const categories = {
      'gold': [],
      'silver': [],
      'bronze': [],
      'special': []
    };
    
    // Sort badges by category
    Object.keys(badgeDefinitions).forEach(badgeId => {
      const badgeDef = badgeDefinitions[badgeId];
      const category = badgeDef.category || 'special';
      
      if (hasBadge(badgeId)) {
        categories[category].push(createBadgeElement(badgeId, false));
      } else {
        categories[category].push(createBadgeElement(badgeId, true));
      }
    });
    
    // Add section for each category
    const categoryOrder = ['gold', 'silver', 'bronze', 'special'];
    const categoryLabels = {
      'gold': 'Gold Achievements',
      'silver': 'Silver Achievements',
      'bronze': 'Bronze Achievements',
      'special': 'Special Achievements'
    };
    
    categoryOrder.forEach(category => {
      if (categories[category].length > 0) {
        // Add category heading
        const catHeading = document.createElement('h3');
        catHeading.textContent = categoryLabels[category];
        catHeading.className = 'badge-category-title';
        container.appendChild(catHeading);
        
        // Add category container
        const catContainer = document.createElement('div');
        catContainer.className = 'badge-category-container';
        
        categories[category].forEach(badge => {
          if (badge) catContainer.appendChild(badge);
        });
        
        container.appendChild(catContainer);
      }
    });
  }
  
  // Show notification when a badge is unlocked - keep emoji only style
  function showNotification(badgeId) {
    const badgeDef = badgeDefinitions[badgeId];
    if (!badgeDef) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'badge-unlock-notification';
    
    // Create notification content
    const content = document.createElement('div');
    content.className = 'notification-content';
    
    // Add badge icon/image - large emoji
    const badgeImage = document.createElement('div');
    badgeImage.className = `badge-notification-image badge-${badgeDef.category || 'special'}`;
    badgeImage.textContent = badgeDef.icon;
    badgeImage.style.fontSize = '40px'; // Make emoji larger
    badgeImage.style.padding = '10px';
    badgeImage.style.borderRadius = '50%';
    badgeImage.style.background = 'linear-gradient(135deg, #8b5fb3 0%, #3a2259 100%)';
    badgeImage.style.color = 'white';
    badgeImage.style.width = '50px';
    badgeImage.style.height = '50px';
    badgeImage.style.display = 'flex';
    badgeImage.style.alignItems = 'center';
    badgeImage.style.justifyContent = 'center';
    
    const textContainer = document.createElement('div');
    textContainer.className = 'notification-text';
    
    const title = document.createElement('h4');
    title.textContent = 'Achievement Unlocked!';
    
    const desc = document.createElement('p');
    desc.textContent = badgeDef.name;
    
    textContainer.appendChild(title);
    textContainer.appendChild(desc);
    
    content.appendChild(badgeImage);
    content.appendChild(textContainer);
    notification.appendChild(content);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
      notification.classList.add('notification-hide');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 4000);
  }
  
  // Public API
  return {
    init,
    unlockBadge,
    hasBadge,
    renderBadges
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  window.achievementBadges.init();
});
