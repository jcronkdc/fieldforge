/**
 * Safe Landing Page - Minimal version to test if basic rendering works
 */

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AuthForm } from "../auth/AuthForm";

export function SafeLanding() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #1e1b4b, #000000, #0c4a6e)',
      color: 'white',
      padding: '2rem'
    }}>
      {/* Simple Header */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>MythaTron</span>
        </div>
        <button 
          onClick={() => setShowAuth(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#8b5cf6',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Sign In
        </button>
      </nav>

      {/* Simple Hero */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        textAlign: 'center',
        padding: '4rem 0'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          marginBottom: '1.5rem',
          fontWeight: 'bold'
        }}>
          Create Stories That Come Alive
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          marginBottom: '3rem',
          opacity: 0.8,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          The world's first AI-powered creative platform where stories evolve, 
          characters think, and writers earn real rewards.
        </p>
        
        {/* Beta Info */}
        <div style={{
          display: 'inline-block',
          padding: '1rem 2rem',
          background: 'rgba(139, 92, 246, 0.2)',
          borderRadius: '1rem',
          marginBottom: '2rem'
        }}>
          <strong>Beta Testing:</strong> Limited to 100 users • 500 Free Sparks on signup
        </div>

        {/* CTA Button */}
        <div>
          <button 
            onClick={() => setShowAuth(true)}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.125rem',
              fontWeight: 'bold'
            }}
          >
            Join Beta Now
          </button>
        </div>
      </div>

      {/* Simple Features List */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '4rem auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem'
      }}>
        {[
          { title: 'Angry Lips', desc: 'Multiplayer story battles' },
          { title: 'Story Battles', desc: 'Compete with AI judges' },
          { title: 'Get Paid', desc: '40% revenue share' },
          { title: 'RPG System', desc: 'Level up your writing' }
        ].map(feature => (
          <div key={feature.title} style={{
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
            <p style={{ opacity: 0.7 }}>{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div 
          onClick={() => setShowAuth(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '500px',
              background: '#1a1a1a',
              borderRadius: '1rem',
              padding: '2rem',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowAuth(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <AuthForm variant="panel" />
          </div>
        </div>
      )}
    </div>
  );
}
