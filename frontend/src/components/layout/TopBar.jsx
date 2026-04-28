import React from 'react';

const TopBar = () => {
  return (
    <header
      className="flex justify-between items-center h-16 px-6 w-full sticky top-0 z-40 font-public-sans"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #c4c6cf',
      }}
    >
      {/* Left: Brand + Hamburger */}
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded transition-colors" style={{ color: '#74777f' }}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="text-lg font-bold hidden md:block" style={{ color: '#1f3a5f' }}>
          Transporte Aragua
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-6 hidden lg:block">
        <div className="relative">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px]"
            style={{ color: '#74777f' }}
          >
            search
          </span>
          <input
            className="w-full py-2 pl-10 pr-4 text-sm rounded-xl transition-all outline-none"
            style={{
              backgroundColor: '#f3f4f4',
              border: '1px solid #c4c6cf',
              color: '#191c1c',
              fontFamily: "'Public Sans', sans-serif",
            }}
            placeholder="Buscar registros, placas u operadores..."
            type="text"
            onFocus={(e) => { e.target.style.borderColor = '#032448'; }}
            onBlur={(e)  => { e.target.style.borderColor = '#c4c6cf'; }}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full transition-colors relative"
          style={{ color: '#74777f' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {/* Notification dot */}
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white"
            style={{ backgroundColor: '#ba1a1a' }}
          />
        </button>

        {/* Settings */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
          style={{ color: '#74777f' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px mx-1 hidden sm:block" style={{ backgroundColor: '#c4c6cf' }} />

        {/* Avatar */}
        <button
          className="w-8 h-8 rounded-full overflow-hidden ml-1 border-2 transition-all"
          style={{ borderColor: '#c4c6cf' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#032448'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#c4c6cf'; }}
        >
          <img
            alt="User profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuASXzk329dDELhSgn7D0XWAwfJNriRDpxVjR6Zx2YNYn6MZEPq-2CvCCE5pdjR4ROi8FG1budkREkyQD4sb1wtQEYtXtTxeMmC5nVmc77DOnv_DyolQ37KujCO9cfElUjxnXeeI-tqVz65N2Gouc-GCpS1Rfn5y81PoKg_9VOd9K2bGilE5MDAVbKTTSN6H6dMRwOKV9xJHN-tgkRkDrGf2hN2oS-hsnVbu-lTvFJd6_cIrrBZnGYlO2RmY8d2pYjHKIZkVpxN10_I"
          />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
