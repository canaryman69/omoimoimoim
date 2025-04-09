import React, { useState, useEffect } from 'react';
import { create } from 'zustand';

// Store for game time
interface GameTimeState {
  minutes: number;
  hours: number;
  day: number;
  
  // Time updates
  tick: () => void;
  isDaytime: () => boolean;
  getTimeString: () => string;
  getTimeOfDayPhase: () => 'dawn' | 'day' | 'dusk' | 'night';
}

// Create the time store
export const useGameTime = create<GameTimeState>((set, get) => ({
  minutes: 0,
  hours: 6, // Start at 6:00 AM
  day: 1,
  
  tick: () => set(state => {
    // Update minutes
    let newMinutes = state.minutes + 5; // 5-minute increments
    let newHours = state.hours;
    let newDay = state.day;
    
    // Handle minute overflow
    if (newMinutes >= 60) {
      newMinutes = 0;
      newHours += 1;
      
      // Handle hour overflow
      if (newHours >= 24) {
        newHours = 0;
        newDay += 1;
      }
    }
    
    return {
      minutes: newMinutes,
      hours: newHours,
      day: newDay
    };
  }),
  
  isDaytime: () => {
    const hours = get().hours;
    return hours >= 6 && hours < 20; // 6 AM to 8 PM is daytime
  },
  
  getTimeString: () => {
    const { hours, minutes } = get();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12; // Convert 0 to 12 for display
    const paddedMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${paddedMinutes} ${period}`;
  },
  
  getTimeOfDayPhase: () => {
    const hours = get().hours;
    
    if (hours >= 5 && hours < 8) return 'dawn';
    if (hours >= 8 && hours < 18) return 'day';
    if (hours >= 18 && hours < 21) return 'dusk';
    return 'night';
  }
}));

const GameClock = () => {
  const { day, getTimeString, getTimeOfDayPhase, tick } = useGameTime();
  
  // Update time every half-second (as per requirements)
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 500); // Half-second intervals
    
    return () => clearInterval(interval);
  }, [tick]);
  
  // Color theme based on time of day
  const getClockTheme = () => {
    const phase = getTimeOfDayPhase();
    
    switch (phase) {
      case 'dawn':
        return {
          bg: 'rgba(255, 170, 120, 0.8)',
          text: '#553300',
          icon: '🌅'
        };
      case 'day':
        return {
          bg: 'rgba(120, 180, 255, 0.8)',
          text: '#002266',
          icon: '☀️'
        };
      case 'dusk':
        return {
          bg: 'rgba(255, 130, 100, 0.8)',
          text: '#552200',
          icon: '🌇'
        };
      case 'night':
        return {
          bg: 'rgba(30, 40, 80, 0.8)',
          text: '#ccddff',
          icon: '🌙'
        };
    }
  };
  
  const theme = getClockTheme();
  
  return (
    <div 
      className="game-clock"
      style={{ 
        backgroundColor: theme.bg,
        color: theme.text
      }}
    >
      <div className="time-icon">{theme.icon}</div>
      <div className="time-display">
        <div className="time">{getTimeString()}</div>
        <div className="day">Day {day}</div>
      </div>
    </div>
  );
};

export default GameClock;