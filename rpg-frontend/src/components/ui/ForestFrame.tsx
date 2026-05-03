import React from 'react';

interface ForestFrameProps {
  children: React.ReactNode;
}

// Ovi stilovi su ključni. Možete ih staviti i u globalni CSS.
const frameStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none', // Veoma važno! Omogućava kliktanje "kroz" okvir.
};

const cornerStyle: React.CSSProperties = {
  position: 'absolute',
  width: '150px', // Podesite veličinu vaših slika za uglove
  height: '150px',
  zIndex: 10,
};

export default function ForestFrame({ children }: ForestFrameProps) {
  return (
    // Glavni kontejner. Mora biti 'relative' da bi deca bila 'absolute' unutar njega.
    // Mora zauzimati ceo ekran.
    <div className="relative w-full h-full">
      {/* Ovde se renderuje vaš ekran (MainMenu, MapScreen...) */}
      <main className="w-full h-full">{children}</main>

      {/* Sloj sa okvirima preko svega */}
      <div style={frameStyle}>
        {/* Uglovi */}
        <img 
          src="/assets/frame-corner-tl.png" // Slika gornjeg levog ugla
          style={{ ...cornerStyle, top: 0, left: 0 }} 
          alt="frame" 
        />
        <img 
          src="/assets/frame-corner-tr.png" // Slika gornjeg desnog ugla
          style={{ ...cornerStyle, top: 0, right: 0 }} 
          alt="frame" 
        />
        <img 
          src="/assets/frame-corner-bl.png" // Slika donjeg levog ugla
          style={{ ...cornerStyle, bottom: 0, left: 0 }} 
          alt="frame" 
        />
        <img 
          src="/assets/frame-corner-br.png" // Slika donjeg desnog ugla
          style={{ ...cornerStyle, bottom: 0, right: 0 }} 
          alt="frame" 
        />
        {/* Ovde možete dodati i slike za gornju/donju/levu/desnu ivicu ako ih imate */}
      </div>
    </div>
  );
}